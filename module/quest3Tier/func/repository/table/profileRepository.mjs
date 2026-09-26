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
function isConflictError(err) {
    return typeof err === "object" && err !== null && err.statusCode === 409;
}
export async function ensureProfile(externalId) {
    const byExternalIdClient = await getTableClient(PROFILE_BY_EXTERNAL_ID_TABLE);
    const candidate = {
        partitionKey: externalId,
        rowKey: PROFILE_ROW_KEY,
        internalId: randomUUID(),
        externalId,
        createdAt: new Date().toISOString(),
    };
    try {
        // createEntity is insert-only: it fails if the row already exists, so
        // this is also the concurrency-safe "claim externalId" step -- the
        // first caller to land here wins the internalId for this profile.
        await byExternalIdClient.createEntity(candidate);
    }
    catch (err) {
        if (!isConflictError(err))
            throw err;
        const existing = await byExternalIdClient.getEntity(externalId, PROFILE_ROW_KEY);
        return { profile: { internalId: existing.internalId, externalId: existing.externalId, createdAt: existing.createdAt }, created: false };
    }
    const profilesClient = await getTableClient(PROFILES_TABLE);
    await profilesClient.createEntity({
        partitionKey: candidate.internalId,
        rowKey: PROFILE_ROW_KEY,
        internalId: candidate.internalId,
        externalId: candidate.externalId,
        createdAt: candidate.createdAt,
    });
    return { profile: { internalId: candidate.internalId, externalId: candidate.externalId, createdAt: candidate.createdAt }, created: true };
}
export async function getProfileByInternalId(internalId) {
    const client = await getTableClient(PROFILES_TABLE);
    try {
        const entity = await client.getEntity(internalId, PROFILE_ROW_KEY);
        return { internalId: entity.internalId, externalId: entity.externalId, createdAt: entity.createdAt };
    }
    catch (err) {
        if (isNotFoundError(err))
            return null;
        throw err;
    }
}
