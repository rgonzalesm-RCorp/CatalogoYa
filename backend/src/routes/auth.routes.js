const { Router } = require('express');

const {
  authenticateWithGoogle,
  getCurrentUser,
} = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Inicia sesion o registra un usuario usando Google.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Token ID generado por Google Sign-In.
 *     responses:
 *       200:
 *         description: Autenticacion exitosa y JWT generado.
 *       401:
 *         description: Token de Google invalido.
 */
router.post('/auth/google', authenticateWithGoogle);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtiene el usuario autenticado actual.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario autenticado obtenido correctamente.
 *       401:
 *         description: Token invalido o ausente.
 */
router.get('/auth/me', authMiddleware, getCurrentUser);

module.exports = router;
