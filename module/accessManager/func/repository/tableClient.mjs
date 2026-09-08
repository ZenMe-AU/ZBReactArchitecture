/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

import Question from "./Question.mjs";
import createFollowUpCmdRepository from "./FollowUpCmd.mjs";
import createFollowUpEventRepository from "./FollowUpEvent.mjs";

// credentials
const storageConnectionString = process.env.AzureWebJobsStorage?.trim() || process.env.AZURE_STORAGE_CONNECTION_STRING?.trim() || "UseDevelopmentStorage=true";
const useDevelopmentStorage = storageConnectionString.trim().toLowerCase() === "usedevelopmentstorage=true";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || "devstoreaccount1";
const accountKey = process.env.AZURE_STORAGE_KEY;
const endpoint = process.env.AZURE_STORAGE_TABLE_ENDPOINT || (useDevelopmentStorage ? "http://127.0.0.1:10002/devstoreaccount1" : undefined);
const credential = accountKey ? new AzureNamedKeyCredential(accountName, accountKey) : undefined;

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

// initialising raw Azure SDK clients
export const rawQuestionClient = createTableClient("Question");
export const rawFollowUpCmdClient = createTableClient("FollowUpCmd");
export const rawFollowUpEventClient = createTableClient("FollowUpEvent");

// injecting clients into repositories
export const questionRepository = Question(rawQuestionClient);
export const followUpCmdRepository = createFollowUpCmdRepository(rawFollowUpCmdClient);
export const followUpEventRepository = createFollowUpEventRepository(rawFollowUpEventClient);

/**
 * Ensures your Azurite/Azure storage infrastructure has the tables provisioned.
 * Run this function once during your Azure Function startup sequence.
 */
export async function initializeTables() {
  try {
    await rawQuestionClient.createTable();
    await rawFollowUpCmdClient.createTable();
    await rawFollowUpEventClient.createTable();
    console.log("Azure Table Storage NoSQL Table initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize tables:", error);
    throw error;
  }
}
