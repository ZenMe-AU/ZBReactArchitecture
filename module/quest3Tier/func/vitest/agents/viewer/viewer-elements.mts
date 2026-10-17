/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const select = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector);

export const elements = typeof document === "undefined" ? null : {
  announcer: select<HTMLElement>("#announcer"),
  eventActor: select<HTMLElement>("#event-actor"),
  eventKind: select<HTMLElement>("#event-kind"),
  eventText: select<HTMLElement>("#event-text"),
  eventTime: select<HTMLElement>("#event-time"),
  eventTitle: select<HTMLElement>("#event-title"),
  feed: select<HTMLElement>("#event-feed"),
  feedHead: select<HTMLElement>(".feed-head"),
  filterNote: select<HTMLElement>("#filter-note"),
  agentStartButton: select<HTMLButtonElement>("#run-agent-test"),
  chatClose: select<HTMLButtonElement>("#close-chat"),
  chatAgentPicker: select<HTMLElement>("#chat-agent-picker"),
  chatForm: select<HTMLFormElement>("#chat-form"),
  chatInput: select<HTMLInputElement>("#chat-input"),
  chatMessages: select<HTMLElement>("#chat-messages"),
  chatPanel: select<HTMLElement>("#chat-panel"),
  chatTitle: select<HTMLElement>("#chat-title"),
  chatRunLabel: select<HTMLElement>("#chat-run-label"),
  chatStatus: select<HTMLElement>("#chat-status"),
  chatSend: select<HTMLButtonElement>("#chat-send"),
  inspector: select<HTMLElement>(".inspector"),
  profileCards: select<HTMLElement>("#profile-cards"),
  runList: select<HTMLElement>("#run-list"),
  runParticipants: select<HTMLElement>("#run-participants"),
  runStatus: select<HTMLElement>("#run-status"),
  runTitle: select<HTMLElement>("#run-title"),
  viewTabs: select<HTMLElement>("#view-tabs"),
  viewTitle: select<HTMLElement>("#view-title"),
};
