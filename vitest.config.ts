import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    fileParallelism: false,
    projects: [
      {
        test: {
          name: "quest3Tier/func",
          include: ["module/quest3Tier/func/vitest/**/*.test.mjs"],
          setupFiles: ["module/quest3Tier/func/vitest/vitest.setup.mjs"],
          globals: true,
          environment: "node",
        },
      },
      {
        test: {
          name: "quest3TierCqrs/func",
          include: ["module/quest3TierCqrs/func/vitest/**/*.test.mjs"],
          setupFiles: ["module/quest3TierCqrs/func/vitest/vitest.setup.mjs"],
          globals: true,
          environment: "node",
        },
      },
      {
        test: {
          name: "quest5Tier/func",
          include: ["module/quest5Tier/func/vitest/**/*.test.mjs"],
          setupFiles: ["module/quest5Tier/func/vitest/vitest.setup.mjs"],
          globals: true,
          environment: "node",
        },
      },
      {
        test: {
          name: "quest5TierEg/func",
          include: ["module/quest5TierEg/func/vitest/**/*.test.mjs"],
          setupFiles: ["module/quest5TierEg/func/vitest/vitest.setup.mjs"],
          globals: true,
          environment: "node",
        },
      },
    ],
  },
});
