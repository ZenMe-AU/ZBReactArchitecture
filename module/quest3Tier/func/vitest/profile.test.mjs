/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import container from "../di/diContainer.mjs";
import { requestHandler } from "../handler/handlerWrapper.mjs";
import { ensureProfile } from "../service/profile.mjs";

const { ensureProfileRow } = vi.hoisted(() => ({
  ensureProfileRow: vi.fn(),
}));

vi.mock("../dist/repository/table/profileRepository.mjs", () => ({
  ensureProfile: ensureProfileRow,
}));

describe("ensureProfile", () => {
  beforeEach(() => {
    ensureProfileRow.mockReset();
  });

  it("creates a profile with a generated internal ID when none exists", async () => {
    const externalId = "8bc796d2-4731-4d0b-8299-1d1a067c4be7";
    const internalId = "63fddfe4-b1c2-4314-a65c-f4f3fba185b6";
    ensureProfileRow.mockResolvedValue({ profile: { internalId, externalId }, created: true });

    const result = await ensureProfile(externalId);

    expect(ensureProfileRow).toHaveBeenCalledWith(externalId, {});
    expect(result.profile.internal_id).toBe(internalId);
    expect(result.created).toBe(true);
  });

  it("reuses the first existing profile for the external ID", async () => {
    const externalId = "8bc796d2-4731-4d0b-8299-1d1a067c4be7";
    const firstProfile = {
      internal_id: "63fddfe4-b1c2-4314-a65c-f4f3fba185b6",
      external_id: externalId,
    };
    ensureProfileRow.mockResolvedValue({
      profile: { internalId: firstProfile.internal_id, externalId: firstProfile.external_id },
      created: false,
    });

    const result = await ensureProfile(externalId);

    expect(result.profile).toEqual(firstProfile);
    expect(result.created).toBe(false);
  });

  it("passes the name and email through to the repository", async () => {
    const externalId = "8bc796d2-4731-4d0b-8299-1d1a067c4be7";
    const details = { name: "Jane Doe", email: "jane.doe@example.com" };
    ensureProfileRow.mockResolvedValue({ profile: { internalId: "63fddfe4-b1c2-4314-a65c-f4f3fba185b6", externalId }, created: false });

    await ensureProfile(externalId, details);

    expect(ensureProfileRow).toHaveBeenCalledWith(externalId, details);
  });

  it("rejects a missing authenticated profile ID", async () => {
    await expect(ensureProfile()).rejects.toMatchObject({ status: 401 });
    expect(ensureProfileRow).not.toHaveBeenCalled();
  });

  it("rejects a malformed authenticated profile ID", async () => {
    await expect(ensureProfile("not-a-uuid")).rejects.toMatchObject({ status: 401 });
    expect(ensureProfileRow).not.toHaveBeenCalled();
  });

  it("passes the Quest3 internal profile ID to an authenticated handler", async () => {
    const externalId = "8bc796d2-4731-4d0b-8299-1d1a067c4be7";
    const internalId = "63fddfe4-b1c2-4314-a65c-f4f3fba185b6";
    ensureProfileRow.mockResolvedValue({ profile: { internalId, externalId }, created: false });
    container.singletons.set("authProvider", {
      decode: vi.fn().mockResolvedValue({ oid: externalId, name: "Jane Doe", upn: "jane.doe@example.com" }),
    });

    const handler = requestHandler(async (request) => ({
      return: {
        profileId: request.userData.profileId,
        profileCreated: request.userData.profileCreated,
      },
    }));
    const request = {
      method: "GET",
      url: "http://localhost/profile",
      headers: new Headers({
        authorization: "Bearer valid-test-token",
        "X-Correlation-Id": "0123456789abcdef0123456789abcdef",
      }),
    };

    const response = await handler(request, {
      invocationId: "profile-test",
      functionName: "EnsureProfileTest",
    });

    expect(response.status).toBe(200);
    expect(ensureProfileRow).toHaveBeenCalledWith(externalId, { name: "Jane Doe", email: "jane.doe@example.com" });
    expect(response.jsonBody).toEqual({
      success: true,
      return: { profileId: internalId, profileCreated: false },
    });
  });
});
