/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const oneLine = (value) => String(value).replace(/\s+/g, " ").trim();

export function factMemory(owner, subjects, questions) {
  const facts = Object.fromEntries(subjects.map((name) => [name, new Set()]));
  for (const question of questions) {
    for (const answer of question.answers ?? []) {
      const author = answer.memoryAuthor ?? answer.author ?? (answer.profileId ? owner : null);
      const value = answer.optionId ?? answer.answerText;
      if (!facts[author] || !question.id || !answer.id || !value) continue;
      facts[author].add(
        `- ${oneLine(question.questionText)} — ${oneLine(value)} (question: ${question.id}; answer: ${answer.id})`
      );
    }
  }
  return Object.fromEntries(
    subjects.map((name) => [name, `### Facts\n${[...facts[name]].join("\n") || "- None verified."}`])
  );
}
