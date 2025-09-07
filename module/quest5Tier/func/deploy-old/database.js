const { Sequelize } = require("sequelize");
const { Umzug, SequelizeStorage } = require("umzug");

const config = {
  database: "quest5Tier",
  host: "postgress1.postgres.database.azure.com",
  port: 5432,
  migrationsFolder: "../db/migration",
};

// Get Azure AD access token for PostgreSQL from current session
const { execSync } = require("child_process");
let accessToken;
try {
  accessToken = execSync("az account get-access-token --resource-type oss-rdbms --query accessToken -o tsv", { encoding: "utf8" }).trim();
} catch (err) {
  console.error("Failed to get Azure AD access token:", err);
  process.exit(1);
}

// Get current Azure AD username from session
let aadUser;
try {
  const azAccount = JSON.parse(execSync("az account show", { encoding: "utf8" }));
  // aadUser = azAccount.user.name + "@" + azAccount.tenantId;
  aadUser = azAccount.user.name;
} catch (err) {
  console.error("Failed to get Azure AD username:", err);
  process.exit(1);
}

const sequelize = new Sequelize(config.database, aadUser, accessToken, {
  host: config.host,
  dialect: "postgres",
  port: config.port,
  logging: false,
  dialectOptions: {
    ssl: true,
  },
});

// Configure Umzug for migrations
const umzug = new Umzug({
  migrations: {
    glob: config.migrationsFolder + "/*.js",
    resolve: ({ name, path, context }) => {
      const migration = require(path);
      return {
        name,
        up: async () => migration.up(context.queryInterface, Sequelize),
        down: async () => migration.down(context.queryInterface, Sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

// Function to run migrations programmatically
async function runMigrations() {
  try {
    await umzug.up();
    console.log("All migrations performed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

module.exports = { runMigrations };

if (require.main === module) {
  runMigrations();
}
