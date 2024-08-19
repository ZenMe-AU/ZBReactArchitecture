
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgres', 'zmpostressadmin', '2024 Zenme Postgress admin', {
    host: 'postgress1.postgres.database.azure.com',
    port: 5432,
    dialect: 'postgres',
    "dialectOptions": {
      "ssl": true
    }
});

// export default sequelize;
module.exports = {
  sequelize
}