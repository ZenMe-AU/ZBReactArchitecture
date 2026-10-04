/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Persona agents get to know each other only through the Q3 API.
// Skipped unless AGENT_RUN=1. Needs the func host running with AUTH_PROVIDER=authLocal
// and either a logged-in `claude` CLI or an OpenAI-compatible endpoint (LLM_BASE_URL). The LLM runs with no tools, so the
// harness is its only way out: it signs every call with the agent's own token and
// enforces the per-run limits before anything reaches the API.
// Three agents join each run and act concurrently, one small step (one API call) at a time,
// like people tapping through the app. They reflect into their memory files every few steps
// and once more at the end; a judge then grades the memories against the personas.
// Run from the repo root:
//   AGENT_RUN=1 pnpm vitest run module/quest3Tier/func/vitest/agents/agentChat.test.mjs --disableConsoleIntercept
// Watch the conversation live in the terminal, or in runs/<time>_<participants>.chat.md.

import assert from "node:assert/strict";
import { appendFile, mkdtemp, rm, writeFile } from "node:fs/promises";
import { setTimeout as sleep } from "node:timers/promises";
import os from "node:os";
import path from "node:path";
import { LIMITS, MAX_LENGTH, MEMORY_SCHEMA, NAMES, reflectPrompt, rules, STEP_SCHEMA, writeKind } from "./agentChat.config.mjs";
import { assertLlmReady, llm } from "./agentChat.llm.mjs";
import { judge, report } from "./agentChat.report.mjs";
import { AGENTS_DIR, loadAgent, LOCK_PATH, pickParticipants, RUNS_DIR, takeLock } from "./agentChat.setup.mjs";

const MAX_STEPS = Number(process.env.AGENT_STEPS ?? 20);
const REFLECT_EVERY = 10;
const RECENT_STEPS = 8;
const POLL_MS = 5 * 1000;
const IDLE_POLLS = 3;

