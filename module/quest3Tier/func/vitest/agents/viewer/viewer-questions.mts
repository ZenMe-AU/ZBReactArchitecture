/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const titleFrom = (text) => text.match(/^[^\"]*"([^"]+)"/)?.[1];

type Question = { title: string; owner: string; text: string; answers: string[]; agents: Set<string>; isNew: boolean };
type QuestionEvent = { agent: string; kind: string; text: string };
type ReportQuestion = Omit<Question, "agents" | "isNew">;

function groupQuestions(events: QuestionEvent[], reportQuestions: ReportQuestion[]) {
  const questions = new Map<string, Question>(
    reportQuestions.map((question) => [question.title, { ...question, agents: new Set([question.owner]), isNew: false }])
  );
  for (const event of events.filter((item) => ["question", "edit", "share", "answer"].includes(item.kind))) {
    const title = titleFrom(event.text);
    if (!title) continue;
    const question = questions.get(title) ?? { title, owner: "Unknown", text: "", answers: [], agents: new Set(), isNew: false };
    question.agents.add(event.agent);
    if (event.kind === "question") {
      question.owner = event.agent;
      question.isNew = true;
      question.text ||= event.text.split(/":\s*/, 2)[1] ?? "";
    }
    if (event.kind === "answer") {
      const answer = event.text.split(/":\s*/, 2)[1] ?? "Answer recorded";
      if (!question.answers.includes(answer)) question.answers.push(answer);
    }
    questions.set(title, question);
  }
  return [...questions.values()];
}

export function renderQuestions({ activeAgent, elements, events, questions: reportQuestions, renderInspector }) {
  const questions = groupQuestions(events, reportQuestions).filter(
    (question) => !activeAgent || question.owner === activeAgent || question.agents.has(activeAgent)
  );
  elements.viewTitle.textContent = "Questions";
  elements.filterNote.textContent = `${questions.length} ${activeAgent ? `involving ${activeAgent}` : "visible this run"}`;
  if (!questions.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No questions are visible in this run yet.";
    elements.feed.replaceChildren(empty);
    renderInspector(null);
    return;
  }

  const inspect = (question) =>
    renderInspector({
      agent: question.owner,
      kind: "question",
      time: question.isNew ? "This run" : "Earlier run",
      text: [question.text, ...question.answers.map((answer) => `Answer: ${answer}`)].filter(Boolean).join("\n\n"),
    });
  const items = questions.map((question, index) => {
    const item = document.createElement("li");
    item.className = "feed-item kind-question";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "feed-button question-summary";
    button.innerHTML = `<span><strong></strong><small></small></span><span class="question-count"></span>`;
    button.querySelector("strong").textContent = question.title;
    button.querySelector("small").textContent = `${question.isNew ? "New this run" : "Reused"} · ${question.owner}`;
    button.querySelector(".question-count").textContent = `${question.answers.length} answer${question.answers.length === 1 ? "" : "s"}`;
    button.addEventListener("click", () => {
      for (const selected of elements.feed.querySelectorAll(".is-selected")) selected.classList.remove("is-selected");
      button.classList.add("is-selected");
      inspect(question);
    });
    if (index === 0) button.classList.add("is-selected");
    item.append(button);
    return item;
  });
  elements.feed.replaceChildren(...items);
  inspect(questions[0]);
}
