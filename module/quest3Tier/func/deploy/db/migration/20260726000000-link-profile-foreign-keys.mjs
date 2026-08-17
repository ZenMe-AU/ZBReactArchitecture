/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

"use strict";

const profileReferences = [
  ["question", "profileId", "question_profileId_fkey"],
  ["questionAnswer", "profileId", "questionAnswer_profileId_fkey"],
  ["questionShare", "senderProfileId", "questionShare_senderProfileId_fkey"],
  ["questionShare", "receiverProfileId", "questionShare_receiverProfileId_fkey"],
  ["logQuestion", "profileId", "logQuestion_profileId_fkey"],
  ["questionAction", "profileId", "questionAction_profileId_fkey"],
  ["followUpCmd", "senderProfileId", "followUpCmd_senderProfileId_fkey"],
  ["followUpFilter", "senderProfileId", "followUpFilter_senderProfileId_fkey"],
  ["followUpEvent", "senderProfileId", "followUpEvent_senderProfileId_fkey"],
  ["questionShareCmd", "senderProfileId", "questionShareCmd_senderProfileId_fkey"],
  ["questionShareEvent", "senderProfileId", "questionShareEvent_senderProfileId_fkey"],
];

// TODO: This doesn't seem to be secure parameter handling, investigate how to secure it.
const existingProfileIdsSql = profileReferences
  .map(([table, field]) => `SELECT "${field}" AS id FROM "${table}" WHERE "${field}" IS NOT NULL`)
  .join("\nUNION\n");

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    //TODO: This doesn't seem to be secure parameter handling, investigate how to secure it.
    await queryInterface.sequelize.query(
      `
        INSERT INTO "profile" ("internal_id", "external_id", "createdAt")
        SELECT id, id, NOW()
        FROM (${existingProfileIdsSql}) AS existing_profiles
        ON CONFLICT ("internal_id") DO NOTHING;
      `,
      { transaction }
    );

    for (const [table, field, name] of profileReferences) {
      await queryInterface.addConstraint(table, {
        fields: [field],
        type: "foreign key",
        name,
        references: {
          table: "profile",
          field: "internal_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        transaction,
      });
    }
  });
}

export async function down(queryInterface) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    for (const [table, , name] of [...profileReferences].reverse()) {
      await queryInterface.removeConstraint(table, name, { transaction });
    }
  });
}