async function call(agent, method, url, body) {
  // A JSON Content-Type with an empty body makes the handler wrapper 500, so only send it with a body.
  const hasBody = body !== undefined && method !== "GET";
  const res = await fetch(url, {
    method,
    headers: { authorization: `Bearer ${agent.token}`, ...(hasBody && { "Content-Type": "application/json" }) },
    body: hasBody ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  try {
    return { status: res.status, response: JSON.parse(text) };
  } catch {
    return { status: res.status, response: text };
  }
}

const list = async (agent, p) => (await call(agent, "GET", new URL(p, process.env.QUESTION_URL))).response?.return?.list ?? [];
const clip = (s, n = 200) => (String(s).length > n ? `${String(s).slice(0, n)}...` : String(s));

// Control arm of the anonymity experiment: REVEAL_AUTHORS=1 names the author of every answer.
// ponytail: reads the author via GET /question/{id}/answer/{answerId}, which leaks profileId today; use the harness's own answer log if that leak gets fixed.
const authorOf = new Map();

async function snapshot(agent) {
  const profiles = await list(agent, "/profiles");
  const names = Object.fromEntries(profiles.map((p) => [p.id, p.name]));
  const questions = await list(agent, "/questions");
  for (const q of questions) {
    q.answers = await list(agent, `/question/${q.id}/answers`);
    if (!process.env.REVEAL_AUTHORS) continue;
    for (const ans of q.answers) {
      if (!authorOf.has(ans.id))
        authorOf.set(
          ans.id,
          (await call(agent, "GET", new URL(`/question/${q.id}/answer/${ans.id}`, process.env.QUESTION_URL))).response?.return?.detail?.profileId
        );
      const pid = authorOf.get(ans.id);
      ans.author = !pid ? "unknown" : (names[pid] ?? agent.name); // /profiles leaves out yourself
    }
  }
  return { questions, profiles };
}

// Empty entries would name people the agent has never met on Q3.
const knownMemory = (agent) => Object.fromEntries(Object.entries(agent.memory).filter(([, md]) => md));

// What the LLM sees of a question: only what a person reads in the app, which keeps every step's prompt small.
// Answer authors stay hidden exactly as Q3 hides them, except your own answers and the REVEAL_AUTHORS control arm.
// Answers already digested into memory (and your own) shrink to a preview; new ones and reflections get the full text.
const view = (questions, names, digested = new Set()) =>
  questions.map((q) => ({
    id: q.id,
    owner: q.isOwner ? "you" : (names[q.profileId] ?? "unknown"),
    title: q.title,
    text: q.questionText,
    answers: q.answers.map((a) => ({
      id: a.id,
      ...(a.profileId ? { by: "you" } : a.author && { by: a.author }),
      text: a.profileId || digested.has(a.id) ? clip(a.answerText, 120) : a.answerText,
      ...(a.isEdited && { edited: true }),
    })),
  }));

const digest = (agent, questions) => questions.forEach((q) => q.answers.forEach((a) => agent.digested.add(a.id)));

async function observe(agent) {
  const { questions, profiles } = await snapshot(agent);
  const names = Object.fromEntries(profiles.map((p) => [p.id, p.name]));

  // News = what appeared since this agent last looked, so it can react like a person reading notifications.
  const news = [];
  for (const q of questions) {
    if (!agent.seen.has(q.id))
      news.push(q.isOwner ? `Your question "${q.title}" is live.` : `${names[q.profileId] ?? "Someone"} shared a question with you: "${q.title}"`);
    agent.seen.add(q.id);
    for (const ans of q.answers) {
      const key = `${ans.id}:${ans.answerText}`;
      if (!agent.seen.has(key) && ans.profileId === null) news.push(`New answer on "${q.title}": ${clip(ans.answerText, 120)}`);
      agent.seen.add(key);
    }
  }
  return {
    you: agent.name,
    step: agent.steps + 1,
    budget: {
      questionWritesLeft: LIMITS.questionWrites - agent.used.questionWrites,
      answerWritesLeft: LIMITS.answerWrites - agent.used.answerWrites,
      stepsLeft: MAX_STEPS - agent.steps,
    },
    // ponytail: the first look after earlier runs lists everything; the latest 15 items are enough to react to.
    news: news.slice(-15),
    profiles,
    questions: view(questions, names, agent.digested),
    memory: knownMemory(agent),
    recent: agent.recent.slice(-RECENT_STEPS),
  };
}

const FAST = { effort: process.env.AGENT_EFFORT ?? "low", thinking: false };

async function think(agent, state, sandbox) {
  try {
    return await llm(`${rules(agent.name)}\n\n# Your persona\n${agent.persona}`, state, agent.model, STEP_SCHEMA, sandbox, FAST);
  } catch (err) {
    return { note: "", action: { method: "NONE" }, findings: [], error: err.message };
  }
}

async function reflect(agent, others, sandbox, say) {
  try {
    // snapshot, not observe: reflecting must not mark news as seen before the agent has reacted to it.
    const { questions, profiles } = await snapshot(agent);
    const names = Object.fromEntries(profiles.map((p) => [p.id, p.name]));
    const input = { profiles, questions: view(questions, names), memory: knownMemory(agent), recent: agent.recent.slice(-RECENT_STEPS) };
    const out = await llm(`${reflectPrompt(agent.name, others)}\n\n# Your persona\n${agent.persona}`, input, agent.model, MEMORY_SCHEMA, sandbox, FAST);
    await saveMemory(agent, out.memory);
    digest(agent, questions);
    await say(`${agent.name} updated memory: ${Object.keys(out.memory).join(", ")}`);
  } catch (err) {
    await say(`${agent.name} memory update failed: ${err.message}`);
  }
}

const invalidBody = (body) => {
  // PATCH bodies are JSON Patch ops; map "/questionText" -> value so both shapes check the same way.
  const fields = Array.isArray(body) ? Object.fromEntries(body.map((op) => [String(op?.path).slice(1), op?.value])) : (body ?? {});
  if (fields.option != null) return "text-only";
  const over = Object.entries(MAX_LENGTH).find(([field, max]) => typeof fields[field] === "string" && fields[field].length > max);
  return over ? `length:${over[0]}` : null;
};

async function act(agent, { method, path: p, body }) {
  const baseUrl = new URL(process.env.QUESTION_URL);
  const url = URL.canParse(p, baseUrl) ? new URL(p, baseUrl) : null;
  const kind = url && writeKind(method, url.pathname);
  const reason = url?.origin !== baseUrl.origin ? "origin" : kind && agent.used[kind] >= LIMITS[kind] ? `limit:${kind}` : invalidBody(body);
  if (reason) return { method, path: p, body, status: "REJECTED", reason };
  if (kind) agent.used[kind]++;
  return { method, path: url.pathname, body, ...(await call(agent, method, url, body)) };
}

async function saveMemory(agent, memory) {
  for (const [other, md] of Object.entries(memory)) {
    if (!NAMES.includes(other) || other === agent.name) continue;
    agent.memory[other] = md;
    agent.updated.add(other);
    await writeFile(path.join(agent.memoryDir, `${other}.md`), md);
  }
}

// One human-readable line per API call for the live chat log.
function narrate(r, titles, names) {
  const [, root, id, sub] = r.path.split("/");
  const q = `"${clip(titles[id] ?? id, 80)}"`;
  if (r.status === "REJECTED") return `tried ${r.method} ${r.path}, rejected (${r.reason})`;
  if (r.status >= 400) return `${r.method} ${r.path} failed (${r.status})`;
  if (r.method === "GET") return `looked at ${r.path}`;
  if (root === "question" && !id) return `asked "${clip(r.body?.title, 80)}": ${clip(r.body?.questionText)}`;
  if (root === "question" && sub === "share") return `shared ${q} with ${(r.body?.receiverIds ?? []).map((pid) => names[pid] ?? pid).join(", ")}`;
  if (root === "question" && sub === "answer") return `answered ${q}: ${clip(r.body?.answer)}`;
  if (root === "question" && !sub) return `edited ${q}: ${clip(JSON.stringify(r.body))}`;
  return `${r.method} ${r.path} ${clip(JSON.stringify(r.body))}`;
}

async function runAgent(agent, agents, others, sandbox, log, say) {
  // What was on Q3 before this run is already summed up in the memory files from earlier runs.
  if (Object.keys(knownMemory(agent)).length) digest(agent, (await snapshot(agent)).questions);
  while (agent.steps < MAX_STEPS) {
    const state = await observe(agent);
    if (agent.waiting && !state.news.length) {
      // Nothing new since the agent chose to wait: check back later like a person would, without an LLM call.
      agent.idle++;
      if (agents.every((a) => a.done || a.idle >= IDLE_POLLS)) break;
      await sleep(POLL_MS);
      continue;
    }
    agent.idle = 0;
    const out = await think(agent, state, sandbox);
    const step = ++agent.steps;
    const result = out.action.method === "NONE" ? null : await act(agent, out.action);
    agent.waiting = !result;
    agent.findings.push(...out.findings.map((text) => ({ turn: step, text })));
    agent.recent.push({
      step,
      note: out.note,
      action: out.action,
      status: result?.status,
      reason: result?.reason,
      response: result?.response === undefined ? undefined : clip(JSON.stringify(result.response), 300),
    });
    if (out.error) log.push({ turn: step, agent: agent.name, error: out.error });
    if (result) log.push({ turn: step, agent: agent.name, ...result });

    const titles = Object.fromEntries(state.questions.map((q) => [q.id, q.title ?? q.text]));
    const names = Object.fromEntries(state.profiles.map((p) => [p.id, p.name]));
    if (out.error) await say(`${agent.name} LLM error: ${out.error}`);
    if (out.note) await say(`${agent.name}: "${clip(out.note)}"`);
    if (result) await say(`${agent.name} ${narrate(result, titles, names)}`);
    for (const text of out.findings) await say(`${agent.name} FINDING: ${text}`);
    agent.errors = out.error ? agent.errors + 1 : 0;
    if (agent.errors >= 3) {
      await say(`${agent.name} stops after 3 LLM errors in a row.`);
      break;
    }
    if (step % REFLECT_EVERY === 0) await reflect(agent, others, sandbox, say);
  }
  agent.done = true;
}

export async function runAgentChat() {
  // agent.md says e.g. "haiku", which only the Claude CLI understands.
  if (process.env.LLM_BASE_URL && !process.env.AGENT_MODEL) throw new Error("LLM_BASE_URL needs AGENT_MODEL (e.g. gpt-5-mini, qwen3:8b)");
  await assertLlmReady();
  await takeLock();
  try {
    const participants = await pickParticipants();
    const runName = `${new Date().toISOString().replaceAll(":", "-")}_${participants.join("-")}`;
    // Live chat log: printed as it happens (run vitest with --disableConsoleIntercept) and appended to a file you can keep open.
    const chatPath = path.join(RUNS_DIR, `${runName}.chat.md`);
    const say = async (line) => {
      const text = `[${new Date().toISOString().slice(11, 19)}] ${line}`;
      console.log(text);
      await appendFile(chatPath, `${text}\n\n`);
    };
    await say(`Run starts. Online: ${participants.join(", ")}.`);
    const agents = await Promise.all(participants.map(loadAgent));
    const sandbox = await mkdtemp(path.join(os.tmpdir(), "q3-agent-"));
    const log = [];

    const othersOf = (agent) => participants.filter((n) => n !== agent.name);
    await Promise.all(agents.map((agent) => runAgent(agent, agents, othersOf(agent), sandbox, log, say)));
    await say("Everyone is done. Final memory update...");
    await Promise.all(agents.map((agent) => reflect(agent, othersOf(agent), sandbox, say)));
    await say("Judge is grading...");

    // Every question is visible to its owner, so the union over participants covers everything they touched.
    const questions = new Map();
    const names = {};
    for (const agent of agents) {
      for (const p of await list(agent, "/profiles")) names[p.id] = p.name;
      const visible = await list(agent, "/questions");
      agent.seenOthers = visible.filter((q) => !q.isOwner).length;
      for (const q of visible) questions.set(q.id, q);
    }
    for (const q of questions.values()) q.answers = await list(agents[0], `/question/${q.id}/answers`);
    const judgement = await judge(agents, [...questions.values()], names, log, sandbox).catch((err) => ({ error: err.message }));

    const reportPath = path.join(RUNS_DIR, `${runName}.md`);
    await writeFile(reportPath, report(participants, agents, log, [...questions.values()], names, judgement));
    await say(`Report: ${reportPath}`);

    for (const agent of agents) {
      assert.ok(agent.used.questionWrites <= LIMITS.questionWrites, `${agent.name} exceeded the question-write limit`);
      assert.ok(agent.used.answerWrites <= LIMITS.answerWrites, `${agent.name} exceeded the answer-write limit`);
      for (const other of othersOf(agent)) {
        assert.ok(agent.updated.has(other), `${agent.name} did not update memory of ${other} this run`);
      }
    }
  } finally {
    await rm(LOCK_PATH, { force: true });
  }
}
