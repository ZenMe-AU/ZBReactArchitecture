/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { beforeAll, describe, expect, it, vi } from "vitest";
import { type ILlmProvider, type LlmRequest, OpenaiCompatibleProvider } from "./index.mjs";

describe("OpenaiCompatibleProvider", () => {
  describe("mocked backend", () => {
    it("mock - asserts unready when baseUrl is missing and ready when provided", async () => {
      const unreadyProvider: ILlmProvider = new OpenaiCompatibleProvider("ollama", {
        baseUrl: "",
      });
      await expect(unreadyProvider.assertReady()).rejects.toThrow(/requires 'LLM_BASE_URL' to be configured/);

      const readyProvider: ILlmProvider = new OpenaiCompatibleProvider("ollama", {
        baseUrl: "http://localhost:11434/v1",
      });
      await expect(readyProvider.assertReady()).resolves.toBeUndefined();
    });

    it("mock - calls completion endpoint and returns validated JSON via ILlmProvider interface", async () => {
      let capturedUrl = "";
      let capturedOptions: RequestInit | undefined;

      const mockFetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
        capturedUrl = url;
        capturedOptions = init;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    answer: "mocked success",
                    count: 42,
                  }),
                },
              },
            ],
          }),
        };
      }) as unknown as typeof fetch;

      const provider: ILlmProvider = new OpenaiCompatibleProvider("openai", {
        baseUrl: "https://api.example.com/v1/",
        apiKey: "test-token",
        fetchFn: mockFetch,
      });

      const request: LlmRequest = {
        systemPrompt: "You are a test helper",
        input: { query: "hello" },
        model: "gpt-4o",
        schema: {
          type: "object",
          properties: { answer: { type: "string" }, count: { type: "number" } },
          required: ["answer", "count"],
        },
      };

      const result = await provider.completeJson<{
        answer: string;
        count: number;
      }>(request);

      expect(capturedUrl).toBe("https://api.example.com/v1/chat/completions");
      expect(capturedOptions?.method).toBe("POST");
      expect((capturedOptions?.headers as Record<string, string>)?.authorization).toBe("Bearer test-token");
      expect(result).toEqual({ answer: "mocked success", count: 42 });
    });

    it("mock - throws error when upstream returns non-ok status", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ error: { message: "Service Unavailable" } }),
      }) as unknown as typeof fetch;

      const provider: ILlmProvider = new OpenaiCompatibleProvider("openai", {
        baseUrl: "https://api.example.com/v1",
        fetchFn: mockFetch,
      });

      const request: LlmRequest = {
        systemPrompt: "System",
        input: "Input",
        model: "model-a",
        schema: { type: "object", properties: { ok: { type: "boolean" } } },
      };

      await expect(provider.completeJson(request)).rejects.toThrow(/LLM API 503/);
    });

    it("mock - throws error when response misses required schema fields", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify({ ok: true }) } }],
        }),
      }) as unknown as typeof fetch;

      const provider: ILlmProvider = new OpenaiCompatibleProvider("ollama", {
        baseUrl: "http://localhost:11434/v1",
        fetchFn: mockFetch,
      });

      const request: LlmRequest = {
        systemPrompt: "System",
        input: "Input",
        model: "model-b",
        schema: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            requiredField: { type: "string" },
          },
          required: ["requiredField"],
        },
      };

      await expect(provider.completeJson(request)).rejects.toThrow(/LLM reply misses requiredField/);
    });
  });

  describe("unmocked backend", () => {
    let ollamaLive = false;
    let availableModel = "qwen2.5:3b";

    beforeAll(async () => {
      try {
        const res = await fetch("http://localhost:11434/api/tags", {
          signal: AbortSignal.timeout(2000),
        });
        if (res.ok) {
          const data = (await res.json().catch(() => null)) as {
            models?: Array<{ name: string }>;
          } | null;
          if (data?.models?.length) {
            ollamaLive = true;
            availableModel = data.models[0].name;
          }
        }
      } catch {
        ollamaLive = false;
      }
    });

    it("asserts ready and generates JSON via unmocked Ollama backend", async () => {
      if (!ollamaLive) {
        throw new Error("Unmocked Ollama test failed: Ollama is not running on http://localhost:11434. Start Ollama and pull a model.");
      }

      const provider: ILlmProvider = new OpenaiCompatibleProvider("ollama", {
        baseUrl: "http://localhost:11434/v1",
      });

      await provider.assertReady();

      const request: LlmRequest = {
        systemPrompt: "Return a JSON object conforming strictly to the schema.",
        input: { ping: "pong" },
        model: availableModel,
        schema: {
          type: "object",
          properties: { ok: { type: "boolean" } },
          required: ["ok"],
        },
      };

      const result = await provider.completeJson<{ ok: boolean }>(request);
      expect(result).toHaveProperty("ok");
      expect(typeof result.ok).toBe("boolean");
    }, 60_000);
  });
});
