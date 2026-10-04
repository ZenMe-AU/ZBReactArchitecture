/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

export const AGENTS = ["Mike", "Bella", "Ian", "Eric"];
export const KINDS = {
  answer: ["Answer posted", "Answer"],
  edit: ["Question refined", "Edit"],
  error: ["Action failed", "Error"],
  finding: ["Finding raised", "Finding"],
  memory: ["Memory updated", "Memory"],
  note: ["Private observer note", "Thought"],
  question: ["Question created", "Question"],
  read: ["Q3 checked", "Read"],
  share: ["Question shared", "Share"],
  start: ["Run started", "System"],
  system: ["Run status", "System"],
};

export const VIEWS = {
  results: { title: "Results", kinds: [] },
  overview: {
    title: "Recent activity",
    kinds: ["question", "edit", "share", "answer", "finding", "error", "memory", "start", "system"],
    reverse: true,
    limit: 12,
  },
  conversation: { title: "Conversation", kinds: ["question", "edit", "share", "answer"] },
  findings: { title: "Findings", kinds: ["finding", "error"] },
  memories: { title: "Memories", kinds: ["memory"] },
  diagnostics: { title: "Diagnostics", kinds: null, reverse: true },
};

export function parseLine(line) {
  const match = line.match(/^\[(\d{2}:\d{2}:\d{2})\]\s+([\s\S]+)$/);
  if (!match) return null;
  const [, time, body] = match;
  const start = body.match(/^Run starts\. Online: (.+)\.$/);
  if (start) return { time, agent: null, kind: "start", text: body, participants: start[1].split(", ") };
  const agent = AGENTS.find((name) => body.startsWith(`${name} `) || body.startsWith(`${name}:`));
  if (!agent) {
    const text = body.startsWith("Report:") ? `Report saved: ${body.split(/[\\/]/).at(-1)}` : body;
    return { time, agent: null, kind: "system", text };
  }
  const message = body.slice(agent.length).trimStart();
  if (message.startsWith("FINDING:")) return { time, agent, kind: "finding", text: message.slice(8).trim() };
  if (message.startsWith(":")) {
    let text = message.slice(1).trim();
    if (text.startsWith('"') && text.endsWith('"')) text = text.slice(1, -1);
    return { time, agent, kind: "note", text };
  }
  const kinds = { answered: "answer", edited: "edit", asked: "question", shared: "share" };
  const verb = Object.keys(kinds).find((key) => message.startsWith(`${key} `));
  if (verb) return { time, agent, kind: kinds[verb], text: message };
  if (message.startsWith("looked at ")) return { time, agent, kind: "read", text: message };
  if (message.startsWith("updated memory:")) return { time, agent, kind: "memory", text: message };
  if (message.startsWith("tried ") || message.includes(" failed") || message.includes(" error") || message.includes("stops after")) {
    return { time, agent, kind: "error", text: message };
  }
  return { time, agent, kind: "system", text: message };
}

export const parseLog = (text) =>
  text
    .split(/(?=^\[\d{2}:\d{2}:\d{2}\]\s)/m)
    .map((event) => parseLine(event.replace(/\r?\n$/, "")))
    .filter(Boolean);

export function classifyFinding(text) {
  if (/security|privacy|permission|unauthori[sz]ed|access|expos|leak|boundary/i.test(text)) return "Security";
  if (/null|missing|corrupt|integrity|misattrib|duplicate|wrong profile/i.test(text)) return "Data";
  if (/timeout|error|failed|connection|refused|unavailable|render/i.test(text)) return "Runtime";
  return "Process";
}

const tableRows = (text, heading, nextHeading) => {
  const section = text.match(new RegExp(`${heading}\\n\\n([\\s\\S]*?)(?=\\n\\n${nextHeading})`))?.[1] ?? "";
  return section
    .split("\n")
    .filter((line) => line.startsWith("|") && !line.includes("---") && !line.includes("| Agent |") && !line.includes("| Observer |"))
    .map((line) => line.slice(1, -1).split(/(?<!\\)\|/).map((cell) => cell.trim().replaceAll("\\|", "|")));
};

export function parseReport(text) {
  const metrics = tableRows(text, "## Metrics", "## Judge");
  const pairs = tableRows(text, "## Judge", "### Leaks").map(([observer, subject, accuracy, links, note]) => ({
    observer,
    subject,
    accuracy: Number(accuracy),
    links,
    note,
  }));
  const leaks = (text.match(/### Leaks\n\n([\s\S]*?)(?=\n\n## )/)?.[1] ?? "")
    .split("\n\n")
    .filter((line) => line.startsWith("- ") && line !== "- none");
  const total = (index) => metrics.reduce((sum, row) => sum + (Number(row[index]) || 0), 0);
  const answered = metrics.reduce((sum, row) => sum + (Number(row[6]?.split("/")[0]) || 0), 0);
  const seen = metrics.reduce((sum, row) => sum + (Number(row[6]?.split("/")[1]) || 0), 0);
  return {
    pairs,
    leaks,
    average: pairs.length ? pairs.reduce((sum, pair) => sum + pair.accuracy, 0) / pairs.length : null,
    questions: total(2),
    edits: total(3),
    reshares: total(5),
    answered,
    seen,
    rejected: total(8),
    apiErrors: total(9),
    llmErrors: total(10),
  };
}
