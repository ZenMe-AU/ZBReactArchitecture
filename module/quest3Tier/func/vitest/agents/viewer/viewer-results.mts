/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { questionTopic } from "./viewer-data.mjs";

const element = (tag, className, text?) => {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const emptyResults = (elements, renderInspector) => {
  elements.feed.replaceChildren(element("li", "empty", "Evaluation results appear when the judge finishes."));
  renderInspector(null);
};

export function renderOverview({ activeAgent, elements, report, renderInspector }) {
  elements.viewTitle.textContent = "Run overview";
  elements.filterNote.textContent = activeAgent ? `${activeAgent} selected` : "Judge summary";
  if (!report.pairs.length) {
    return emptyResults(elements, renderInspector);
  }

  const topicCount = new Set(report.questionList.map(questionTopic)).size;
  const overlap = Math.max(0, report.questionList.length - topicCount);
  const summary = element("li", "result-grid");
  const values = [
    ["Memory accuracy", `${report.average.toFixed(1)} / 10`],
    ["Unique topics", String(topicCount)],
    ["Answer coverage", `${report.answered} / ${report.seen}`],
    ["Privacy leaks", String(report.leaks.length)],
  ];
  summary.append(
    ...values.map(([label, value]) => {
      const card = element("div", "result-card");
      card.append(element("span", "", label), element("strong", "", value));
      return card;
    })
  );
  const insight = element("li", "run-insight");
  insight.append(
    element("strong", "", report.average < 5 ? "High participation, shallow understanding" : "Understanding is forming"),
    element(
      "p",
      "",
      `${report.answered} of ${report.seen} visible questions were answered, but memory accuracy is ${report.average.toFixed(1)}/10. ${overlap} question${overlap === 1 ? "" : "s"} overlapped an existing topic.`
    )
  );
  const health = element("li", "score-row");
  health.append(
    element("div", "score-top", "Run health"),
    element("p", "", `${report.answerSubmissions} answer submissions covered ${report.answered} unique agent-question pairs; ${report.answerChanges} were changes. ${report.rejected} rejected requests, ${report.apiErrors} API errors, ${report.llmErrors} LLM errors. ${report.reshares} questions were reused or re-shared.`)
  );
  const gap = element(
    "li",
    "model-gap",
    "Recipient-specific answers are not supported by the current API: answers are stored by question and respondent, not by asker relationship."
  );
  elements.feed.replaceChildren(summary, insight, health, gap);
  renderInspector({
    kind: "system",
    agent: "Judge",
    time: "Complete",
    text: `Average memory accuracy: ${report.average.toFixed(1)}/10\nAnswer coverage: ${report.answered}/${report.seen}\nPrivacy leaks: ${report.leaks.length}`,
  });
}

export function renderRelationships({ activeAgent, elements, report, renderInspector }) {
  elements.viewTitle.textContent = "Who learned what";
  elements.filterNote.textContent = activeAgent ? `${activeAgent} relationships` : "Select a pair to inspect";
  if (!report.pairs.length) return emptyResults(elements, renderInspector);

  const pairs = activeAgent ? report.pairs.filter((pair) => pair.observer === activeAgent || pair.subject === activeAgent) : report.pairs;
  const choices = pairs.map((pair, index) => {
    const button = element("button", "relationship-choice");
    button.append(
      element("span", "relationship-names", `${pair.observer} learned about ${pair.subject}`),
      element("span", "relationship-result", `${pair.accuracy}/10${pair.detailsAvailable && pair.incorrectFacts.length ? ` | ${pair.incorrectFacts.length} wrong` : ""}`)
    );
    button.type = "button";
    button.classList.toggle("is-selected", index === 0);
    button.addEventListener("click", () => {
      for (const selected of elements.feed.querySelectorAll(".is-selected")) selected.classList.remove("is-selected");
      button.classList.add("is-selected");
      inspectPair(pair, renderInspector);
    });
    return button;
  });
  const help = element("li", "relationship-help", "The first person learned facts about the second person. Select one pair to see the judge's assessment.");
  const grid = element("li", "relationship-grid");
  grid.append(...choices);
  elements.feed.replaceChildren(help, grid);
  inspectPair(pairs[0], renderInspector);
}

export function renderNetwork({ activeAgent, elements, network, report, renderInspector }) {
  const names = Object.keys(network);
  const selected = activeAgent && network[activeAgent] ? activeAgent : names[0];
  elements.viewTitle.textContent = "Friend network";
  elements.filterNote.textContent = selected ? `${selected}'s repository record` : "No participant profiles recorded";
  if (!selected) return emptyResults(elements, renderInspector);

  const friends = network[selected] ?? [];
  const namesById = new Map([[report.profileIds[selected], selected]]);
  for (const list of Object.values(network)) {
    for (const friend of list as any[]) namesById.set(friend.id, friend.name);
  }
  const groups = [["Direct friends", friends.filter((friend) => friend.degree === 1)], ["Extended network", friends.filter((friend) => friend.degree > 1)]];
  const rows = groups.flatMap(([title, group]) => {
    if (!(group as any[]).length) return [];
    const heading = element("li", "network-heading", title as string);
    return [heading, ...(group as any[]).map((friend) => {
      const path = friend.path.map((id) => namesById.get(id) ?? "Unknown").join(" → ");
      const row = element("li", "network-row");
      row.append(element("strong", "", friend.name), element("span", "", `${friend.degree} hop${friend.degree === 1 ? "" : "s"} · ${path}`));
      return row;
    })];
  });
  if (!rows.length) rows.push(element("li", "empty", "No recorded friends within four degrees."));
  elements.feed.replaceChildren(...rows);
  renderInspector({
    kind: "system",
    agent: "Repository",
    time: "Current",
    title: `${selected}'s network`,
    kindLabel: "Friend rows",
    text: friends.length ? `${friends.length} people found within four degrees. Names are read from their current Profile records.` : "No friend rows found for this profile.",
  });
}

function inspectPair(pair, renderInspector) {
  const facts = (items) => items.length ? items.map((item) => `- ${item}`).join("\n") : "- None recorded";
  const factCheck = pair.detailsAvailable
    ? [`Correct facts\n${facts(pair.correctFacts)}`, `Incorrect or unsupported\n${facts(pair.incorrectFacts)}`, `Important facts still missing\n${facts(pair.missingFacts)}`]
    : ["Fact-by-fact check\nNot available for this older run. Use the judge assessment above."];
  renderInspector({
    kind: "memory",
    title: `${pair.observer} learned about ${pair.subject}`,
    actorLabel: `Learner: ${pair.observer}`,
    kindLabel: `About: ${pair.subject}`,
    time: `Score ${pair.accuracy}/10`,
    text: [
      `Judge assessment\n${pair.note}`,
      ...factCheck,
      `Connection found\n${pair.links === "-" ? "None" : pair.links}`,
      `Stored memory\n${pair.memory || "Not available for this older run."}`,
    ].join("\n\n"),
  });
}
