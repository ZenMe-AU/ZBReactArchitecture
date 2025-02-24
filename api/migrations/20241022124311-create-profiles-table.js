"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("profiles", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: {
        allowNull: true,
        type: Sequelize.UUID,
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
    // await queryInterface.sequelize.query("ALTER TABLE profiles ADD CONSTRAINT profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id);");

    await queryInterface.addConstraint("profiles", {
      fields: ["user_id"],
      type: "foreign key",
      name: "profiles_user_id_fkey",
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("profiles");
  },
};
