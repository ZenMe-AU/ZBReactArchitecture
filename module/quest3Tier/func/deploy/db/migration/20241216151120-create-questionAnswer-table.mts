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
  TEXT: unknown;
  STRING: unknown;
  INTEGER: unknown;
  DATE: unknown;
  NOW: unknown;
}

export async function up(
  queryInterface: MigrationQueryInterface,
  Sequelize: SequelizeDataTypes,
): Promise<void> {
  await queryInterface.createTable("questionAnswer", {
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
    profileId: {
      allowNull: false,
      type: Sequelize.UUID,
    },
    answerText: {
      allowNull: true,
      type: Sequelize.TEXT,
    },
    optionId: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    duration: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  });

  await queryInterface.sequelize.query(
    'ALTER TABLE "questionAnswer" ADD CONSTRAINT answers_questionId_fkey FOREIGN KEY ("questionId") REFERENCES question (id);',
  );
}

export async function down(
  queryInterface: MigrationQueryInterface,
  _Sequelize: SequelizeDataTypes,
): Promise<void> {
  await queryInterface.dropTable("questionAnswer");
}
