const { getModels } = require('../config/database');

const getProductoModel = () => getModels().Producto;
const getProductoImagenModel = () => getModels().ProductoImagen;
const getProductoTallaModel = () => getModels().ProductoTalla;
const getCategoriaModel = () => getModels().Categoria;
const getTiendaModel = () => getModels().Tienda;

const activeImagesInclude = () => ({
  model: getProductoImagenModel(),
  as: 'Imagenes',
  required: false,
  where: {
    Estado: true,
  },
});

const activeSizesInclude = () => ({
  model: getProductoTallaModel(),
  as: 'Tallas',
  required: false,
  where: {
    Estado: true,
  },
});

const storeOwnerInclude = (usuarioId) => ({
  model: getTiendaModel(),
  as: 'Tienda',
  attributes: [],
  required: true,
  where: {
    UsuarioID: usuarioId,
    Estado: true,
  },
});

const activeCategoryInclude = (tiendaId) => ({
  model: getCategoriaModel(),
  as: 'Categoria',
  attributes: ['CategoriaID', 'Nombre'],
  required: true,
  where: {
    TiendaID: tiendaId,
    Estado: true,
  },
});

const findAllByTiendaIdAndUsuarioId = async (tiendaId, usuarioId) => getProductoModel().findAll({
  where: {
    TiendaID: tiendaId,
    Estado: true,
  },
  include: [
    storeOwnerInclude(usuarioId),
    activeImagesInclude(),
    activeSizesInclude(),
  ],
  order: [['FechaCreacion', 'DESC']],
});

const findByIdAndUsuarioId = async (productoId, usuarioId) => getProductoModel().findOne({
  where: {
    ProductoID: productoId,
    Estado: true,
  },
  include: [
    storeOwnerInclude(usuarioId),
    activeImagesInclude(),
    activeSizesInclude(),
  ],
});

const findActiveByTiendaId = async (tiendaId) => getProductoModel().findAll({
  where: {
    TiendaID: tiendaId,
    Estado: true,
  },
  include: [
    activeCategoryInclude(tiendaId),
    activeImagesInclude(),
    activeSizesInclude(),
  ],
  order: [['FechaCreacion', 'ASC'], ['ProductoID', 'ASC']],
});

const createProducto = async (payload, options = {}) => getProductoModel().create(payload, options);

const updateProducto = async (producto, payload, options = {}) => producto.update(payload, options);

const softDeleteProducto = async (producto, options = {}) => producto.update({
  Estado: false,
  FechaModificacion: new Date(),
}, options);

const findActiveImagesByProductoId = async (productoId, options = {}) => getProductoImagenModel().findAll({
  where: {
    ProductoID: productoId,
    Estado: true,
  },
  order: [['Orden', 'ASC'], ['ProductoImagenID', 'ASC']],
  ...options,
});

const createProductoImagen = async (payload, options = {}) => getProductoImagenModel().create(payload, options);

const updateProductoImagen = async (productoImagen, payload, options = {}) => (
  productoImagen.update(payload, options)
);

const softDeleteProductoImagen = async (productoImagen, options = {}) => productoImagen.update({
  Estado: false,
}, options);

const findActiveTallasByProductoId = async (productoId, options = {}) => getProductoTallaModel().findAll({
  where: {
    ProductoID: productoId,
    Estado: true,
  },
  order: [['ProductoTallaID', 'ASC']],
  ...options,
});

const createProductoTalla = async (payload, options = {}) => getProductoTallaModel().create(payload, options);

const updateProductoTalla = async (productoTalla, payload, options = {}) => (
  productoTalla.update(payload, options)
);

const softDeleteProductoTalla = async (productoTalla, options = {}) => productoTalla.update({
  Estado: false,
}, options);

module.exports = {
  findActiveByTiendaId,
  findAllByTiendaIdAndUsuarioId,
  findByIdAndUsuarioId,
  createProducto,
  updateProducto,
  softDeleteProducto,
  findActiveImagesByProductoId,
  createProductoImagen,
  updateProductoImagen,
  softDeleteProductoImagen,
  findActiveTallasByProductoId,
  createProductoTalla,
  updateProductoTalla,
  softDeleteProductoTalla,
};
