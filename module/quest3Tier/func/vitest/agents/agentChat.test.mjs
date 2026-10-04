/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { describe, test } from "vitest";
import { runAgentChat } from "./agentChat.run.mjs";

describe.skipIf(!process.env.AGENT_RUN)("agent chat run", () => {
  test("agents get to know each other through Q3", runAgentChat, 60 * 60 * 1000);
});
