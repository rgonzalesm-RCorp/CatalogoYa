const { Router } = require('express');

const {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/producto.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @swagger
 * /tiendas/{tiendaId}/productos:
 *   get:
 *     summary: Lista los productos activos de una tienda del usuario autenticado.
 *     tags:
 *       - Productos
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
 *         description: Productos obtenidos correctamente.
 */
router.get('/tiendas/:tiendaId/productos', authMiddleware, listProducts);

/**
 * @swagger
 * /productos/{id}:
 *   get:
 *     summary: Obtiene un producto activo del usuario autenticado.
 *     tags:
 *       - Productos
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
 *         description: Producto obtenido correctamente.
 *       404:
 *         description: Producto no encontrado.
 */
router.get('/productos/:id', authMiddleware, getProductById);

/**
 * @swagger
 * /tiendas/{tiendaId}/productos:
 *   post:
 *     summary: Crea un producto para una tienda del usuario autenticado.
 *     tags:
 *       - Productos
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
 *               - CategoriaID
 *               - UsaTallas
 *             properties:
 *               Nombre:
 *                 type: string
 *               Descripcion:
 *                 type: string
 *               CategoriaID:
 *                 type: integer
 *               PrecioMenor:
 *                 type: number
 *               PrecioMayor:
 *                 type: number
 *               UsaTallas:
 *                 type: boolean
 *               Imagenes:
 *                 type: array
 *               Tallas:
 *                 type: array
 *     responses:
 *       201:
 *         description: Producto creado correctamente.
 */
router.post('/tiendas/:tiendaId/productos', authMiddleware, createProduct);

/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Actualiza un producto del usuario autenticado.
 *     tags:
 *       - Productos
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
 *               CategoriaID:
 *                 type: integer
 *               PrecioMenor:
 *                 type: number
 *               PrecioMayor:
 *                 type: number
 *               UsaTallas:
 *                 type: boolean
 *               Imagenes:
 *                 type: array
 *               Tallas:
 *                 type: array
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente.
 */
router.put('/productos/:id', authMiddleware, updateProduct);

/**
 * @swagger
 * /productos/{id}:
 *   delete:
 *     summary: Elimina logicamente un producto del usuario autenticado.
 *     tags:
 *       - Productos
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
 *         description: Producto eliminado logicamente.
 */
router.delete('/productos/:id', authMiddleware, deleteProduct);

module.exports = router;
