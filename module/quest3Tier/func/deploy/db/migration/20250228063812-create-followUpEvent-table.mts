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
  JSON: unknown;
  DATE: unknown;
  NOW: unknown;
}

export async function up(
  queryInterface: MigrationQueryInterface,
  Sequelize: SequelizeDataTypes,
): Promise<void> {
  await queryInterface.createTable("followUpEvent", {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    followUpId: {
      allowNull: false,
      type: Sequelize.UUID,
    },
    correlationId: {
      allowNull: true,
      type: Sequelize.UUID,
    },
    action: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    senderProfileId: {
      allowNull: false,
      type: Sequelize.UUID,
    },
    originalData: {
      allowNull: true,
      type: Sequelize.JSON,
    },
    actionData: {
      allowNull: false,
      type: Sequelize.JSON,
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
  await queryInterface.dropTable("followUpEvent");
}
