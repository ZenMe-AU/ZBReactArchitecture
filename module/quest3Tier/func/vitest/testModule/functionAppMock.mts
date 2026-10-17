/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { vi } from "vitest";

const registrations = vi.hoisted(() => ({
  handlers: new Map<string, Function>(),
}));

vi.mock("@azure/functions", () => ({
  app: {
    http: (name: string, options: { handler: Function }) => {
      registrations.handlers.set(name, options.handler);
    },
    openAPIPath: (name: string, _summary: string, options: { handler: Function }) => {
      registrations.handlers.set(name, options.handler);
    },
  },
}));

vi.mock("../../swagger/openapi.mjs", () => ({}));

// Importing the route verifies that all functions can still be registered without
// starting the Functions host. The tests invoke the underlying handlers directly.
await import("../../route.mjs");
const { startupPromise } = await import("../../di/diInit.mjs");
await startupPromise;

export const invokeHandler = async (
  handler: Function,
  {
    profileId,
    params = {},
    clientParams = {},
    correlationId = "vitest-correlation-id",
  }: {
    profileId: string;
    params?: Record<string, string>;
    clientParams?: Record<string, unknown>;
    correlationId?: string;
  }
) =>
  handler(
    {
      method: "vitest",
      url: "http://vitest.local",
      headers: new Headers({ "x-correlation-id": correlationId }),
      params,
      clientParams,
      correlationId,
      userData: { profileId },
    },
    {
      invocationId: "vitest-invocation",
      functionName: "vitest-handler",
    }
  );

export { registrations };
