/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

interface MigrationAttribute {
  allowNull: boolean;
  primaryKey?: boolean;
  type: unknown;
  defaultValue?: unknown;
}

interface ForeignKeyConstraint {
  fields: string[];
  type: "foreign key";
  name: string;
  references: {
    table: string;
    field: string;
  };
  onDelete?: "CASCADE" | "SET NULL" | "RESTRICT" | "NO ACTION";
}

interface MigrationQueryInterface {
  createTable(
    tableName: string,
    attributes: Record<string, MigrationAttribute>,
  ): Promise<unknown>;

  addConstraint(
    tableName: string,
    constraint: ForeignKeyConstraint,
  ): Promise<unknown>;

  dropTable(tableName: string): Promise<unknown>;
}

interface SequelizeDataTypes {
  UUID: unknown;
  UUIDV4: unknown;
  DATE: unknown;
  NOW: unknown;
  SMALLINT: unknown;
}

export async function up(
  queryInterface: MigrationQueryInterface,
  Sequelize: SequelizeDataTypes,
): Promise<void> {
  await queryInterface.createTable("questionShare", {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    newQuestionId: {
      allowNull: false,
      type: Sequelize.UUID,
    },
    senderProfileId: {
      allowNull: false,
      type: Sequelize.UUID,
    },
    receiverProfileId: {
      allowNull: false,
      type: Sequelize.UUID,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    status: {
      allowNull: false,
      type: Sequelize.SMALLINT,
      defaultValue: 0,
    },
    type: {
      allowNull: false,
      type: Sequelize.SMALLINT,
      defaultValue: 0,
    },
  });

  await queryInterface.addConstraint("questionShare", {
    fields: ["newQuestionId"],
    type: "foreign key",
    name: "share_questionId_fkey",
    references: {
      table: "question",
      field: "id",
    },
    onDelete: "CASCADE",
  });
}

export async function down(
  queryInterface: MigrationQueryInterface,
  _Sequelize: SequelizeDataTypes,
): Promise<void> {
  await queryInterface.dropTable("questionShare");
}
