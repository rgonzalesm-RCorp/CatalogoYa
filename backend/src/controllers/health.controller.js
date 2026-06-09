const { env } = require('../config/env');

const getHealthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running.',
    data: {
      service: env.APP_NAME,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: Number(process.uptime().toFixed(2)),
    },
  });
};

module.exports = { getHealthStatus };
