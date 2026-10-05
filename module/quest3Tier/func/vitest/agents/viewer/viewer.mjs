/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { AGENTS, classifyFinding, KINDS, parseLog, parseReport, VIEWS } from "./viewer-data.mjs";
import { renderQuestions } from "./viewer-questions.mjs";
import { renderResults as showResults } from "./viewer-results.mjs";

const elements =
  typeof document === "undefined"
    ? null
    : {
        announcer: document.querySelector("#announcer"),
        eventActor: document.querySelector("#event-actor"),
        eventKind: document.querySelector("#event-kind"),
        eventText: document.querySelector("#event-text"),
        eventTime: document.querySelector("#event-time"),
        eventTitle: document.querySelector("#event-title"),
        feed: document.querySelector("#event-feed"),
        filterNote: document.querySelector("#filter-note"),
        runList: document.querySelector("#run-list"),
        runParticipants: document.querySelector("#run-participants"),
        startButton: document.querySelector("#run-start"),
        runStatus: document.querySelector("#run-status"),
        runTitle: document.querySelector("#run-title"),
        viewTabs: document.querySelector("#view-tabs"),
        viewTitle: document.querySelector("#view-title"),
      };

let selectedRun = "";
let latestRun = "";
let renderedSignature = "";
let announcedRun = "";
let announcedCount = 0;
let activeView = "results";
let activeAgent = "";
let currentEvents = [];
let currentReport = parseReport("");
let selectedEventId = null;

const detailsForRun = (name) => {
  const match = name.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-[^_]+_(.+)\.chat\.md$/);
  if (!match) return { title: name.replace(".chat.md", ""), agents: "" };
  const [, date, hour, minute, names] = match;
  const [year, month, day] = date.split("-").map(Number);
  const monthName = new Intl.DateTimeFormat("en", { month: "short" }).format(new Date(year, month - 1, day));
  return { title: `${monthName} ${day}, ${hour}:${minute}`, agents: names.replaceAll("-", ", ") };
};

function setCount(name, value) {
  const target = document.querySelector(`[data-count="${name}"]`);
  if (target) target.textContent = String(value);
}

const participantsFor = (events) => new Set(events.find((event) => event.kind === "start")?.participants ?? events.map((event) => event.agent).filter(Boolean));

function visibleEvents() {
  const view = VIEWS[activeView];
  let events = currentEvents.filter((event) => (!view.kinds || view.kinds.includes(event.kind)) && (!activeAgent || event.agent === activeAgent));
  if (view.reverse) events = [...events].reverse();
  return events.slice(0, view.limit ?? 120);
}

function renderInspector(event) {
  elements.eventTitle.textContent = event ? KINDS[event.kind][0] : "No event selected";
  elements.eventActor.textContent = event?.agent ?? "Q3 system";
  elements.eventTime.textContent = event?.time ?? "--:--:--";
  elements.eventKind.textContent = event?.kind === "finding" ? classifyFinding(event.text) : event ? KINDS[event.kind][1] : "System";
  elements.eventText.textContent = event?.text ?? "Choose an event from the activity view.";
}

const renderResults = () => showResults({ activeAgent, elements, report: currentReport, renderInspector });

function renderAgentCards(participants) {
  const latestAgent = [...currentEvents].reverse().find((event) => event.agent)?.agent;
  for (const name of AGENTS) {
    const card = document.querySelector(`[data-agent="${name}"]`);
    const events = currentEvents.filter((event) => event.agent === name);
    const latest = events.at(-1);
    const questions = events.filter((event) => event.kind === "question" || event.kind === "edit").length;
    const answers = events.filter((event) => event.kind === "answer").length;
    card.classList.toggle("is-online", participants.has(name));
    card.classList.toggle("is-active", name === latestAgent);
    card.classList.toggle("is-selected", name === activeAgent);
    card.setAttribute("aria-pressed", String(name === activeAgent));
    card.querySelector(".agent-state").textContent = participants.has(name) ? (latest ? KINDS[latest.kind][1] : "Ready") : "Offline";
    card.querySelector(".agent-budget").textContent = `Q ${questions}  A ${answers}`;
  }
}

