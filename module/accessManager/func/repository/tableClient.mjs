/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

import FollowUpCmd from "./FollowUpCmd.mjs";
import FollowUpEvent from "./FollowUpEvent.mjs";
import FollowUpFilter from "./FollowUpFilter.mjs";
import Profile from "./Profile.mjs";
import Question from "./Question.mjs";
import QuestionAnswer from "./QuestionAnswer.mjs";
import QuestionLog from "./QuestionLog.mjs";
import QuestionAction from "./QuestionAction.mjs";
import QuestionShare from "./QuestionShare.mjs";
import QuestionShareCmd from "./QuestionShareCmd.mjs";
import QuestionShareEvent from "./QuestionShareEvent.mjs";


import {
  storageConnectionString,
  useDevelopmentStorage,
  accountName,
  accountKey,
  endpoint,
  credential
} from "../di/azureTableConfig.mjs";

// connecting to storage account and creating table clients
const createTableClient = (tableName) => {
  if (storageConnectionString) {
    return TableClient.fromConnectionString(storageConnectionString, tableName, {
      allowInsecureConnection: useDevelopmentStorage,
    });
  }
  if (!endpoint || !credential) {
    throw new Error("Missing Azure Table Storage configuration. Set AzureWebJobsStorage or AZURE_STORAGE_CONNECTION_STRING, or run Azurite locally.");
  }
  return new TableClient(endpoint, tableName, credential, {
    allowInsecureConnection: endpoint.startsWith("http://"),
  });
};

// initialising raw Azure SDK clients for tables
const questionTableClient = createTableClient("Question");
const questionAnswerTableClient = createTableClient("QuestionAnswer");
const profileTableClient = createTableClient("Profile");
const questionActionTableClient = createTableClient("QuestionAction");
const followUpCmdTableClient = createTableClient("FollowUpCmd");
const followUpEventTableClient = createTableClient("FollowUpEvent");
const questionShareTableClient = createTableClient("QuestionShare");
const questionShareCmdTableClient = createTableClient("QuestionShareCmd");
const questionShareEventTableClient = createTableClient("QuestionShareEvent");
const questionLogTableClient = createTableClient("QuestionLog");


// injecting clients into repositories
const questionRepository = Question(questionTableClient);
const questionAnswerRepository = QuestionAnswer(questionAnswerTableClient);
const profileRepository = Profile(profileTableClient);
const questionActionRepository = QuestionAction(questionActionTableClient)
const followUpCmdRepository = FollowUpCmd(followUpCmdTableClient)
const followUpEventRepository = FollowUpEvent(followUpEventTableClient)
const questionShareRepository = QuestionShare(questionShareTableClient, questionRepository)
const questionShareEventRepository = QuestionShareEvent(questionShareEventTableClient)
const questionShareCmdRepository = QuestionShareCmd(questionShareCmdTableClient, questionShareEventRepository)
const questionLogRepository = QuestionLog(questionLogTableClient)

export {
  questionRepository,
  questionAnswerRepository,
  profileRepository,
  questionActionRepository,
  followUpCmdRepository,
  followUpEventRepository,
  questionShareRepository,
  questionShareCmdRepository,
  questionShareEventRepository,
  questionLogRepository,
};

export async function initialiseTables() {
  try {
    await questionTableClient.createTable();
    await questionAnswerTableClient.createTable();
    await profileTableClient.createTable();
    await questionActionTableClient.createTable();
    await followUpCmdTableClient.createTable();
    await followUpEventTableClient.createTable();
    await questionShareTableClient.createTable();
    await questionShareCmdTableClient.createTable();
    await questionShareEventTableClient.createTable();
    await questionLogTableClient.createTable();
    console.log("Azure Table Storage NoSQL Tables initialised successfully.");
  } catch (error) {
    console.error("Failed to initialise tables:", error);
    throw error;
  }
}

export default {
  questionRepository,
  questionAnswerRepository,
  profileRepository,
  questionActionRepository,
  followUpCmdRepository,
  followUpEventRepository,
  questionShareRepository,
  questionShareCmdRepository,
  questionShareEventRepository,
  questionLogRepository,
}