const { Sequelize } = require('sequelize');

const { initializeModels } = require('../models');
const { env } = require('./env');

let sequelizeInstance;

const getSequelize = () => {
  if (!sequelizeInstance) {
    const tedious = require('tedious');

    sequelizeInstance = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
      host: env.DB_HOST,
      port: env.DB_PORT,
      dialect: 'mssql',
      dialectModule: tedious,
      logging: env.DB_LOGGING ? console.log : false,
      dialectOptions: {
        options: {
          encrypt: env.DB_ENCRYPT,
          trustServerCertificate: env.DB_TRUST_SERVER_CERTIFICATE,
        },
      },
    });

    initializeModels(sequelizeInstance);
  }

  return sequelizeInstance;
};

const testDatabaseConnection = async () => {
  const sequelize = getSequelize();

  await sequelize.authenticate();
  console.log('SQL Server connection established successfully.');
};

const migrateDatabase = async () => {
  if (!env.DB_AUTO_MIGRATE) {
    console.log('Automatic database migration skipped.');
    return;
  }

  const sequelize = getSequelize();
  const syncOptions = {
    alter: env.DB_MIGRATE_FORCE ? false : env.DB_MIGRATE_ALTER,
    force: env.DB_MIGRATE_FORCE,
  };

  await sequelize.sync(syncOptions);

  const migrationMode = syncOptions.force
    ? 'force'
    : syncOptions.alter
      ? 'alter'
      : 'safe';

  console.log(`Database schema synchronized successfully (${migrationMode} mode).`);
};

const closeDatabaseConnection = async () => {
  if (!sequelizeInstance) {
    return;
  }

  await sequelizeInstance.close();
};

const getModels = () => getSequelize().models;

module.exports = {
  getSequelize,
  getModels,
  testDatabaseConnection,
  migrateDatabase,
  closeDatabaseConnection,
};
