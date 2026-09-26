/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */
export declare const PROFILES_TABLE = "Profiles";
export declare const PROFILE_BY_EXTERNAL_ID_TABLE = "ProfileByExternalId";
export interface ProfileRecord {
    internalId: string;
    externalId: string;
    createdAt: string;
}
export interface EnsureProfileResult {
    profile: ProfileRecord;
    created: boolean;
}
export declare function ensureProfile(externalId: string): Promise<EnsureProfileResult>;
export declare function getProfileByInternalId(internalId: string): Promise<ProfileRecord | null>;
