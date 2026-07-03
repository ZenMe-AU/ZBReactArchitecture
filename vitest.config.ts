import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "web",
          include: ["src/**/*.{test,spec}.{ts,tsx,js,jsx}"],
          environment: "jsdom",
          globals: true,
          passWithNoTests: true,
        },
      },
      {
        test: {
          name: "functions",
          include: ["app/src/**/*.{test,spec}.{ts,tsx,js,jsx}"],
          environment: "node",
          globals: true,
          passWithNoTests: true,
        },
      },
    ],
    passWithNoTests: true,
  },
});
