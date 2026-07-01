import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["vitest/**/*.test.mjs"],
    setupFiles: ["./test/jest.loadLocalSettings.js"],
    globals: true,
    environment: "node",
  },
});
