/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import container from "../di/diContainer.mjs";
import { requestHandler } from "../handler/handlerWrapper.mjs";
import { ensureProfile } from "../service/profile.mjs";

describe("ensureProfile", () => {
  const findOrCreate = vi.fn();

  beforeEach(() => {
    findOrCreate.mockReset();
    container.singletons.set("models", {
      Profile: { findOrCreate },
    });
  });

  it("creates a profile with matching internal and external IDs", async () => {
    const id = "8bc796d2-4731-4d0b-8299-1d1a067c4be7";
    findOrCreate.mockResolvedValue([{ internal_id: id, external_id: id }, true]);

    const result = await ensureProfile(id);

    expect(findOrCreate).toHaveBeenCalledWith({
      where: { internal_id: id },
      defaults: { internal_id: id, external_id: id },
    });
    expect(result.created).toBe(true);
  });

  it("reuses an existing profile", async () => {
    const id = "8bc796d2-4731-4d0b-8299-1d1a067c4be7";
    findOrCreate.mockResolvedValue([{ internal_id: id, external_id: id }, false]);

    const result = await ensureProfile(id);

    expect(result.created).toBe(false);
  });

  it("rejects a missing authenticated profile ID", async () => {
    await expect(ensureProfile()).rejects.toMatchObject({ status: 401 });
    expect(findOrCreate).not.toHaveBeenCalled();
  });

  it("rejects a malformed authenticated profile ID", async () => {
    await expect(ensureProfile("not-a-uuid")).rejects.toMatchObject({ status: 401 });
    expect(findOrCreate).not.toHaveBeenCalled();
  });

  it("rejects a conflicting external ID", async () => {
    const id = "8bc796d2-4731-4d0b-8299-1d1a067c4be7";
    findOrCreate.mockResolvedValue([
      {
        internal_id: id,
        external_id: "63fddfe4-b1c2-4314-a65c-f4f3fba185b6",
      },
      false,
    ]);

    await expect(ensureProfile(id)).rejects.toMatchObject({ status: 409 });
  });

  it("ensures the JWT profile before an authenticated Q3 handler runs", async () => {
    const id = "8bc796d2-4731-4d0b-8299-1d1a067c4be7";
    findOrCreate.mockResolvedValue([{ internal_id: id, external_id: id }, true]);
    container.singletons.set("authProvider", {
      decode: vi.fn().mockResolvedValue({ oid: id }),
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
      return: { profileId: id, profileCreated: true },
    });
  });
});
