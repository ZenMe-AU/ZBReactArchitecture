/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import { connect } from "node:net";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const VIEWER_DIR = path.dirname(fileURLToPath(import.meta.url));
const FUNC_DIR = process.cwd();
const SOURCE_VIEWER_DIR = path.join(FUNC_DIR, "vitest/agents/viewer");
const RUNS_DIR = path.join(FUNC_DIR, "vitest/agents/runs");
const REPO_DIR = path.resolve(FUNC_DIR, "../../..");
const TEST_FILE = "module/quest3Tier/func/vitest/agents/agentChat.test.mts";
const AZURITE_BIN = path.join(REPO_DIR, "node_modules/azurite/dist/src/azurite.js");
const HOST = "127.0.0.1";
const PORT = Number(process.env.AGENT_VIEW_PORT ?? 4178);
const CHILD_ENV = { ...process.env };
delete CHILD_ENV.NODE_OPTIONS;
delete CHILD_ENV.VSCODE_INSPECTOR_OPTIONS;
const STATIC_FILES = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/viewer.mjs": ["viewer.mjs", "text/javascript; charset=utf-8"],
  "/viewer-data.mjs": ["viewer-data.mjs", "text/javascript; charset=utf-8"],
  "/viewer-results.mjs": ["viewer-results.mjs", "text/javascript; charset=utf-8"],
  "/viewer-questions.mjs": ["viewer-questions.mjs", "text/javascript; charset=utf-8"],
} as const;
type RunState = { status: string; humanMode?: boolean; startedAt?: string; finishedAt?: string; joinUrl?: string; error?: string; exitCode?: number };
const state: { runProcess?: ChildProcess; azuriteProcess?: ChildProcess; uiProcess?: ChildProcess; run: RunState } = { run: { status: "idle" } };

const isRunName = (name) => typeof name === "string" && path.basename(name) === name && name.endsWith(".chat.md");

async function listRuns() {
  const entries = await readdir(RUNS_DIR, { withFileTypes: true }).catch(() => []);
  const runs = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && isRunName(entry.name))
      .map(async (entry) => ({ name: entry.name, mtime: (await stat(path.join(RUNS_DIR, entry.name))).mtimeMs }))
  );
  return runs.sort((a, b) => b.mtime - a.mtime);
}

function send(response, status, contentType, body) {
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; img-src 'self' data:",
    "Content-Type": contentType,
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(body);
}

const sendJson = (response, status, body) => send(response, status, "application/json; charset=utf-8", JSON.stringify(body));
const isSameOrigin = (request) => request.headers.origin === `http://${HOST}:${PORT}`;

const portOpen = (port, host = HOST) =>
  new Promise((resolve) => {
    const socket = connect(port, host);
    socket.setTimeout(300);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    const closed = () => resolve(false);
    socket.once("error", closed);
    socket.once("timeout", () => {
      socket.destroy();
      closed();
    });
  });

const waitForPort = async (port, host, attempts) => {
  for (const _attempt of Array.from({ length: attempts })) {
    if (await portOpen(port, host)) return true;
    await delay(100);
  }
  return false;
};

async function ensureServices(humanMode) {
  if (!(await portOpen(10002))) {
    state.azuriteProcess = spawn(process.execPath, [AZURITE_BIN, "--location", REPO_DIR, "--tableHost", HOST, "--tablePort", "10002", "--silent"], {
      cwd: REPO_DIR,
      env: CHILD_ENV,
      stdio: ["ignore", "pipe", "pipe"],
    });
    state.azuriteProcess.stdout?.pipe(process.stdout);
    state.azuriteProcess.stderr?.pipe(process.stderr);
    if (!(await waitForPort(10002, HOST, 50))) throw new Error("Azurite Table did not start on port 10002");
  }
  if (!(await portOpen(7073))) throw new Error("Q3 API is not running on port 7073. Start the Agent Start debug configuration first.");
  if (humanMode && !(await portOpen(5183, "localhost"))) {
    state.uiProcess = spawn("pnpm", ["run", "dev"], {
      cwd: path.join(REPO_DIR, "module/quest3Tier/ui"),
      env: CHILD_ENV,
      stdio: ["ignore", "pipe", "pipe"],
    });
    state.uiProcess.stdout?.pipe(process.stdout);
    state.uiProcess.stderr?.pipe(process.stderr);
    if (!(await waitForPort(5183, "localhost", 100))) throw new Error("Q3 UI did not start on port 5183");
  }
}

