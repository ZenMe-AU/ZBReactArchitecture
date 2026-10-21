/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Run from parent folder: pnpm exec vitest run llmProvider/openvino.provider.test.mts

import os from "node:os";
import path from "node:path";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type ILlmProvider, type LlmRequest, OpenvinoProvider } from "./index.mjs";

vi.mock("openvino-genai-node", async (importOriginal) => {
  const runtime = await importOriginal<typeof import("openvino-genai-node")>();
  return {
    ...runtime,
    LLMPipeline: vi.fn(runtime.LLMPipeline),
    VLMPipeline: vi.fn(runtime.VLMPipeline),
  };
});

describe("OpenvinoProvider", () => {
  describe("mocked backend", () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it.each(["LLMPipeline", "VLMPipeline"] as const)("mock - selects %s for the exported model layout", async (pipelineName) => {
      const modelDir = mkdtempSync(path.join(os.tmpdir(), "openvino-provider-"));
      const runtime = await import("openvino-genai-node");
      const failure = new Error("Selected pipeline factory");
      const llmFactory = vi.mocked(runtime.LLMPipeline).mockRejectedValue(failure);
      const vlmFactory = vi.mocked(runtime.VLMPipeline).mockRejectedValue(failure);

      try {
        if (pipelineName === "VLMPipeline") {
          writeFileSync(path.join(modelDir, "openvino_vision_embeddings_model.xml"), "");
        }
        const provider = new OpenvinoProvider({
          localModelDir: modelDir,
          device: "CPU",
        });
        await expect(provider.assertReady()).rejects.toBe(failure);
        const selectedFactory = pipelineName === "LLMPipeline" ? llmFactory : vlmFactory;
        const otherFactory = pipelineName === "LLMPipeline" ? vlmFactory : llmFactory;
        expect(selectedFactory).toHaveBeenCalledExactlyOnceWith(modelDir, "CPU");
        expect(otherFactory).not.toHaveBeenCalled();
      } finally {
        rmSync(modelDir, { recursive: true });
      }
    });

    it("mock - rejects a missing explicitly selected model instead of loading the configured model", async () => {
      const pipelineFactory = vi.fn();
      const provider = new OpenvinoProvider({
        localModelDir: os.tmpdir(),
        pipelineFactory,
      });
      const missingModel = path.join(os.tmpdir(), "non-existent-openvino-model-dir-12345");

      await expect(provider.getPipeline(missingModel)).rejects.toThrow(`OpenVINO model directory not found: ${missingModel}`);
      expect(pipelineFactory).not.toHaveBeenCalled();
    });

    it("mock - asserts unready when directory is invalid and ready when valid via ILlmProvider", async () => {
      const unreadyProvider: ILlmProvider = new OpenvinoProvider({
        localModelDir: path.join(os.tmpdir(), "non-existent-openvino-model-dir-12345"),
      });

      await expect(unreadyProvider.assertReady()).rejects.toThrow(/OpenVINO model directory does not exist/);

      const readyPipeline = {
        generate: vi.fn().mockResolvedValue({ texts: ['{"ok":true}'] }),
      };
      const readyProvider: ILlmProvider = new OpenvinoProvider({
        localModelDir: os.tmpdir(),
        pipelineFactory: vi.fn().mockResolvedValue(readyPipeline),
      });

      await expect(readyProvider.assertReady()).resolves.toBeUndefined();
    });

    it("mock - completes JSON and validates schema via ILlmProvider interface", async () => {
      const mockGenerate = vi.fn().mockResolvedValue({
        texts: ['{"result":"calculated","value":100}'],
      });
      const pipelineFactory = vi.fn().mockResolvedValue({ generate: mockGenerate });

      const provider: ILlmProvider = new OpenvinoProvider({
        localModelDir: os.tmpdir(),
        device: "GPU",
        pipelineFactory,
      });

      const request: LlmRequest = {
        systemPrompt: "Solve this",
        input: { x: 10 },
        model: "test-model",
        schema: {
          type: "object",
          properties: { result: { type: "string" }, value: { type: "number" } },
          required: ["result", "value"],
        },
      };

      const output = await provider.completeJson<{
        result: string;
        value: number;
      }>(request);

      expect(pipelineFactory).toHaveBeenCalledWith(os.tmpdir(), "GPU");
      expect(mockGenerate).toHaveBeenCalledTimes(1);
      expect(output).toEqual({ result: "calculated", value: 100 });
    });

    it("mock - serializes concurrent calls and continues after a generation fails", async () => {
      let release: () => void;
      let started: () => void;
      const blocked = new Promise<void>((resolve) => {
        release = resolve;
      });
      const firstStarted = new Promise<void>((resolve) => {
        started = resolve;
      });
      const failure = new Error("Pipeline generation crash");

      const mockGenerate = vi
        .fn()
        .mockImplementationOnce(async () => {
          started();
          await blocked;
          return { texts: ['{"ok":1}'] };
        })
        .mockRejectedValueOnce(failure)
        .mockResolvedValueOnce({ texts: ['{"ok":3}'] });

      const provider: ILlmProvider = new OpenvinoProvider({
        localModelDir: os.tmpdir(),
        pipelineFactory: vi.fn().mockResolvedValue({ generate: mockGenerate }),
      });

      const schema = {
        type: "object",
        properties: { ok: { type: "number" } },
        required: ["ok"],
      };
      const results = Promise.allSettled(
        [1, 2, 3].map((id) =>
          provider.completeJson({
            systemPrompt: "sys",
            input: { id },
            model: "model",
            schema,
          })
        )
      );

      try {
        await firstStarted;
        await new Promise<void>((resolve) => setImmediate(resolve));
        expect(mockGenerate).toHaveBeenCalledTimes(1);
      } finally {
        release();
      }

      expect(await results).toEqual([
        { status: "fulfilled", value: { ok: 1 } },
        { status: "rejected", reason: failure },
        { status: "fulfilled", value: { ok: 3 } },
      ]);
    });
  });

  describe("unmocked backend", () => {
    it("quick integration and performance", async () => {
      const { providerSettings, testProviderSmoke } = await import("./providerSmoke.mjs");
      const settings = providerSettings();
      const activeModelDir = settings.OPENVINO_MODEL_DIR ?? settings.LLM_MODEL;
      const provider = new OpenvinoProvider({
        localModelDir: activeModelDir,
        device: settings.OPENVINO_DEVICE ?? "GPU",
      });
      await testProviderSmoke(provider, activeModelDir);
      const pipeline = await provider.getPipeline();
      expect(await provider.getPipeline()).toBe(pipeline);
    }, 180_000);
  });
});
