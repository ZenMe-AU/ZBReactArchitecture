/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import container from "../di/diContainer.mjs";
import { requestHandler } from "../handler/handlerWrapper.mjs";
import { ensureProfile } from "../service/profile.mjs";

describe("ensureProfile", () => {
  const findOne = vi.fn();
  const create = vi.fn();

  beforeEach(() => {
    findOne.mockReset();
    create.mockReset();
    container.singletons.set("models", {
      Profile: { findOne, create },
    });
  });

  it("creates a profile with a generated internal ID when none exists", async () => {
    const externalId = "8bc796d2-4731-4d0b-8299-1d1a067c4be7";
    const internalId = "63fddfe4-b1c2-4314-a65c-f4f3fba185b6";
    findOne.mockResolvedValue(null);
    create.mockResolvedValue({ internal_id: internalId, external_id: externalId });

    const result = await ensureProfile(externalId);

    expect(findOne).toHaveBeenCalledWith({
      where: { external_id: externalId },
      order: [
        ["createdAt", "ASC"],
        ["internal_id", "ASC"],
      ],
    });
    expect(create).toHaveBeenCalledWith({ external_id: externalId });
    expect(result.profile.internal_id).toBe(internalId);
    expect(result.created).toBe(true);
  });

  it("reuses the first existing profile for the external ID", async () => {
    const externalId = "8bc796d2-4731-4d0b-8299-1d1a067c4be7";
    const firstProfile = {
      internal_id: "63fddfe4-b1c2-4314-a65c-f4f3fba185b6",
      external_id: externalId,
    };
    findOne.mockResolvedValue(firstProfile);

    const result = await ensureProfile(externalId);

    expect(result.profile).toBe(firstProfile);
    expect(result.created).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects a missing authenticated profile ID", async () => {
    await expect(ensureProfile()).rejects.toMatchObject({ status: 401 });
    expect(findOne).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects a malformed authenticated profile ID", async () => {
    await expect(ensureProfile("not-a-uuid")).rejects.toMatchObject({ status: 401 });
    expect(findOne).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("passes the Quest3 internal profile ID to an authenticated handler", async () => {
    const externalId = "8bc796d2-4731-4d0b-8299-1d1a067c4be7";
    const internalId = "63fddfe4-b1c2-4314-a65c-f4f3fba185b6";
    findOne.mockResolvedValue({ internal_id: internalId, external_id: externalId });
    container.singletons.set("authProvider", {
      decode: vi.fn().mockResolvedValue({ oid: externalId }),
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
    expect(response.jsonBody).toEqual({
      success: true,
      return: { profileId: internalId, profileCreated: false },
    });
  });
});
