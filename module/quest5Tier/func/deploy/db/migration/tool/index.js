function createMigrationInstance({ type = "default", db, migrationDir }) {
  switch (type) {
    default:
      return require("./umzug").createUmzugInstance(db, migrationDir);
  }
}

module.exports = { createMigrationInstance };
