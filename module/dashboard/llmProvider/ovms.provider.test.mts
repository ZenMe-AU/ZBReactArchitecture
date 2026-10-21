// Run from parent folder: pnpm exec vitest run llmProvider/ovms.provider.test.mts

import { describe, it } from "vitest";
import { OpenaiCompatibleProvider } from "./openaiCompatible.provider.mjs";
import { providerSettings, testProviderSmoke } from "./providerSmoke.mjs";

describe("OVMS provider", () => {
  it("quick integration and performance", async () => {
    const settings = providerSettings();
    const provider = new OpenaiCompatibleProvider("ovms", { baseUrl: settings.OVMS_BASE_URL, apiKey: "" });
    await testProviderSmoke(provider, settings.OVMS_MODEL);
  }, 180_000);
});