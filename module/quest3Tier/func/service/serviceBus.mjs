/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { output } from "@azure/functions";

const followUpCmdQueue = output.serviceBusQueue({
  queueName: "followupcmd",
  connection: "ServiceBusConnection",
});

const shareQuestionCmdQueue = output.serviceBusQueue({
  queueName: "shareQuestionCmd",
  connection: "ServiceBusConnection",
});

export default {
  followUpCmdQueue,
  shareQuestionCmdQueue,
};
