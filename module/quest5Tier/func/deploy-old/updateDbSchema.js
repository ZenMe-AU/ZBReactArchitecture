const { Sequelize } = require("sequelize");
const { Umzug, SequelizeStorage } = require("umzug");
const { DefaultAzureCredential } = require("@azure/identity");
const { execSync } = require("child_process");
const path = require("path");

// TODO: default PostgreSQL connection configuration for local development or try to build local config
const pgHost = "ethnicmacaw-postgresqlserver.postgres.database.azure.com";
const pgPort = 5432;
const pgDatabase = "quest5Tier";
const pgDialect = "postgres";
const migrationsFolder = path.join(__dirname, "../db/migration");
// const aadUser = "LukeYeh@zenme.com.au";
const aadGroup = "ethnicmacaw-pg-admins";

const config = {
  host: pgHost,
  dialect: pgDialect,
  port: pgPort,
  database: pgDatabase,
  logging: false,
  dialectOptions: {
    ssl: true,
  },
};

// Function to get Azure AD username
async function getAzureADUser() {
  try {
    const azAccount = JSON.parse(execSync("az account show", { encoding: "utf8" }));
    return azAccount.user.name;
  } catch (err) {
    console.error("Failed to get Azure AD username:", err);
    process.exit(1);
  }
  // const credential = new AzureCliCredential();
  // const client = new SubscriptionClient(credential);
  // const subscriptions = await client.subscriptions.list();
  // for (let sub of subscriptions) {
  //   console.log(`${sub.displayName} (${sub.subscriptionId})`);
  // }
}

// Function to get Azure AD access token
async function getAzureAccessToken() {
  try {
    const credential = new DefaultAzureCredential();
    const tokenObj = await credential.getToken("https://ossrdbms-aad.database.windows.net");
    return tokenObj.token;
  } catch (err) {
    console.error("Failed to get Azure AD access token:", err);
    process.exit(1);
  }
}

// Function to create a new Sequelize instance with Azure AD authentication
async function createSequelize() {
  // const aadUser = await getAzureADUser(); //only for development, use environment variable for production
  const accessToken = await getAzureAccessToken();
  return new Sequelize(config.database, aadGroup, accessToken, config);
}

// Function to create Sequelize instance
function createUmzugInstance(sequelize) {
  return new Umzug({
    migrations: {
      glob: path.join(migrationsFolder, "*.js"),
      resolve: ({ name, path, context }) => {
        const migration = require(path);
        return {
          name,
          up: async () => migration.up(context.queryInterface, Sequelize),
          down: async () => migration.down(context.queryInterface, Sequelize),
        };
      },
    },
    context: { queryInterface: sequelize.getQueryInterface() },
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });
}

// This function initializes the Sequelize connection and runs migrations
async function runMigrations(direction = "up") {
  const sequelize = await createSequelize();
  const umzug = createUmzugInstance(sequelize);

  try {
    if (direction === "down") {
      await umzug.down();
      console.log("Migrations DOWN performed successfully.");
    } else {
      await umzug.up();
      console.log("All migrations performed successfully.");
    }
  } catch (err) {
    console.error(`Migration ${direction.toUpperCase()} failed:`, err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

module.exports = {
  runMigrations,
};

if (require.main === module) {
  const direction = process.argv[2] === "down" ? "down" : "up";
  runMigrations(direction);
}

// async function main() {
//   let accessToken;
//   try {
//     const credential = new DefaultAzureCredential();
//     const tokenObj = await credential.getToken("https://ossrdbms-aad.database.windows.net");
//     accessToken = tokenObj.token;
//   } catch (err) {
//     console.error("Failed to get Azure AD access token:", err);
//     process.exit(1);
//   }

//   const sequelize = new Sequelize(config.database, aadUser, accessToken, config);

//   // Configure Umzug for migrations
//   const umzug = new Umzug({
//     migrations: {
//       glob: migrationsFolder + "/*.js",
//       resolve: ({ name, path, context }) => {
//         const migration = require(path);
//         return {
//           name,
//           up: async () => migration.up(context.queryInterface, Sequelize),
//           down: async () => migration.down(context.queryInterface, Sequelize),
//         };
//       },
//     },
//     context: { queryInterface: sequelize.getQueryInterface() },
//     storage: new SequelizeStorage({ sequelize }),
//     logger: console,
//   });

//   // Function to run migrations programmatically
//   async function runMigrations() {
//     try {
//       await umzug.up();
//       console.log("All migrations performed successfully.");
//     } catch (error) {
//       console.error("Migration failed:", error);
//     } finally {
//       await sequelize.close();
//     }
//   }

//   await runMigrations();
// }

// module.exports = { main };

// if (require.main === module) {
//   main();
// }
