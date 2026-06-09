const tiendaRepository = require('../repositories/tienda.repository');
const { HttpError } = require('../helpers/http-error.helper');
const { generateSlug } = require('../helpers/slug.helper');
const { generatePublicToken } = require('../helpers/token.helper');
const { resolveStoreImageUrl } = require('./cloudinary.service');

const serializeTienda = (tienda) => ({
  TiendaID: tienda.TiendaID,
  UsuarioID: tienda.UsuarioID,
  Nombre: tienda.Nombre,
  Slug: tienda.Slug,
  TokenPublico: tienda.TokenPublico,
  Logo: tienda.Logo,
  Portada: tienda.Portada,
  WhatsApp: tienda.WhatsApp,
  Descripcion: tienda.Descripcion,
  ColorPrincipal: tienda.ColorPrincipal,
  Estado: tienda.Estado,
  FechaCreacion: tienda.FechaCreacion,
  FechaModificacion: tienda.FechaModificacion,
});

const parseTiendaId = (value) => {
  const tiendaId = Number.parseInt(value, 10);

  if (Number.isNaN(tiendaId) || tiendaId <= 0) {
    throw new HttpError(400, 'Invalid tienda id.');
  }

  return tiendaId;
};

const ensureStoreName = (nombre) => {
  if (!nombre || !String(nombre).trim()) {
    throw new HttpError(400, 'Nombre is required.');
  }

  return String(nombre).trim();
};

const ensureUniqueSlug = async (slug, excludeTiendaId) => {
  const existingStore = await tiendaRepository.findBySlug(slug, excludeTiendaId);

  if (existingStore) {
    throw new HttpError(409, 'Slug is already in use.');
  }
};

const generateUniqueTokenPublico = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const tokenPublico = generatePublicToken();
    const existingStore = await tiendaRepository.findByTokenPublico(tokenPublico);

    if (!existingStore) {
      return tokenPublico;
    }
  }

  throw new HttpError(500, 'Unable to generate a unique public token.');
};

const getOwnedStoreOrFail = async (tiendaId, usuarioId) => {
  const tienda = await tiendaRepository.findByIdAndUsuarioId(tiendaId, usuarioId);

  if (!tienda) {
    throw new HttpError(404, 'Store not found.');
  }

  return tienda;
};

const listUserStores = async (usuarioId) => {
  const tiendas = await tiendaRepository.findAllByUsuarioId(usuarioId);

  return tiendas.map(serializeTienda);
};

const getUserStoreById = async (tiendaId, usuarioId) => {
  const parsedTiendaId = parseTiendaId(tiendaId);
  const tienda = await getOwnedStoreOrFail(parsedTiendaId, usuarioId);

  return serializeTienda(tienda);
};

const createStore = async (payload, usuarioId) => {
  const nombre = ensureStoreName(payload?.Nombre);
  const slug = generateSlug(nombre);

  if (!slug) {
    throw new HttpError(400, 'Unable to generate a valid slug from Nombre.');
  }

  await ensureUniqueSlug(slug);

  const tokenPublico = await generateUniqueTokenPublico();
  const logo = payload?.Logo
    ? await resolveStoreImageUrl(payload.Logo, {
      usuarioId,
      tiendaSlug: slug,
      assetType: 'logo',
    })
    : null;
  const portada = payload?.Portada
    ? await resolveStoreImageUrl(payload.Portada, {
      usuarioId,
      tiendaSlug: slug,
      assetType: 'portada',
    })
    : null;

  const tienda = await tiendaRepository.createTienda({
    UsuarioID: usuarioId,
    Nombre: nombre,
    Slug: slug,
    TokenPublico: tokenPublico,
    Logo: logo,
    Portada: portada,
    WhatsApp: payload?.WhatsApp || null,
    Descripcion: payload?.Descripcion || null,
    ColorPrincipal: payload?.ColorPrincipal || null,
    Estado: true,
  });

  return serializeTienda(tienda);
};

const updateStore = async (tiendaId, payload, usuarioId) => {
  const parsedTiendaId = parseTiendaId(tiendaId);
  const tienda = await getOwnedStoreOrFail(parsedTiendaId, usuarioId);

  const updatePayload = {};
  const targetSlug = payload?.Slug !== undefined
    ? generateSlug(payload.Slug)
    : tienda.Slug;

  if (payload?.Nombre !== undefined) {
    updatePayload.Nombre = ensureStoreName(payload.Nombre);
  }

  if (payload?.Slug !== undefined) {
    const slug = targetSlug;

    if (!slug) {
      throw new HttpError(400, 'Slug is invalid.');
    }

    await ensureUniqueSlug(slug, tienda.TiendaID);
    updatePayload.Slug = slug;
  }

  if (payload?.Logo !== undefined) {
    updatePayload.Logo = payload.Logo
      ? await resolveStoreImageUrl(payload.Logo, {
        usuarioId,
        tiendaSlug: targetSlug,
        assetType: 'logo',
      })
      : null;
  }

  if (payload?.Portada !== undefined) {
    updatePayload.Portada = payload.Portada
      ? await resolveStoreImageUrl(payload.Portada, {
        usuarioId,
        tiendaSlug: targetSlug,
        assetType: 'portada',
      })
      : null;
  }

  ['WhatsApp', 'Descripcion', 'ColorPrincipal'].forEach((field) => {
    if (payload?.[field] !== undefined) {
      updatePayload[field] = payload[field] || null;
    }
  });

  updatePayload.FechaModificacion = new Date();

  const updatedStore = await tiendaRepository.updateTienda(tienda, updatePayload);

  return serializeTienda(updatedStore);
};

const deleteStore = async (tiendaId, usuarioId) => {
  const parsedTiendaId = parseTiendaId(tiendaId);
  const tienda = await getOwnedStoreOrFail(parsedTiendaId, usuarioId);
  const deletedStore = await tiendaRepository.softDeleteTienda(tienda);

  return serializeTienda(deletedStore);
};

module.exports = {
  listUserStores,
  getUserStoreById,
  createStore,
  updateStore,
  deleteStore,
  serializeTienda,
};
