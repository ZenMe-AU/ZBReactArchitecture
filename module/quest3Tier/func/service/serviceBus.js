/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { output } = require("@azure/functions");

const followUpCmdQueue = output.serviceBusQueue({
  queueName: "followupcmd",
  connection: "ServiceBusConnection",
});

const shareQuestionCmdQueue = output.serviceBusQueue({
  queueName: "shareQuestionCmd",
  connection: "ServiceBusConnection",
});

module.exports = {
  followUpCmdQueue,
  shareQuestionCmdQueue,
};
