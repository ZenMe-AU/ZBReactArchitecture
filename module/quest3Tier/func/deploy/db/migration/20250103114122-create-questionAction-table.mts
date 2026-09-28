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
  sequelize: {
    query(sql: string): Promise<unknown>;
  };

  createTable(
    tableName: string,
    attributes: Record<string, MigrationAttribute>,
  ): Promise<unknown>;

  dropTable(tableName: string): Promise<unknown>;
}

interface SequelizeDataTypes {
  UUID: unknown;
  UUIDV4: unknown;
  JSON: unknown;
  DATE: unknown;
  NOW: unknown;
}

export async function up(
  queryInterface: MigrationQueryInterface,
  Sequelize: SequelizeDataTypes,
): Promise<void> {
  await queryInterface.createTable("questionAction", {
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
    questionId: {
      allowNull: false,
      type: Sequelize.UUID,
    },
    action: {
      allowNull: true,
      type: Sequelize.JSON,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  });

  await queryInterface.sequelize.query(
    'ALTER TABLE "questionAction" ADD CONSTRAINT questionAction_questionId_fkey FOREIGN KEY ("questionId") REFERENCES question (id);',
  );
}

export async function down(
  queryInterface: MigrationQueryInterface,
  _Sequelize: SequelizeDataTypes,
): Promise<void> {
  await queryInterface.dropTable("questionAction");
}
