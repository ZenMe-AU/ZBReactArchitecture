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

import { randomUUID } from "crypto";
import { getTableClient, isNotFoundError } from "./tableClient.mjs";

export const PROFILES_TABLE = "Profiles";
export const PROFILE_BY_EXTERNAL_ID_TABLE = "ProfileByExternalId";
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

async function createProfileIfMissing(profile: ProfileRecord): Promise<void> {
  const profilesClient = await getTableClient(PROFILES_TABLE);
  try {
    await profilesClient.createEntity({
      partitionKey: profile.internalId,
      rowKey: PROFILE_ROW_KEY,
      internal_id: profile.internalId,
      external_id: profile.externalId,
      createdAt: profile.createdAt,
    });
  } catch (err) {
    if (!isConflictError(err)) throw err;
  }
}

export async function ensureProfile(externalId: string): Promise<EnsureProfileResult> {
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
    await createProfileIfMissing(profile);
    return { profile, created: false };
  }

  const profile = toProfileRecord(candidate);
  await createProfileIfMissing(profile);
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
