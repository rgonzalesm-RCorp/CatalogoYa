const { Router } = require('express');

const authRoutes = require('./auth.routes');
const categoriaRoutes = require('./categoria.routes');
const healthRoutes = require('./health.routes');
const productoRoutes = require('./producto.routes');
const publicRoutes = require('./public.routes');
const tiendaRoutes = require('./tienda.routes');

const router = Router();

router.use(authRoutes);
router.use(categoriaRoutes);
router.use(healthRoutes);
router.use(productoRoutes);
router.use(publicRoutes);
router.use(tiendaRoutes);

module.exports = router;
