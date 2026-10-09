/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const element = (tag, className, text?) => {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export function renderResults({ activeAgent, elements, report, renderInspector }) {
  const pairs = activeAgent ? report.pairs.filter((pair) => pair.observer === activeAgent || pair.subject === activeAgent) : report.pairs;
  elements.viewTitle.textContent = "Results";
  elements.filterNote.textContent = activeAgent ? `${activeAgent} only` : `${report.pairs.length} memory pairs`;
  if (!report.pairs.length) {
    elements.feed.replaceChildren(element("li", "empty", "Results appear when the judge finishes."));
    renderInspector(null);
    return;
  }

  const summary = element("li", "result-grid");
  const values = [
    ["Memory accuracy", `${report.average.toFixed(1)} / 10`],
    ["Questions used", String(report.questions + report.edits)],
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
  const heading = element("li", "result-heading", "Memory accuracy");
  const rows = pairs.map((pair) => {
    const row = element("li", "score-row");
    const top = element("div", "score-top");
    top.append(element("strong", "", `${pair.observer} → ${pair.subject}`), element("strong", "", `${pair.accuracy}/10`));
    row.append(top, element("p", "", pair.note));
    return row;
  });
  const gap = element(
    "li",
    "model-gap",
    "Recipient-specific answers are not supported by the current API: answers are stored by question and respondent, not by asker relationship."
  );
  const failures = element(
    "li",
    "score-row",
    `Failed requests: ${report.rejected} rejected · ${report.apiErrors} API errors · ${report.llmErrors} LLM errors`
  );
  const leakItems = report.leaks.map((leak) => {
    const row = element("li", "score-row");
    row.append(element("p", "", leak.slice(2)));
    return row;
  });
  const leaks = leakItems.length ? [element("li", "result-heading", "Relationship and disclosure leaks"), ...leakItems] : [];
  elements.feed.replaceChildren(summary, heading, ...rows, ...leaks, failures, gap);
  renderInspector({
    kind: "system",
    agent: "Judge",
    time: "Complete",
    text: `Average memory accuracy ${report.average.toFixed(1)}/10. ${report.leaks.length} relationship or disclosure leaks found.`,
  });
}
