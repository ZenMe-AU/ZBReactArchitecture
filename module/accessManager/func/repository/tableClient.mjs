/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

import Question from "./Question.mjs";
import createFollowUpCmdRepository from "./FollowUpCmd.mjs";
import createFollowUpEventRepository from "./FollowUpEvent.mjs";

// credentials
const accountName = "devstoreaccount1";
const accountKey = process.env.AZURE_STORAGE_KEY;
const endpoint = process.env.AZURE_STORAGE_TABLE_ENDPOINT;
const credential = new AzureNamedKeyCredential(accountName, accountKey);

// initialising raw Azure SDK clients
export const rawQuestionClient = new TableClient(endpoint, "Question", credential, { allowInsecureConnection: true });
export const rawFollowUpCmdClient = new TableClient(endpoint, "FollowUpCmd", credential);
export const rawFollowUpEventClient = new TableClient(endpoint, "FollowUpEvent", credential);

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
