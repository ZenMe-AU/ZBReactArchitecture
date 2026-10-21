/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Run from parent folder: pnpm exec vitest run llmProvider/providerPerformance.test.mts

import { describe, it } from "vitest";
import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execute = promisify(execFile);
const require = createRequire(import.meta.url);
const vitest = path.join(path.dirname(require.resolve("vitest/package.json")), "vitest.mjs");
const dashboardDir = fileURLToPath(new URL("..", import.meta.url));

describe.sequential("Provider performance", () => {
  for (const provider of ["openvino", "ovms", "ollama", "claude"]) {
    it(
      provider,
      async () => {
        const env = { ...process.env };
        delete env.VITEST;
        delete env.VITEST_WORKER_ID;
        delete env.VITEST_POOL_ID;
        delete env.NODE_OPTIONS;
        try {
          const { stdout, stderr } = await execute(
            process.execPath,
            [vitest, "run", `llmProvider/${provider}.provider.test.mts`, "-t", "quick integration and performance", "--disableConsoleIntercept"],
            {
              cwd: dashboardDir,
              env,
              timeout: 210_000,
              maxBuffer: 1024 * 1024,
            }
          );
          console.info(stdout);
          if (stderr) console.error(stderr);
        } catch (error) {
          const failure = error as Error & { stdout?: string; stderr?: string };
          console.error(failure.stdout ?? "", failure.stderr ?? "");
          throw error;
        }
      },
      220_000
    );
  }
});
