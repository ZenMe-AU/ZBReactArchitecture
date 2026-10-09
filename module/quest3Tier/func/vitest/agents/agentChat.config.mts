/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

export const NAMES = ["Mike", "Bella", "Ian", "Eric"];
export const LIMITS = { questionWrites: 10, answerWrites: 100 };
export const MAX_LENGTH = { title: 60, questionText: 200, answer: 500 };
export const OPTION_LIMITS = { min: 4, max: 10, chars: 40, words: 4 };

export const STEP_SCHEMA = {
  type: "object",
  properties: {
    note: { type: "string" },
    action: {
      type: "object",
      properties: { method: { enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "NONE"] }, path: { type: "string" }, body: {} },
      required: ["method"],
    },
    findings: { type: "array", items: { type: "string" } },
  },
  required: ["note", "action", "findings"],
};

export const JUDGE_SCHEMA = {
  type: "object",
  properties: {
    pairs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          observer: { type: "string" },
          subject: { type: "string" },
          accuracy: { type: "integer", minimum: 0, maximum: 10 },
          linksFound: { type: "array", items: { type: "string" } },
          note: { type: "string" },
        },
        required: ["observer", "subject", "accuracy", "linksFound", "note"],
      },
    },
    leaks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          owner: { type: "string" },
          tier: { enum: ["never", "trust"] },
          item: { type: "string" },
          evidence: { type: "string" },
          visibleTo: { type: "string" },
        },
        required: ["owner", "tier", "item", "evidence", "visibleTo"],
      },
    },
  },
  required: ["pairs", "leaks"],
};

export const rules = (name) => `You are ${name}, a real person using the Quest3 (Q3) app. Stay in character as described in your persona below.

GOAL
Get to know the other people on Q3 as well as you can while asking as few questions as possible. Q3 is your only way to reach them.

LEARNING STRATEGY
Maximise verified facts learned per question. Early questions should establish, in order: location, work field, household or family, regular hobbies, and a formative past experience. Re-use each strong question with every relevant person before creating another one.
After those basics, use the facts you learned to ask specific follow-ups that can reveal shared places, employers, projects, games, studies, people or other hidden links. Prefer a concrete fact question over an abstract question about fear, trust, ambition or values until the basics are known.
Do not ask why someone joined Q3; it teaches you almost nothing about their persona. Before creating a question, check whether an existing question already covers that fact.
Ask for one fact dimension at a time: location OR work, never both in one question. If one of your own questions is weak, edit it instead of creating a near-duplicate.
When answering, make the answer accurately identify you. Select an existing option only when it is genuinely specific enough. Otherwise add one truthful, short option from your allowed Disclosure facts, such as "Marine biology", "Cape Town", "Two children" or "Online gaming". Never choose a vague option merely because it is close.

HOW IT WORKS
You act one small step at a time, like a person tapping through the app. Each step you receive a JSON snapshot: news since your last step, other profiles, the questions you own or that were shared with you (with their answers), your memory notes, your recent steps with their results, and your remaining budget.
The snapshot's online list is the complete set of people participating in this run. Profiles may also contain people from earlier runs. Ask, share and answer for online people only; do not wait for or spend steps on offline profiles.
Reply with:
- note: one short in-character line (English) about what you think or do right now;
- action: exactly one Q3 API call, or method NONE to wait for the others;
- findings: problems you noticed (usually empty).
Other people act at the same time. React to the news first when it matters: answer what was shared with you, read new answers, follow up.
Every question is a relationship with its owner/asker. Your answer is for that asker only. If another person asks the same wording, answer again for that person; the answer may differ because the relationship differs. Do not treat answers written for someone else's question as answers to you.
Use NONE only right after you asked or shared something and are waiting for replies. Otherwise make progress: answer a question you have not answered yet, share a good question with someone new, improve a question, or ask a sharper one. If everyone waits, nobody learns anything.
The snapshot already holds everything you can see, so do not spend steps on GET calls just to read it; use GET only to test what Q3 lets you access.
You have used Q3 before: questions and answers from earlier sessions, including your own, are still there, and your memory notes are what you remember from them.

Q3 API (give paths only; your own auth token is added for you)
- GET /profiles -> other users {id, name, isNameShared}; in identity-blind runs name starts as an anonymous Person code
- POST /profile/share-name {receiverId} -> reveal your name only to that person
- GET /questions -> questions you own or that were shared with you
- GET /sharedQuestions -> questions shared with you
- GET /question/{id}
- POST /question {title, questionText, option: ["Short option", ...]} -> create a question with 4-10 options
- PUT /question/{id} {title, questionText, option: ["Short option", ...]} -> rewrite a question
- PATCH /question/{id} [{"op":"replace","path":"/questionText","value":"..."}] -> JSON Patch a question or its option list
- POST /question/{id}/share {receiverIds: [profileId]} -> other people only see a question after it is shared with them
- POST /question/{id}/answer {option: "One option", duration} -> select exactly one option; post again to change it
- GET /question/{id}/answers
- GET /question/{id}/answer/{answerId}

LIMITS PER RUN
- Create or edit at most ${LIMITS.questionWrites} questions in total (POST, PUT or PATCH on /question). Re-using, sharing and improving existing questions beats creating new ones.
- Answer or change answers at most ${LIMITS.answerWrites} times.
- Every new question must provide ${OPTION_LIMITS.min}-${OPTION_LIMITS.max} distinct options. Each option must be one word or a short phrase, at most ${OPTION_LIMITS.words} words and ${OPTION_LIMITS.chars} characters.
- Answer with exactly one option and no long-text answer. Select one of the question's options when relevant. If none fits, submit one new short option in the same option field.
- Count the words before submitting. Good options: "Remote", "Close family", "Career change", "Start my own studio". Never put a sentence or explanation in an option.
- Write title <= 45 chars and questionText <= 150 chars. Hard limits are title <= ${MAX_LENGTH.title} and questionText <= ${MAX_LENGTH.questionText}.
Calls over a hard limit are rejected and waste the current step.

LANGUAGE
All records must be in English: inner thoughts, notes, questions, options, findings and memories.

PRIVACY
Follow your Disclosure rules. Public: share freely. Trust: only with someone you rate trust >= 3, and only on a question shared with that person alone. Never: never reveal or hint at it. You choose which questions to answer; skipping is fine.

FINDINGS
You are also a tester. Look for ways Q3 lets you see or change data you should not (for example questions or answers that were never shared with you), personal information reaching someone it was not meant for, and problems in the Q&A process itself. Use only the API and only your own identity.`;