function renderFeed() {
  const view = VIEWS[activeView];
  if (activeView === "results") return renderResults();
  if (activeView === "questions")
    return renderQuestions({ activeAgent, elements, events: currentEvents, questions: currentReport.questionList, renderInspector });
  const events = visibleEvents();
  elements.viewTitle.textContent = view.title;
  elements.filterNote.textContent = activeAgent ? `${activeAgent} only` : "All agents";

  if (!events.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = activeAgent ? `No ${view.title.toLowerCase()} events from ${activeAgent}.` : `No ${view.title.toLowerCase()} events yet.`;
    elements.feed.replaceChildren(empty);
    renderInspector(null);
    return;
  }

  if (!events.some((event) => event.id === selectedEventId)) selectedEventId = view.reverse ? events[0].id : events.at(-1).id;
  const items = events.map((event) => {
    const item = document.createElement("li");
    item.className = `feed-item kind-${event.kind}`;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "feed-button";
    button.classList.toggle("is-selected", event.id === selectedEventId);
    button.setAttribute("aria-pressed", String(event.id === selectedEventId));

    const meta = document.createElement("span");
    meta.className = "feed-meta";
    const actor = document.createElement("strong");
    actor.textContent = event.agent ?? "Q3";
    const kind = document.createElement("span");
    kind.className = "tag";
    kind.textContent = KINDS[event.kind][1];
    const time = document.createElement("time");
    time.textContent = event.time;
    meta.append(actor, kind);
    if (event.kind === "finding") {
      const category = document.createElement("span");
      category.className = "tag alert";
      category.textContent = classifyFinding(event.text);
      meta.append(category);
    }
    meta.append(time);
    const text = document.createElement("p");
    text.className = "feed-text";
    text.textContent = event.text;
    button.append(meta, text);
    button.addEventListener("click", () => {
      selectedEventId = event.id;
      renderFeed();
    });
    item.append(button);
    return item;
  });
  elements.feed.replaceChildren(...items);
  renderInspector(currentEvents.find((event) => event.id === selectedEventId));
}

function render(events, mtime) {
  currentEvents = events.map((event, id) => ({ ...event, id }));
  const participants = participantsFor(currentEvents);
  const latest = currentEvents.at(-1);
  const complete = currentEvents.some((event) => event.text.startsWith("Report saved:"));
  const grading = currentEvents.some((event) => event.text === "Judge is grading...");
  const reflecting = currentEvents.some((event) => event.text === "Everyone is done. Final memory update...");
  const fresh = Date.now() - mtime < 15_000;
  elements.runStatus.textContent = complete ? "Complete" : grading ? "Grading" : reflecting ? "Reflecting" : fresh ? "Live" : "Replay";
  elements.runStatus.dataset.state = complete ? "complete" : fresh ? "live" : "idle";
  const runDetails = detailsForRun(selectedRun);
  elements.runTitle.textContent = runDetails.title;
  elements.runParticipants.textContent = [...participants].join(", ");

  renderAgentCards(participants);
  renderFeed();
  setCount("participants", participants.size);
  setCount("questions", currentEvents.filter((event) => event.kind === "question" || event.kind === "edit").length);
  setCount("answers", currentEvents.filter((event) => event.kind === "answer").length);
  setCount("shares", currentEvents.filter((event) => event.kind === "share").length);
  setCount("findings", currentEvents.filter((event) => event.kind === "finding").length);

  if (selectedRun === announcedRun && currentEvents.length > announcedCount && latest) {
    elements.announcer.textContent = `${latest.agent ?? "System"}: ${latest.text}`;
  }
  announcedRun = selectedRun;
  announcedCount = currentEvents.length;
}

