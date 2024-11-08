"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("attributes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      profile_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      tag: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
    await queryInterface.sequelize.query(
      "ALTER TABLE attributes ADD CONSTRAINT attributes_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles (id);"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("attributes");
  },
};
