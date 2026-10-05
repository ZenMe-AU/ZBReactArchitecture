/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as authLocal from "../../service/authLocal.mjs";
import { NAMES } from "./agentChat.config.mjs";

export const AGENTS_DIR = path.dirname(fileURLToPath(import.meta.url));
export const RUNS_DIR = path.join(AGENTS_DIR, "runs");
export const LOCK_PATH = path.join(RUNS_DIR, ".lock");
const MEMORY_END = "<!-- /Q3_MEMORY -->";

const memoryStart = (name) => `<!-- Q3_MEMORY:${name} -->`;

function parseMemory(text, owner) {
  return Object.fromEntries(
    NAMES.filter((name) => name !== owner).map((name) => {
      const start = text.indexOf(memoryStart(name));
      const end = start < 0 ? -1 : text.indexOf(MEMORY_END, start);
      return [name, start < 0 || end < 0 ? "" : text.slice(start + memoryStart(name).length, end).trim()];
    })
  );
}

export async function writeMemory(file, owner, memory) {
  const sections = NAMES.filter((name) => name !== owner).map(
    (name) => `${memoryStart(name)}\n## ${name}\n\n${memory[name] ?? ""}\n${MEMORY_END}`
  );
  await writeFile(file, `# ${owner}'s memory\n\n${sections.join("\n\n")}\n`);
}

async function loadMemory(name) {
  const file = path.join(AGENTS_DIR, name, "memory.md");
  const combined = await readFile(file, "utf8").catch(() => "");
  if (combined) return { file, memory: parseMemory(combined, name) };

  const legacyDir = path.join(AGENTS_DIR, name, "memory");
  const memory = Object.fromEntries(
    await Promise.all(
      NAMES.filter((other) => other !== name).map(async (other) => [
        other,
        await readFile(path.join(legacyDir, `${other}.md`), "utf8").catch(() => ""),
      ])
    )
  );
  if (Object.values(memory).some(Boolean)) {
    await writeMemory(file, name, memory);
    await rm(legacyDir, { recursive: true, force: true });
  }
  return { file, memory };
}

const isAlive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

export async function takeLock() {
  await mkdir(RUNS_DIR, { recursive: true });
  try {
    await writeFile(LOCK_PATH, String(process.pid), { flag: "wx" });
  } catch {
    const pid = Number(await readFile(LOCK_PATH, "utf8").catch(() => 0));
    if (pid && isAlive(pid)) throw new Error(`Another agent run (pid ${pid}) is active; see ${LOCK_PATH}`);
    await writeFile(LOCK_PATH, String(process.pid));
  }
}

export async function pickParticipants() {
  if (process.env.AGENTS) return process.env.AGENTS.split(",").map((name) => name.trim());
  const runCount = (await readdir(RUNS_DIR).catch(() => [])).filter((file) => /_\w+-\w+-\w+\.md$/.test(file)).length;
  return [0, 1, 2].map((index) => NAMES[(runCount + index) % NAMES.length]);
}

export async function loadAgent(name) {
  const text = await readFile(path.join(AGENTS_DIR, name, `${name}.agent.md`), "utf8");
  const [, frontmatter, persona] = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta = Object.fromEntries(
    frontmatter.split("\n").map((line) => [line.slice(0, line.indexOf(":")).trim(), line.slice(line.indexOf(":") + 1).trim()])
  );
  const { file: memoryFile, memory } = await loadMemory(name);
  return {
    name,
    persona,
    model: process.env.AGENT_MODEL ?? meta.model,
    token: authLocal.generateToken({ oid: meta.oid, name, preferred_username: meta.email }),
    memoryFile,
    memory,
    updated: new Set(),
    used: { questionWrites: 0, answerWrites: 0 },
    seen: new Set(),
    digested: new Set(),
    recent: [],
    findings: [],
    steps: 0,
    errors: 0,
    waiting: false,
    idle: 0,
    done: false,
  };
}