async function loadRuns() {
  const response = await fetch("/api/runs", { cache: "no-store" });
  if (!response.ok) throw new Error("Could not list agent runs");
  const { runs } = await response.json();
  const names = runs.map((run) => run.name);
  const newestRun = names[0] ?? "";
  if (!selectedRun || !names.includes(selectedRun) || selectedRun === latestRun) selectedRun = newestRun;
  latestRun = newestRun;
  const signature = names.join("\n");
  if (elements.runList.dataset.signature !== signature) {
    elements.runList.dataset.signature = signature;
    elements.runList.replaceChildren(
      ...runs.map((run) => {
        const details = detailsForRun(run.name);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "run-item";
        button.dataset.run = run.name;
        const title = document.createElement("strong");
        title.textContent = details.title;
        const agents = document.createElement("span");
        agents.textContent = details.agents;
        button.append(title, agents);
        return button;
      })
    );
  }
  for (const item of elements.runList.querySelectorAll("[data-run]")) {
    item.classList.toggle("is-selected", item.dataset.run === selectedRun);
    item.setAttribute("aria-current", item.dataset.run === selectedRun ? "true" : "false");
  }
}

async function loadRunState() {
  const response = await fetch("/api/run", { cache: "no-store" });
  if (!response.ok) throw new Error("Could not read the test runner state");
  const state = await response.json();
  const running = state.status === "starting" || state.status === "running";
  elements.startButton.disabled = running;
  elements.startButton.textContent = state.status === "starting" ? "Starting services..." : running ? "Running..." : "New test";
  elements.startButton.title = state.error ?? (state.status === "failed" ? `Test exited with code ${state.exitCode ?? "unknown"}` : "");
}

async function refreshLog() {
  if (!selectedRun) return render([], 0);
  const [response, reportResponse] = await Promise.all([
    fetch(`/api/log?run=${encodeURIComponent(selectedRun)}`, { cache: "no-store" }),
    fetch(`/api/report?run=${encodeURIComponent(selectedRun)}`, { cache: "no-store" }),
  ]);
  if (!response.ok) throw new Error("Could not load the selected run");
  const data = await response.json();
  const report = reportResponse.ok ? await reportResponse.json() : { text: "" };
  const signature = `${data.run}:${data.mtime}:${data.text.length}:${report.text.length}`;
  if (signature === renderedSignature) return;
  renderedSignature = signature;
  currentReport = parseReport(report.text);
  render(parseLog(data.text), data.mtime);
}

async function update() {
  try {
    await Promise.all([loadRuns(), loadRunState()]);
    await refreshLog();
  } catch (error) {
    elements.runStatus.textContent = "Unavailable";
    elements.runStatus.dataset.state = "idle";
    elements.eventTitle.textContent = "Viewer could not read the run";
    elements.eventText.textContent = error instanceof Error ? error.message : String(error);
  }
}

if (elements) {
  elements.startButton.addEventListener("click", async () => {
    elements.startButton.disabled = true;
    elements.startButton.textContent = "Starting...";
    try {
      const response = await fetch("/api/run", { method: "POST" });
      const state = await response.json();
      if (!response.ok) throw new Error(state.error ?? "Could not start the test");
      elements.announcer.textContent = "Agent test started";
      await loadRunState();
    } catch (error) {
      elements.startButton.disabled = false;
      elements.startButton.textContent = "Retry test";
      elements.announcer.textContent = error instanceof Error ? error.message : String(error);
    }
  });
  elements.runList.addEventListener("click", (event) => {
    const item = event.target.closest("[data-run]");
    if (!item) return;
    selectedRun = item.dataset.run;
    renderedSignature = "";
    announcedRun = "";
    announcedCount = 0;
    selectedEventId = null;
    refreshLog();
    loadRuns();
  });
  elements.viewTabs.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-view]");
    if (!tab) return;
    activeView = tab.dataset.view;
    selectedEventId = null;
    for (const item of elements.viewTabs.querySelectorAll("[data-view]")) item.setAttribute("aria-selected", String(item === tab));
    renderFeed();
  });
  for (const card of document.querySelectorAll("[data-agent]")) {
    card.addEventListener("click", () => {
      activeAgent = activeAgent === card.dataset.agent ? "" : card.dataset.agent;
      selectedEventId = null;
      renderAgentCards(participantsFor(currentEvents));
      renderFeed();
    });
  }
  await update();
  // ponytail: whole-file polling is enough for short test logs; switch to byte ranges only if runs become large.
  setInterval(update, 1_000);
}
