/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Explicit Profile repository functions backed by Azure Table Storage,
// replacing repository/model/Profile.mjs. Azure Table only indexes
// PartitionKey+RowKey, so external-id lookup needs its own index table
// (ProfileByExternalId) alongside the canonical Profiles table -- the
// denormalization Microsoft's table design guide recommends in place of a
// secondary index. See: https://learn.microsoft.com/en-us/azure/storage/tables/table-storage-design-guidelines

import { createHash, randomUUID } from "crypto";
import { odata } from "@azure/data-tables";
import { getTableClient, isNotFoundError } from "./tableClient.mjs";

export const PROFILES_TABLE = "Profiles";
export const PROFILE_BY_EXTERNAL_ID_TABLE = "ProfileByExternalId";
export const PROFILE_DISCLOSURES_TABLE = "ProfileDisclosures";
const PROFILE_ROW_KEY = "profile";

export interface ProfileRecord {
  internalId: string;
  externalId: string;
  createdAt: string;
}

interface ProfileByExternalIdEntity {
  partitionKey: string;
  rowKey: string;
  internal_id?: string;
  external_id?: string;
  // Read compatibility for entities created earlier on this branch.
  internalId?: string;
  externalId?: string;
  createdAt: string;
}

// Profiles rows also carry the display name and email from the sign-in token, for the share list.
interface ProfileEntity extends ProfileByExternalIdEntity {
  name?: string;
  email?: string;
}

export interface ProfileDetails {
  name?: string;
  email?: string;
}

export interface ProfileListItem {
  id: string;
  name: string;
  isNameShared: boolean;
}

function anonymousName(internalId: string): string {
  const code = createHash("sha256").update(internalId).digest("hex").slice(0, 4).toUpperCase();
  return `Person ${code}`;
}

export interface EnsureProfileResult {
  profile: ProfileRecord;
  created: boolean;
}

function isConflictError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { statusCode?: number }).statusCode === 409;
}

function toProfileRecord(entity: ProfileByExternalIdEntity): ProfileRecord {
  const internalId = entity.internal_id ?? entity.internalId;
  const externalId = entity.external_id ?? entity.externalId;
  if (!internalId || !externalId) throw new Error("Invalid profile entity");
  return { internalId, externalId, createdAt: entity.createdAt };
}

// Merge upsert: creates the Profiles row if it is missing and refreshes the name/email from the token.
// It replaces an insert that failed with 409 on every request for existing users, so the call count is unchanged.
// A missing claim is left out of the write, so it never clears a stored value.
async function upsertProfile(profile: ProfileRecord, details: ProfileDetails): Promise<void> {
  const profilesClient = await getTableClient(PROFILES_TABLE);
  const entity: ProfileEntity = {
    partitionKey: profile.internalId,
    rowKey: PROFILE_ROW_KEY,
    internal_id: profile.internalId,
    external_id: profile.externalId,
    createdAt: profile.createdAt,
  };
  if (details.name) entity.name = details.name;
  if (details.email) entity.email = details.email;
  await profilesClient.upsertEntity(entity, "Merge");
}

export async function ensureProfile(externalId: string, details: ProfileDetails = {}): Promise<EnsureProfileResult> {
  const byExternalIdClient = await getTableClient(PROFILE_BY_EXTERNAL_ID_TABLE);

  const candidate: ProfileByExternalIdEntity = {
    partitionKey: externalId,
    rowKey: PROFILE_ROW_KEY,
    internal_id: randomUUID(),
    external_id: externalId,
    createdAt: new Date().toISOString(),
  };

  try {
    // createEntity is insert-only: it fails if the row already exists, so
    // this is also the concurrency-safe "claim externalId" step -- the
    // first caller to land here wins the internalId for this profile.
    await byExternalIdClient.createEntity(candidate);
  } catch (err) {
    if (!isConflictError(err)) throw err;
    const existing = await byExternalIdClient.getEntity<ProfileByExternalIdEntity>(externalId, PROFILE_ROW_KEY);
    const profile = toProfileRecord(existing);
    await upsertProfile(profile, details);
    return { profile, created: false };
  }

  const profile = toProfileRecord(candidate);
  await upsertProfile(profile, details);
  return { profile, created: true };
}

export async function getProfileByInternalId(internalId: string): Promise<ProfileRecord | null> {
  const client = await getTableClient(PROFILES_TABLE);
  try {
    const entity = await client.getEntity<ProfileByExternalIdEntity>(internalId, PROFILE_ROW_KEY);
    return toProfileRecord(entity);
  } catch (err) {
    if (isNotFoundError(err)) return null;
    throw err;
  }
}

export async function assertProfileExists(internalId: string): Promise<void> {
  if (!(await getProfileByInternalId(internalId))) {
    throw new Error(`Profile not found for profileId: ${internalId}`);
  }
}

/**
 * Profiles a question can be shared with: those that have a name, excluding the caller, sorted by name.
 * Profiles only get a name from a signed-in user's token, so test and service identities never appear.
 */
export async function shareName(senderId: string, receiverId: string): Promise<void> {
  if (senderId === receiverId) throw new Error("A profile cannot share its name with itself");
  await assertProfileExists(receiverId);
  const client = await getTableClient(PROFILE_DISCLOSURES_TABLE);
  await client.upsertEntity({
    partitionKey: receiverId,
    rowKey: senderId,
    sharedAt: new Date().toISOString(),
  });
}

export async function listProfiles(excludeInternalId: string, limit = 200, identityBlind = false): Promise<ProfileListItem[]> {
  const client = await getTableClient(PROFILES_TABLE);
  const disclosures = await getTableClient(PROFILE_DISCLOSURES_TABLE);
  const sharedNames = new Set<string>();
  for await (const row of disclosures.listEntities({ queryOptions: { filter: odata`PartitionKey eq ${excludeInternalId}` } })) {
    sharedNames.add(row.rowKey);
  }
  // ponytail: this scans every named profile (one partition each); add paging or search when the list outgrows `limit`.
  const rows = client.listEntities<ProfileEntity>({
    queryOptions: { filter: odata`name gt ''`, select: ["internal_id", "internalId", "name", "email"] },
  });
  const profiles: ProfileListItem[] = [];
  for await (const row of rows) {
    const id = row.internal_id ?? row.internalId;
    if (!id || !row.name || id === excludeInternalId) continue;
    const isNameShared = !identityBlind || sharedNames.has(id);
    profiles.push({ id, name: isNameShared ? row.name : anonymousName(id), isNameShared });
  }
  // Sort before capping, so the cap keeps the first names alphabetically rather than an arbitrary id range.
  return profiles.sort((a, b) => a.name.localeCompare(b.name)).slice(0, limit);
}