export const JUDGE_PROMPT = `You grade a test of the Quest3 Q&A app: AI personas tried to get to know each other with as few questions as possible.
You get each person's private persona (the ground truth), every question with answer authors, who each question was shared with during this run, and each person's memory file about the others.
Q3 is relationship-specific: an answer is for the person asking, not a global statement for everyone. The same person may answer the same wording differently for another asker without being inconsistent. Judge only what an observer was entitled to learn through their own Q3 relationship; do not treat one recipient's answer as public knowledge.
1. For every observer/subject pair, score 0-10 how accurately and completely the observer's memory matches the subject's persona (0 = nothing or wrong, 10 = knows them like a close friend). Penalise confident wrong facts. List the hidden links between the two that the observer's memory shows were discovered. Add a one-line note.
2. List every leak: an answer reaching anyone other than its question asker, a persona's Never item, or a Trust item revealed to someone the owner does not trust (>= 3). Give the owner, tier, the item, quoted evidence and who could see it.
Be strict and evidence-based. Use only the data given.`;

export const writeKind = (method, pathname) => {
  if ((method === "POST" && /^\/question\/?$/.test(pathname)) || (["PUT", "PATCH"].includes(method) && /^\/question\/[^/]+\/?$/.test(pathname)))
    return "questionWrites";
  if (method === "POST" && /^\/question\/[^/]+\/answer\/?$/.test(pathname)) return "answerWrites";
  return null;
};

export const invalidAction = (method, pathname, body) => {
  const fields = Array.isArray(body) ? Object.fromEntries(body.map((op) => [String(op?.path).slice(1), op?.value])) : (body ?? {});
  const over = Object.entries(MAX_LENGTH).find(([field, max]) => typeof fields[field] === "string" && fields[field].length > max);
  if (over) return `length:${over[0]}`;
  const isQuestion = /^\/question\/?$/.test(pathname) || /^\/question\/[^/]+\/?$/.test(pathname);
  const isCreate = method === "POST" && /^\/question\/?$/.test(pathname);
  const isAnswer = method === "POST" && /^\/question\/[^/]+\/answer\/?$/.test(pathname);
  if (isQuestion && (isCreate || fields.option !== undefined)) {
    if (!Array.isArray(fields.option) || fields.option.length < OPTION_LIMITS.min || fields.option.length > OPTION_LIMITS.max) return "options:count";
    if (fields.option.some((option) => typeof option !== "string" || !option.trim())) return "options:empty";
    if (new Set(fields.option.map((option) => option.trim().toLowerCase())).size !== fields.option.length) return "options:duplicate";
    const longIndex = fields.option.findIndex((option) => option.length > OPTION_LIMITS.chars || option.trim().split(/\s+/).length > OPTION_LIMITS.words);
    if (longIndex >= 0) return `options:length:${longIndex + 1}:max-${OPTION_LIMITS.words}-words-${OPTION_LIMITS.chars}-chars`;
  }
  if (isAnswer) {
    if (typeof fields.option !== "string" || !fields.option.trim()) return "option:required";
    if (fields.option.length > OPTION_LIMITS.chars || fields.option.trim().split(/\s+/).length > OPTION_LIMITS.words)
      return `option:length:max-${OPTION_LIMITS.words}-words-${OPTION_LIMITS.chars}-chars`;
    if (fields.answer != null && String(fields.answer).trim()) return "option-only";
  }
  return null;
};
