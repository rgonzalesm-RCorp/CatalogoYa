const { Router } = require('express');

const { getHealthStatus } = require('../controllers/health.controller');

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica el estado base de la API.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: La API responde correctamente.
 */
router.get('/health', getHealthStatus);

module.exports = router;
