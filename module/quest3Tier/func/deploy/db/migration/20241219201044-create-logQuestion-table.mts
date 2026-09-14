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
  STRING: unknown;
  JSON: unknown;
  DATE: unknown;
  NOW: unknown;
}

export async function up(
  queryInterface: MigrationQueryInterface,
  Sequelize: SequelizeDataTypes,
): Promise<void> {
  await queryInterface.createTable("logQuestion", {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    questionId: {
      allowNull: false,
      type: Sequelize.UUID,
    },
    action: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    profileId: {
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
    lastEventId: {
      allowNull: true,
      type: Sequelize.UUID,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  });

  await queryInterface.sequelize.query(
    'ALTER TABLE "logQuestion" ADD CONSTRAINT logQuestionQuestionId_fkey FOREIGN KEY ("questionId") REFERENCES question (id);',
  );

  await queryInterface.sequelize.query(
    'ALTER TABLE "logQuestion" ADD CONSTRAINT logQuestion_lastEventId_fkey FOREIGN KEY ("lastEventId") REFERENCES logQuestion (id);',
  );
}

export async function down(
  queryInterface: MigrationQueryInterface,
  _Sequelize: SequelizeDataTypes,
): Promise<void> {
  await queryInterface.dropTable("logQuestion");
}
