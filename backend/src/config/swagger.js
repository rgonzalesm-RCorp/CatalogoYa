const path = require('path');

const swaggerJSDoc = require('swagger-jsdoc');

const { env } = require('./env');

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: `${env.APP_NAME} API`,
      version: '1.0.0',
      description: 'Documentacion base del backend de CatalogosYa.',
    },
    servers: [
      {
        url: `${env.APP_URL}/api`,
        description: env.NODE_ENV === 'production' ? 'Production server' : 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.js'),
  ],
});

module.exports = swaggerSpec;
