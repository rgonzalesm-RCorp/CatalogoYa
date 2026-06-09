const { Router } = require('express');

const {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoria.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @swagger
 * /tiendas/{tiendaId}/categorias:
 *   get:
 *     summary: Lista las categorias activas de una tienda del usuario autenticado.
 *     tags:
 *       - Categorias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tiendaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categorias obtenidas correctamente.
 */
router.get('/tiendas/:tiendaId/categorias', authMiddleware, listCategories);

/**
 * @swagger
 * /categorias/{id}:
 *   get:
 *     summary: Obtiene una categoria activa del usuario autenticado.
 *     tags:
 *       - Categorias
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
 *         description: Categoria obtenida correctamente.
 *       404:
 *         description: Categoria no encontrada.
 */
router.get('/categorias/:id', authMiddleware, getCategoryById);

/**
 * @swagger
 * /tiendas/{tiendaId}/categorias:
 *   post:
 *     summary: Crea una categoria para una tienda del usuario autenticado.
 *     tags:
 *       - Categorias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tiendaId
 *         required: true
 *         schema:
 *           type: integer
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
 *               Descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoria creada correctamente.
 */
router.post('/tiendas/:tiendaId/categorias', authMiddleware, createCategory);

/**
 * @swagger
 * /categorias/{id}:
 *   put:
 *     summary: Actualiza una categoria del usuario autenticado.
 *     tags:
 *       - Categorias
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
 *               Descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categoria actualizada correctamente.
 */
router.put('/categorias/:id', authMiddleware, updateCategory);

/**
 * @swagger
 * /categorias/{id}:
 *   delete:
 *     summary: Elimina logicamente una categoria del usuario autenticado.
 *     tags:
 *       - Categorias
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
 *         description: Categoria eliminada logicamente.
 */
router.delete('/categorias/:id', authMiddleware, deleteCategory);

module.exports = router;
