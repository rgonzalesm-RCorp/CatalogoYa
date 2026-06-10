const http = require('http');

const app = require('./src/app');
const { env } = require('./src/config/env');
const {
  closeDatabaseConnection,
  migrateDatabase,
  testDatabaseConnection,
} = require('./src/config/database');

const server = http.createServer(app);

server.on('error', (error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});

const startServer = async () => {
  await testDatabaseConnection();
  await migrateDatabase();

  server.listen(env.PORT, env.HOST, () => {
    console.log(`${env.APP_NAME} listening on http://${env.HOST}:${env.PORT}`);
  });
};

const shutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    await closeDatabaseConnection();
    process.exit(0);
  });
};

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => shutdown(signal));
});

startServer().catch((error) => {
  console.error('Unable to start the server:', error);
  process.exit(1);
});
