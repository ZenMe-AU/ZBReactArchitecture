const path = require("path");
const { createMigrationInstance } = require("../db/migration");

class MigrationRunner {
  constructor({ db, migrationDir }) {
    this.db = db;
    this.migration = createMigrationInstance({ db, migrationDir });
  }

  async run(direction = "up") {
    try {
      if (direction === "down") {
        await this.migration.down();
        console.log(`[${this.constructor.name}] Migrations DOWN performed successfully.`);
      } else {
        await this.migration.up();
        console.log(`[${this.constructor.name}] All migrations performed successfully.`);
      }
    } catch (err) {
      console.error(`[${this.constructor.name}] Migration ${direction.toUpperCase()} failed:`, err);
      process.exit(1);
    } finally {
      await this.db.close();
    }
  }
}

module.exports = MigrationRunner;
