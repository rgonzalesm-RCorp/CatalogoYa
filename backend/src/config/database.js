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
  closeDatabaseConnection,
};
