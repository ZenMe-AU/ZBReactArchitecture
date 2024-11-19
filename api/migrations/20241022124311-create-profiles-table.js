"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("profiles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      avatar: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      device_id: {
        type: Sequelize.STRING,
      },
    });
    await queryInterface.sequelize.query("ALTER TABLE profiles ADD CONSTRAINT profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id);");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("profiles");
  },
};
