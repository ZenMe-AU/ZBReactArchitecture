import { readFileSync } from "node:fs";
import { expect } from "vitest";
import type { ILlmProvider, LlmCompletionMetrics } from "./contract.mjs";

export const providerSettings = () => JSON.parse(readFileSync(new URL("../local.settings.json", import.meta.url), "utf8")).Values;

export async function testProviderSmoke(provider: ILlmProvider, model: string): Promise<void> {
  expect(model, `Configure the model for ${provider.name} in local.settings.json`).toBeTruthy();
  await provider.assertReady();
  let metrics: LlmCompletionMetrics | undefined;
  const result = await provider.completeJson<{ ok: boolean }>({
    systemPrompt: "Return the input object unchanged as JSON. No reasoning or other text.",
    input: { ok: true },
    model,
    schema: { type: "object", properties: { ok: { type: "boolean" } }, required: ["ok"], additionalProperties: false },
    options: { maxTokens: 32, temperature: 0, effort: "low", thinking: false },
    onMetrics: (value) => { metrics = value; },
  });
  expect(result).toEqual({ ok: true });
  expect(metrics).toBeDefined();
  expect(Number.isFinite(metrics!.outputTokens)).toBe(true);
  expect(Number.isFinite(metrics!.elapsedMs)).toBe(true);
  expect(metrics!.outputTokens).toBeGreaterThan(0);
  expect(metrics!.elapsedMs).toBeGreaterThan(0);
  console.table([{
    provider: provider.name,
    model,
    outputTokens: metrics!.outputTokens,
    elapsedMs: Math.round(metrics!.elapsedMs),
    tokensPerSecond: Number((metrics!.outputTokens * 1000 / metrics!.elapsedMs).toFixed(2)),
  }]);
}