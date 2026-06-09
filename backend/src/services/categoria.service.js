const categoriaRepository = require('../repositories/categoria.repository');
const tiendaRepository = require('../repositories/tienda.repository');
const { HttpError } = require('../helpers/http-error.helper');

const serializeCategoria = (categoria) => ({
  CategoriaID: categoria.CategoriaID,
  TiendaID: categoria.TiendaID,
  Nombre: categoria.Nombre,
  Descripcion: categoria.Descripcion,
  Estado: categoria.Estado,
  FechaCreacion: categoria.FechaCreacion,
  FechaModificacion: categoria.FechaModificacion,
});

const parsePositiveId = (value, fieldName) => {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    throw new HttpError(400, `Invalid ${fieldName}.`);
  }

  return parsedValue;
};

const ensureCategoryName = (nombre) => {
  if (!nombre || !String(nombre).trim()) {
    throw new HttpError(400, 'Nombre is required.');
  }

  return String(nombre).trim();
};

const getOwnedStoreOrFail = async (tiendaId, usuarioId) => {
  const tienda = await tiendaRepository.findByIdAndUsuarioId(tiendaId, usuarioId);

  if (!tienda) {
    throw new HttpError(404, 'Store not found.');
  }

  return tienda;
};

const getOwnedCategoryOrFail = async (categoriaId, usuarioId) => {
  const categoria = await categoriaRepository.findByIdAndUsuarioId(categoriaId, usuarioId);

  if (!categoria) {
    throw new HttpError(404, 'Category not found.');
  }

  return categoria;
};

const listStoreCategories = async (tiendaId, usuarioId) => {
  const parsedTiendaId = parsePositiveId(tiendaId, 'tienda id');

  await getOwnedStoreOrFail(parsedTiendaId, usuarioId);

  const categorias = await categoriaRepository.findAllByTiendaIdAndUsuarioId(
    parsedTiendaId,
    usuarioId,
  );

  return categorias.map(serializeCategoria);
};

const getCategoryById = async (categoriaId, usuarioId) => {
  const parsedCategoriaId = parsePositiveId(categoriaId, 'categoria id');
  const categoria = await getOwnedCategoryOrFail(parsedCategoriaId, usuarioId);

  return serializeCategoria(categoria);
};

const createCategory = async (tiendaId, payload, usuarioId) => {
  const parsedTiendaId = parsePositiveId(tiendaId, 'tienda id');
  const nombre = ensureCategoryName(payload?.Nombre);

  await getOwnedStoreOrFail(parsedTiendaId, usuarioId);

  const categoria = await categoriaRepository.createCategoria({
    TiendaID: parsedTiendaId,
    Nombre: nombre,
    Descripcion: payload?.Descripcion || null,
    Estado: true,
  });

  return serializeCategoria(categoria);
};

const updateCategory = async (categoriaId, payload, usuarioId) => {
  const parsedCategoriaId = parsePositiveId(categoriaId, 'categoria id');
  const categoria = await getOwnedCategoryOrFail(parsedCategoriaId, usuarioId);
  const updatePayload = {};

  if (payload?.Nombre !== undefined) {
    updatePayload.Nombre = ensureCategoryName(payload.Nombre);
  }

  if (payload?.Descripcion !== undefined) {
    updatePayload.Descripcion = payload.Descripcion || null;
  }

  updatePayload.FechaModificacion = new Date();

  const updatedCategory = await categoriaRepository.updateCategoria(categoria, updatePayload);

  return serializeCategoria(updatedCategory);
};

const deleteCategory = async (categoriaId, usuarioId) => {
  const parsedCategoriaId = parsePositiveId(categoriaId, 'categoria id');
  const categoria = await getOwnedCategoryOrFail(parsedCategoriaId, usuarioId);
  const deletedCategory = await categoriaRepository.softDeleteCategoria(categoria);

  return serializeCategoria(deletedCategory);
};

module.exports = {
  listStoreCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  serializeCategoria,
};
