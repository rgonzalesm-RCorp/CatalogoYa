const cors = require('cors');
const express = require('express');
const swaggerUi = require('swagger-ui-express');

const { env } = require('./config/env');
const routes = require('./routes');
const swaggerSpec = require('./config/swagger');
const { errorHandler } = require('./middlewares/error.middleware');
const { requestLogger } = require('./middlewares/logger.middleware');
const { notFoundMiddleware } = require('./middlewares/not-found.middleware');

const app = express();
const corsOrigin = env.CORS_ORIGIN === '*'
  ? true
  : env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
const requestBodyOptions = {
  limit: env.API_BODY_LIMIT,
};

app.disable('x-powered-by');
app.use(cors({ origin: corsOrigin }));
app.use(express.json(requestBodyOptions));
app.use(express.urlencoded({ ...requestBodyOptions, extended: true }));
app.use(requestLogger);

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: `${env.APP_NAME} Docs`,
  }),
);

app.use('/api', routes);

app.use(notFoundMiddleware);
app.use(errorHandler);

module.exports = app;
