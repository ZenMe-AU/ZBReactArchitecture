"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("attributes", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      profile_id: {
        allowNull: false,
        type: Sequelize.UUID,
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
    // await queryInterface.sequelize.query(
    //   "ALTER TABLE attributes ADD CONSTRAINT attributes_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles (id);"
    // );
    await queryInterface.addConstraint("attributes", {
      fields: ["profile_id"],
      type: "foreign key",
      name: "attributes_profile_id_fkey",
      references: {
        table: "profiles",
        field: "id",
      },
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("attributes");
  },
};
