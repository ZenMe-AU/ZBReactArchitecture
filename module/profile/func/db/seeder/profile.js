"use strict";
const { faker } = require("@faker-js/faker");

const tableName = "profiles";

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = Array.from({ length: 20 }).map(() => {
      const uuid = faker.string.uuid();
      return {
        id: uuid,
        name: faker.person.fullName(),
        deviceId: uuid,
      };
    });

    await queryInterface.bulkInsert(tableName, users);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(tableName, null, {});
  },
};
