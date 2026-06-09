const { Router } = require('express');

const { getPublicCatalogBySlug } = require('../controllers/public-catalogo.controller');

const router = Router();

/**
 * @swagger
 * /public/catalogo/{slug}:
 *   get:
 *     summary: Obtiene el catalogo publico de una tienda por slug.
 *     tags:
 *       - Public
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Catalogo publico obtenido correctamente.
 *       404:
 *         description: Tienda no encontrada o inactiva.
 */
router.get('/public/catalogo/:slug', getPublicCatalogBySlug);

module.exports = router;
