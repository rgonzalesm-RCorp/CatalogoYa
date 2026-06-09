const { Router } = require('express');

const {
  listStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
} = require('../controllers/tienda.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

router.use('/tiendas', authMiddleware);

/**
 * @swagger
 * /tiendas:
 *   get:
 *     summary: Lista las tiendas activas del usuario autenticado.
 *     tags:
 *       - Tiendas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tiendas obtenidas correctamente.
 */
router.get('/tiendas', listStores);

/**
 * @swagger
 * /tiendas/{id}:
 *   get:
 *     summary: Obtiene una tienda activa del usuario autenticado.
 *     tags:
 *       - Tiendas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tienda obtenida correctamente.
 *       404:
 *         description: Tienda no encontrada.
 */
router.get('/tiendas/:id', getStoreById);

/**
 * @swagger
 * /tiendas:
 *   post:
 *     summary: Crea una tienda y genera automaticamente slug y token publico.
 *     tags:
 *       - Tiendas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Nombre
 *             properties:
 *               Nombre:
 *                 type: string
 *               Logo:
 *                 type: string
 *               Portada:
 *                 type: string
 *               WhatsApp:
 *                 type: string
 *               Descripcion:
 *                 type: string
 *               ColorPrincipal:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tienda creada correctamente.
 *       409:
 *         description: El slug generado ya existe.
 */
router.post('/tiendas', createStore);

/**
 * @swagger
 * /tiendas/{id}:
 *   put:
 *     summary: Actualiza una tienda del usuario autenticado.
 *     tags:
 *       - Tiendas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nombre:
 *                 type: string
 *               Slug:
 *                 type: string
 *               Logo:
 *                 type: string
 *               Portada:
 *                 type: string
 *               WhatsApp:
 *                 type: string
 *               Descripcion:
 *                 type: string
 *               ColorPrincipal:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tienda actualizada correctamente.
 *       409:
 *         description: El slug ya existe.
 */
router.put('/tiendas/:id', updateStore);

/**
 * @swagger
 * /tiendas/{id}:
 *   delete:
 *     summary: Elimina logicamente una tienda del usuario autenticado.
 *     tags:
 *       - Tiendas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tienda eliminada logicamente.
 */
router.delete('/tiendas/:id', deleteStore);

module.exports = router;