async function startRun(humanMode = false) {
  state.run = { status: "starting", humanMode, startedAt: new Date().toISOString() };
  await ensureServices(humanMode);
  const child = spawn("pnpm", ["vitest", "run", TEST_FILE, "--disableConsoleIntercept"], {
    cwd: REPO_DIR,
    env: { ...CHILD_ENV, AGENT_RUN: "1", ...(humanMode && { HUMAN_RUN: "1" }) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  state.runProcess = child;
  state.run = {
    status: "running",
    humanMode,
    startedAt: new Date().toISOString(),
    ...(humanMode && { joinUrl: "http://localhost:5183/login?human=1" }),
  };
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  const finish = (status, detail) => {
    if (state.runProcess !== child) return;
    state.runProcess = undefined;
    state.run = { ...state.run, status, finishedAt: new Date().toISOString(), ...detail };
  };
  child.once("error", (error) => finish("failed", { error: error.message }));
  child.once("exit", (code) => finish(code === 0 ? "passed" : "failed", { exitCode: code }));
}

async function handle(request, response) {
  const url = new URL(request.url, `http://${HOST}:${PORT}`);
  if (request.method === "POST" && url.pathname === "/api/run") {
    if (!isSameOrigin(request)) return sendJson(response, 403, { error: "Same-origin request required" });
    if (state.runProcess || state.run.status === "starting") return sendJson(response, 409, state.run);
    try {
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
      await startRun(body.humanMode === true);
      return sendJson(response, 202, state.run);
    } catch (error) {
      state.run = { ...state.run, status: "failed", error: error.message, finishedAt: new Date().toISOString() };
      return sendJson(response, 503, state.run);
    }
  }
  if (request.method !== "GET") return sendJson(response, 405, { error: "Method not allowed" });

  if (url.pathname === "/favicon.ico") return send(response, 204, "image/x-icon", "");
  if (url.pathname === "/api/run") return sendJson(response, 200, state.run);
  if (url.pathname === "/api/runs") return sendJson(response, 200, { runs: await listRuns() });
  if (url.pathname === "/api/log") {
    const runs = await listRuns();
    const requested = url.searchParams.get("run") ?? runs[0]?.name;
    if (!isRunName(requested) || !runs.some((run) => run.name === requested)) return sendJson(response, 404, { error: "Run not found" });
    const text = await readFile(path.join(RUNS_DIR, requested), "utf8");
    return sendJson(response, 200, { run: requested, text, mtime: runs.find((run) => run.name === requested).mtime });
  }
  if (url.pathname === "/api/report") {
    const run = url.searchParams.get("run");
    if (!isRunName(run)) return sendJson(response, 404, { error: "Run not found" });
    const text = await readFile(path.join(RUNS_DIR, run.replace(/\.chat\.md$/, ".md")), "utf8").catch(() => "");
    return sendJson(response, 200, { text });
  }

  const staticFile = STATIC_FILES[url.pathname];
  if (!staticFile) return sendJson(response, 404, { error: "Not found" });
  const directory = staticFile[0] === "index.html" ? SOURCE_VIEWER_DIR : VIEWER_DIR;
  return send(response, 200, staticFile[1], await readFile(path.join(directory, staticFile[0])));
}

async function selfCheck() {
  const { classifyFinding, parseLine, parseLog, parseReport } = await import("./viewer-data.mjs");
  assert.equal(isRunName("../secret.chat.md"), false);
  assert.equal(isSameOrigin({ headers: { origin: `http://${HOST}:${PORT}` } }), true);
  assert.equal(isSameOrigin({ headers: { origin: "https://example.com" } }), false);
  assert.deepEqual(parseLine('[03:44:11] Mike answered "A useful question": A useful answer'), {
    time: "03:44:11",
    agent: "Mike",
    kind: "answer",
    text: 'answered "A useful question": A useful answer',
  });
  assert.equal(
    parseLog('[03:44:11] Mike answered "A useful question": First paragraph\n\nSecond paragraph\n[03:44:12] Bella looked at /sharedQuestions\n')[0].text,
    'answered "A useful question": First paragraph\n\nSecond paragraph'
  );
  assert.equal(parseLine('[03:44:13] Ian edited "A useful question"').kind, "edit");
  assert.equal(classifyFinding("permission allowed unauthorized access"), "Security");
  assert.equal(classifyFinding("answer profile was misattributed"), "Data");
  const result = parseReport(
    "## Metrics\n\n| Agent | Steps | New questions | Edits | Shares | Re-shares | Answered / others' seen |\n|---|---|---|---|---|---|---|\n| Mike | 2 | 1 | 0 | 1 | 1 | 1/2 |\n\n## Judge\n\n| Observer | Subject | Accuracy /10 | Hidden links found | Note |\n|---|---|---|---|---|\n| Mike | Bella | 8 | - | Accurate |\n\n### Leaks\n\n- none\n\n## Findings"
  );
  assert.deepEqual({ average: result.average, questions: result.questions, reshares: result.reshares }, { average: 8, questions: 1, reshares: 1 });
  assert.equal(parseLine("not an event"), null);
  console.log("Agent viewer self-check passed.");
}

if (process.argv.includes("--check")) {
  await selfCheck();
} else {
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) throw new Error("AGENT_VIEW_PORT must be a valid port");
  const server = createServer((request, response) =>
    handle(request, response).catch((error) => {
      console.error(error);
      sendJson(response, 500, { error: "Viewer error" });
    })
  );
  server.listen(PORT, HOST, () => console.log(`Q3 Agent Town: http://${HOST}:${PORT}`));
}
