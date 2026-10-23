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

interface CreateTableOptions {
  primaryKeys?: string[];
}

interface MigrationQueryInterface {
  createTable(
    tableName: string,
    attributes: Record<string, MigrationAttribute>,
    options?: CreateTableOptions,
  ): Promise<unknown>;

  dropTable(tableName: string): Promise<unknown>;
}

interface SequelizeDataTypes {
  UUID: unknown;
  UUIDV4: unknown;
  SMALLINT: unknown;
  JSON: unknown;
  DATE: unknown;
  NOW: unknown;
}

export async function up(
  queryInterface: MigrationQueryInterface,
  Sequelize: SequelizeDataTypes,
): Promise<void> {
  await queryInterface.createTable(
    "followUpFilter",
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      order: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.SMALLINT,
      },
      senderProfileId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      refQuestionId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      refOption: {
        allowNull: false,
        type: Sequelize.JSON,
      },
      newQuestionId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      primaryKeys: ["id", "order"],
    },
  );
}

export async function down(
  queryInterface: MigrationQueryInterface,
  _Sequelize: SequelizeDataTypes,
): Promise<void> {
  await queryInterface.dropTable("followUpFilter");
}
