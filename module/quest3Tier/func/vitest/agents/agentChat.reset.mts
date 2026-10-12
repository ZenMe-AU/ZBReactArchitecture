/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { getTableClient } from "../../repository/table/tableClient.mjs";
import { QUESTION_DATA_TABLE } from "../../repository/table/keys.mjs";
import { PROFILE_DISCLOSURES_TABLE } from "../../repository/table/profileRepository.mjs";

export function belongsToExperiment(row, profileIds, questionIds) {
  return (
    profileIds.has(row.profileId) ||
    profileIds.has(row.senderProfileId) ||
    profileIds.has(row.receiverProfileId) ||
    questionIds.has(row.questionId) ||
    questionIds.has(row.newQuestionId)
  );
}

export async function resetHumanExperiment(profileIds) {
  if (process.env.HUMAN_RUN !== "1" || !String(process.env.AzureWebJobsStorage).includes("UseDevelopmentStorage=true")) {
    throw new Error("Human experiment reset is allowed only for local Azurite runs");
  }

  const ids = new Set(profileIds);
  const questions = await getTableClient(QUESTION_DATA_TABLE);
  const rows = [];
  for await (const row of questions.listEntities()) rows.push(row);
  const questionIds = new Set(rows.filter((row) => ids.has(row.profileId) && row.questionText).map((row) => row.id));
  const doomed = rows.filter((row) => belongsToExperiment(row, ids, questionIds));
  await Promise.all(doomed.map((row) => questions.deleteEntity(row.partitionKey, row.rowKey)));

  const disclosures = await getTableClient(PROFILE_DISCLOSURES_TABLE);
  const disclosed = [];
  for await (const row of disclosures.listEntities()) {
    if (ids.has(row.partitionKey) || ids.has(row.rowKey)) disclosed.push(row);
  }
  await Promise.all(disclosed.map((row) => disclosures.deleteEntity(row.partitionKey, row.rowKey)));
  return { records: doomed.length, disclosures: disclosed.length };
}
