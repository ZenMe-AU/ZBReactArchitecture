/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { output } = require("@azure/functions");

const followUpCmdQueue = output.serviceBusQueue({
  queueName: "followupcmd",
  connection: "Zmchat_SERVICEBUS",
});

const shareQuestionCmdQueue = output.serviceBusQueue({
  queueName: "shareQuestionCmd",
  connection: "Zmchat_SERVICEBUS",
});

module.exports = {
  followUpCmdQueue,
  shareQuestionCmdQueue,
};
