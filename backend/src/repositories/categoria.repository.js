const { getModels } = require('../config/database');

const getCategoriaModel = () => getModels().Categoria;
const getTiendaModel = () => getModels().Tienda;

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

const findAllByTiendaIdAndUsuarioId = async (tiendaId, usuarioId) => getCategoriaModel().findAll({
  where: {
    TiendaID: tiendaId,
    Estado: true,
  },
  include: [storeOwnerInclude(usuarioId)],
  order: [['FechaCreacion', 'DESC']],
});

const findActiveByTiendaId = async (tiendaId) => getCategoriaModel().findAll({
  where: {
    TiendaID: tiendaId,
    Estado: true,
  },
  order: [['FechaCreacion', 'ASC'], ['CategoriaID', 'ASC']],
});

const findByIdAndUsuarioId = async (categoriaId, usuarioId) => getCategoriaModel().findOne({
  where: {
    CategoriaID: categoriaId,
    Estado: true,
  },
  include: [storeOwnerInclude(usuarioId)],
});

const findByIdAndTiendaIdAndUsuarioId = async (
  categoriaId,
  tiendaId,
  usuarioId,
) => getCategoriaModel().findOne({
  where: {
    CategoriaID: categoriaId,
    TiendaID: tiendaId,
    Estado: true,
  },
  include: [storeOwnerInclude(usuarioId)],
});

const createCategoria = async (payload) => getCategoriaModel().create(payload);

const updateCategoria = async (categoria, payload) => categoria.update(payload);

const softDeleteCategoria = async (categoria) => categoria.update({
  Estado: false,
  FechaModificacion: new Date(),
});

module.exports = {
  findActiveByTiendaId,
  findAllByTiendaIdAndUsuarioId,
  findByIdAndUsuarioId,
  findByIdAndTiendaIdAndUsuarioId,
  createCategoria,
  updateCategoria,
  softDeleteCategoria,
};
