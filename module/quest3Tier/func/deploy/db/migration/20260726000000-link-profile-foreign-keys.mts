/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

type ProfileReference = readonly [
  table: string,
  field: string,
  constraintName: string,
];

interface Transaction {
  [key: string]: unknown;
}

interface QueryOptions {
  transaction: Transaction;
}

interface ForeignKeyConstraint extends QueryOptions {
  fields: string[];
  type: "foreign key";
  name: string;
  references: {
    table: string;
    field: string;
  };
  onUpdate?: "CASCADE" | "SET NULL" | "RESTRICT" | "NO ACTION";
  onDelete?: "CASCADE" | "SET NULL" | "RESTRICT" | "NO ACTION";
}

interface MigrationQueryInterface {
  sequelize: {
    transaction<T>(
      callback: (transaction: Transaction) => Promise<T>,
    ): Promise<T>;

    query(
      sql: string,
      options: QueryOptions,
    ): Promise<unknown>;
  };

  addConstraint(
    tableName: string,
    constraint: ForeignKeyConstraint,
  ): Promise<unknown>;

  removeConstraint(
    tableName: string,
    constraintName: string,
    options: QueryOptions,
  ): Promise<unknown>;
}

const profileReferences: readonly ProfileReference[] = [
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

const existingProfileIdsSql = profileReferences
  .map(
    ([table, field]) =>
      `SELECT "${field}" AS id FROM "${table}" WHERE "${field}" IS NOT NULL`,
  )
  .join("\nUNION\n");

export async function up(
  queryInterface: MigrationQueryInterface,
): Promise<void> {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      `
        INSERT INTO "profile" ("internal_id", "external_id", "createdAt")
        SELECT id, id, NOW()
        FROM (${existingProfileIdsSql}) AS existing_profiles
        ON CONFLICT ("internal_id") DO NOTHING;
      `,
      { transaction },
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

export async function down(
  queryInterface: MigrationQueryInterface,
): Promise<void> {
  await queryInterface.sequelize.transaction(async (transaction) => {
    for (const [table, , name] of [...profileReferences].reverse()) {
      await queryInterface.removeConstraint(
        table,
        name,
        { transaction },
      );
    }
  });
}
