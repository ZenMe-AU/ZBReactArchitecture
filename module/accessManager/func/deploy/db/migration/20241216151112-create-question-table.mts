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

interface MigrationQueryInterface {
  createTable(
    tableName: string,
    attributes: Record<string, MigrationAttribute>,
  ): Promise<unknown>;

  dropTable(tableName: string): Promise<unknown>;
}

interface SequelizeDataTypes {
  UUID: unknown;
  UUIDV4: unknown;
  STRING: unknown;
  TEXT: unknown;
  JSON: unknown;
  DATE: unknown;
  NOW: unknown;
}

export async function up(
  queryInterface: MigrationQueryInterface,
  Sequelize: SequelizeDataTypes,
): Promise<void> {
  await queryInterface.createTable("question", {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    profileId: {
      allowNull: false,
      type: Sequelize.UUID,
    },
    title: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    questionText: {
      allowNull: false,
      type: Sequelize.TEXT,
    },
    option: {
      allowNull: true,
      type: Sequelize.JSON,
    },
    eventId: {
      allowNull: true,
      type: Sequelize.UUID,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  });
}

export async function down(
  queryInterface: MigrationQueryInterface,
  _Sequelize: SequelizeDataTypes,
): Promise<void> {
  await queryInterface.dropTable("question");
}
