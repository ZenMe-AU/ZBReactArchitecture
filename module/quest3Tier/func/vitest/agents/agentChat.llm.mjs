/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const installerBin = path.join(os.homedir(), ".local/bin/claude");
const claudeBin = process.env.CLAUDE_BIN ?? (existsSync(installerBin) ? installerBin : "claude");
const cliEnv = { ...process.env };
delete cliEnv.NODE_OPTIONS;
delete cliEnv.VSCODE_INSPECTOR_OPTIONS;

const clip = (value, length) => {
  const text = String(value);
  return text.length > length ? `${text.slice(0, length)}...` : text;
};

export async function assertLlmReady() {
  if (process.env.LLM_BASE_URL) return;
  const result = await execFileAsync(claudeBin, ["auth", "status", "--json"], { env: cliEnv }).catch((error) => ({
    stdout: error.stdout,
    error,
  }));
  let status;
  try {
    status = JSON.parse(String(result.stdout));
  } catch {
    throw new Error(`Claude CLI check failed: ${result.error?.message ?? "no output"}`);
  }
  if (!status.loggedIn) throw new Error("Claude CLI is not logged in. Run `claude /login` in the VS Code terminal, then start the test again.");
}

async function claude(systemPrompt, input, model, schema, sandbox, { effort, thinking }) {
  const args = ["-p", "--system-prompt", systemPrompt, "--model", model, "--effort", effort];
  if (!thinking) args.push("--settings", JSON.stringify({ alwaysThinkingEnabled: false }));
  args.push("--tools", "", "--strict-mcp-config", "--disable-slash-commands", "--no-session-persistence");
  args.push("--output-format", "json", "--json-schema", JSON.stringify(schema));
  const run = execFileAsync(claudeBin, args, {
    cwd: sandbox,
    env: cliEnv,
    maxBuffer: 20 * 1024 * 1024,
    timeout: 3 * 60 * 1000,
    killSignal: "SIGKILL",
  });
  run.child.stdin.end(JSON.stringify(input));
  const { stdout } = await run.catch((error) => {
    if (error.killed) throw new Error("claude timed out");
    let cause;
    try {
      cause = JSON.parse(error.stdout).result;
    } catch {
      cause = error.stderr?.trim() || "no output";
    }
    throw new Error(`claude exited ${error.code}: ${clip(cause, 300)}`);
  });
  const out = JSON.parse(stdout);
  if (out.is_error) throw new Error(out.result || "Claude CLI error");
  if (!out.structured_output) throw new Error(`no structured output: ${out.subtype} ${clip(out.result, 200)}`);
  return out.structured_output;
}

async function openaiCompatible(systemPrompt, input, model, schema) {
  const res = await fetch(`${process.env.LLM_BASE_URL.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(process.env.LLM_API_KEY && { authorization: `Bearer ${process.env.LLM_API_KEY}` }) },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: `${systemPrompt}\n\nReply with only one JSON object that matches this JSON Schema, no other text:\n${JSON.stringify(schema)}` },
        { role: "user", content: JSON.stringify(input) },
      ],
    }),
    signal: AbortSignal.timeout(3 * 60 * 1000),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`LLM API ${res.status}: ${clip(JSON.stringify(body?.error ?? body), 300)}`);
  const text = body?.choices?.[0]?.message?.content ?? "";
  let out;
  try {
    out = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  } catch {
    throw new Error(`LLM reply is not JSON: ${clip(text, 200)}`);
  }
  const missing = schema.required.filter((key) => !(key in out));
  if (missing.length) throw new Error(`LLM reply misses ${missing.join(", ")}`);
  return out;
}

export const llm = (systemPrompt, input, model, schema, sandbox, options) =>
  process.env.LLM_BASE_URL ? openaiCompatible(systemPrompt, input, model, schema) : claude(systemPrompt, input, model, schema, sandbox, options);
