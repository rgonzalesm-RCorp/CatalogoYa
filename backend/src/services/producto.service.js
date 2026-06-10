const categoriaRepository = require('../repositories/categoria.repository');
const productoRepository = require('../repositories/producto.repository');
const tiendaRepository = require('../repositories/tienda.repository');
const { getSequelize } = require('../config/database');
const { HttpError } = require('../helpers/http-error.helper');
const { resolveProductImageUrl } = require('./cloudinary.service');

const parsePositiveId = (value, fieldName) => {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    throw new HttpError(400, `Invalid ${fieldName}.`);
  }

  return parsedValue;
};

const parseNonNegativeInteger = (value, fieldName) => {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    throw new HttpError(400, `${fieldName} must be a non-negative integer.`);
  }

  return parsedValue;
};

const parseBooleanValue = (value, fieldName) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true' || value === '1' || value === 1) {
    return true;
  }

  if (value === 'false' || value === '0' || value === 0) {
    return false;
  }

  throw new HttpError(400, `${fieldName} must be a boolean.`);
};

const parseNonNegativeNumber = (value, fieldName) => {
  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    throw new HttpError(400, `${fieldName} must be a non-negative number.`);
  }

  return parsedValue;
};

const ensureProductName = (nombre) => {
  if (!nombre || !String(nombre).trim()) {
    throw new HttpError(400, 'Nombre is required.');
  }

  return String(nombre).trim();
};

const serializeImagen = (imagen) => ({
  ProductoImagenID: imagen.ProductoImagenID,
  ProductoID: imagen.ProductoID,
  UrlImagen: imagen.UrlImagen,
  Orden: imagen.Orden,
  EsPrincipal: imagen.EsPrincipal,
  Estado: imagen.Estado,
});

const serializeTalla = (talla) => ({
  ProductoTallaID: talla.ProductoTallaID,
  ProductoID: talla.ProductoID,
  Talla: talla.Talla,
  Stock: talla.Stock,
  PrecioMenor: talla.PrecioMenor,
  PrecioMayor: talla.PrecioMayor,
  Estado: talla.Estado,
});

const sortImagenes = (imagenes = []) => [...imagenes].sort((left, right) => {
  if (left.Orden !== right.Orden) {
    return left.Orden - right.Orden;
  }

  return left.ProductoImagenID - right.ProductoImagenID;
});

const sortTallas = (tallas = []) => [...tallas].sort((left, right) => left.ProductoTallaID - right.ProductoTallaID);

const serializeProducto = (producto) => ({
  ProductoID: producto.ProductoID,
  TiendaID: producto.TiendaID,
  CategoriaID: producto.CategoriaID,
  Nombre: producto.Nombre,
  Descripcion: producto.Descripcion,
  PrecioMenor: producto.PrecioMenor,
  PrecioMayor: producto.PrecioMayor,
  UsaTallas: producto.UsaTallas,
  Estado: producto.Estado,
  FechaCreacion: producto.FechaCreacion,
  FechaModificacion: producto.FechaModificacion,
  Imagenes: sortImagenes(producto.Imagenes || []).map(serializeImagen),
  Tallas: sortTallas(producto.Tallas || []).map(serializeTalla),
});

const ensureOwnedStoreOrFail = async (tiendaId, usuarioId) => {
  const tienda = await tiendaRepository.findByIdAndUsuarioId(tiendaId, usuarioId);

  if (!tienda) {
    throw new HttpError(404, 'Store not found.');
  }

  return tienda;
};

const ensureOwnedCategoryInStoreOrFail = async (categoriaId, tiendaId, usuarioId) => {
  const categoria = await categoriaRepository.findByIdAndTiendaIdAndUsuarioId(
    categoriaId,
    tiendaId,
    usuarioId,
  );

  if (!categoria) {
    throw new HttpError(404, 'Category not found for this store.');
  }

  return categoria;
};

const ensureOwnedProductOrFail = async (productoId, usuarioId) => {
  const producto = await productoRepository.findByIdAndUsuarioId(productoId, usuarioId);

  if (!producto) {
    throw new HttpError(404, 'Product not found.');
  }

  return producto;
};

const normalizeImagenesPayload = (imagenes) => {
  if (imagenes === undefined) {
    return undefined;
  }

  if (!Array.isArray(imagenes)) {
    throw new HttpError(400, 'Imagenes must be an array.');
  }

  const normalizedImages = imagenes.map((imagen, index) => {
    if (!imagen?.UrlImagen || !String(imagen.UrlImagen).trim()) {
      throw new HttpError(400, `Imagenes[${index}].UrlImagen is required.`);
    }

    return {
      ProductoImagenID: imagen.ProductoImagenID
        ? parsePositiveId(imagen.ProductoImagenID, 'producto imagen id')
        : null,
      UrlImagen: String(imagen.UrlImagen).trim(),
      Orden: imagen.Orden !== undefined
        ? parseNonNegativeInteger(imagen.Orden, 'imagen orden')
        : index + 1,
      EsPrincipal: imagen.EsPrincipal !== undefined
        ? parseBooleanValue(imagen.EsPrincipal, 'Imagen EsPrincipal')
        : false,
    };
  });

  const principalImages = normalizedImages.filter((imagen) => imagen.EsPrincipal);

  if (principalImages.length > 1) {
    throw new HttpError(400, 'Only one image can be marked as principal.');
  }

  return normalizedImages;
};

const normalizeTallasPayload = (tallas) => {
  if (tallas === undefined) {
    return undefined;
  }

  if (!Array.isArray(tallas)) {
    throw new HttpError(400, 'Tallas must be an array.');
  }

  return tallas.map((talla, index) => {
    if (!talla?.Talla || !String(talla.Talla).trim()) {
      throw new HttpError(400, `Tallas[${index}].Talla is required.`);
    }

    const precioMenor = parseNonNegativeNumber(talla.PrecioMenor, `Tallas[${index}].PrecioMenor`);
    const precioMayor = parseNonNegativeNumber(talla.PrecioMayor, `Tallas[${index}].PrecioMayor`);

    return {
      ProductoTallaID: talla.ProductoTallaID
        ? parsePositiveId(talla.ProductoTallaID, 'producto talla id')
        : null,
      Talla: String(talla.Talla).trim(),
      Stock: talla.Stock !== undefined
        ? parseNonNegativeInteger(talla.Stock, 'talla stock')
        : 0,
      PrecioMenor: precioMenor,
      PrecioMayor: precioMayor,
    };
  });
};

const ensureProductPrices = (payload, currentProducto) => {
  const rawPrecioMenor = payload?.PrecioMenor !== undefined
    ? payload.PrecioMenor
    : currentProducto?.PrecioMenor;
  const rawPrecioMayor = payload?.PrecioMayor !== undefined
    ? payload.PrecioMayor
    : currentProducto?.PrecioMayor;

  if (rawPrecioMenor === undefined || rawPrecioMayor === undefined) {
    throw new HttpError(400, 'PrecioMenor and PrecioMayor are required.');
  }

  const precioMenor = parseNonNegativeNumber(rawPrecioMenor, 'PrecioMenor');
  const precioMayor = parseNonNegativeNumber(rawPrecioMayor, 'PrecioMayor');

  return {
    precioMenor,
    precioMayor,
  };
};

const calculatePriceRangeFromTallas = (tallas) => {
  if (!tallas.length) {
    throw new HttpError(400, 'At least one talla is required when UsaTallas is true.');
  }

  const precioMenor = Math.min(...tallas.map((talla) => Number(talla.PrecioMenor)));
  const precioMayor = Math.max(...tallas.map((talla) => Number(talla.PrecioMayor)));

  return {
    precioMenor,
    precioMayor,
  };
};

const syncImagenes = async (productoId, imagenesPayload, transaction) => {
  if (imagenesPayload === undefined) {
    return productoRepository.findActiveImagesByProductoId(productoId, { transaction });
  }

  const existingImages = await productoRepository.findActiveImagesByProductoId(productoId, { transaction });
  const existingImagesMap = new Map(
    existingImages.map((imagen) => [imagen.ProductoImagenID, imagen]),
  );
  const retainedImageIds = new Set();

  for (const imagenPayload of imagenesPayload) {
    if (imagenPayload.ProductoImagenID) {
      const existingImage = existingImagesMap.get(imagenPayload.ProductoImagenID);

      if (!existingImage) {
        throw new HttpError(400, 'ProductoImagenID is invalid for this product.');
      }

      retainedImageIds.add(existingImage.ProductoImagenID);
      await productoRepository.updateProductoImagen(existingImage, {
        UrlImagen: imagenPayload.UrlImagen,
        Orden: imagenPayload.Orden,
        EsPrincipal: imagenPayload.EsPrincipal,
        Estado: true,
      }, { transaction });
    } else {
      const createdImage = await productoRepository.createProductoImagen({
        ProductoID: productoId,
        UrlImagen: imagenPayload.UrlImagen,
        Orden: imagenPayload.Orden,
        EsPrincipal: imagenPayload.EsPrincipal,
        Estado: true,
      }, { transaction });

      retainedImageIds.add(createdImage.ProductoImagenID);
    }
  }

  for (const existingImage of existingImages) {
    if (!retainedImageIds.has(existingImage.ProductoImagenID)) {
      await productoRepository.softDeleteProductoImagen(existingImage, { transaction });
    }
  }

  return productoRepository.findActiveImagesByProductoId(productoId, { transaction });
};

const uploadImagenesPayload = async (imagenesPayload, context) => {
  if (imagenesPayload === undefined) {
    return undefined;
  }

  return Promise.all(
    imagenesPayload.map(async (imagenPayload) => ({
      ...imagenPayload,
      UrlImagen: await resolveProductImageUrl(imagenPayload.UrlImagen, context),
    })),
  );
};

const syncTallas = async (productoId, tallasPayload, transaction) => {
  const existingTallas = await productoRepository.findActiveTallasByProductoId(productoId, { transaction });

  if (tallasPayload === undefined) {
    return existingTallas;
  }

  const existingTallasMap = new Map(
    existingTallas.map((talla) => [talla.ProductoTallaID, talla]),
  );
  const retainedSizeIds = new Set();

  for (const tallaPayload of tallasPayload) {
    if (tallaPayload.ProductoTallaID) {
      const existingTalla = existingTallasMap.get(tallaPayload.ProductoTallaID);

      if (!existingTalla) {
        throw new HttpError(400, 'ProductoTallaID is invalid for this product.');
      }

      retainedSizeIds.add(existingTalla.ProductoTallaID);
      await productoRepository.updateProductoTalla(existingTalla, {
        Talla: tallaPayload.Talla,
        Stock: tallaPayload.Stock,
        PrecioMenor: tallaPayload.PrecioMenor,
        PrecioMayor: tallaPayload.PrecioMayor,
        Estado: true,
      }, { transaction });
    } else {
      const createdSize = await productoRepository.createProductoTalla({
        ProductoID: productoId,
        Talla: tallaPayload.Talla,
        Stock: tallaPayload.Stock,
        PrecioMenor: tallaPayload.PrecioMenor,
        PrecioMayor: tallaPayload.PrecioMayor,
        Estado: true,
      }, { transaction });

      retainedSizeIds.add(createdSize.ProductoTallaID);
    }
  }

  for (const existingTalla of existingTallas) {
    if (!retainedSizeIds.has(existingTalla.ProductoTallaID)) {
      await productoRepository.softDeleteProductoTalla(existingTalla, { transaction });
    }
  }

  return productoRepository.findActiveTallasByProductoId(productoId, { transaction });
};

const deactivateAllTallas = async (productoId, transaction) => {
  const existingTallas = await productoRepository.findActiveTallasByProductoId(productoId, { transaction });

  for (const talla of existingTallas) {
    await productoRepository.softDeleteProductoTalla(talla, { transaction });
  }

  return [];
};

const listStoreProducts = async (tiendaId, usuarioId) => {
  const parsedTiendaId = parsePositiveId(tiendaId, 'tienda id');

  await ensureOwnedStoreOrFail(parsedTiendaId, usuarioId);

  const productos = await productoRepository.findAllByTiendaIdAndUsuarioId(parsedTiendaId, usuarioId);

  return productos.map(serializeProducto);
};

const getProductById = async (productoId, usuarioId) => {
  const parsedProductoId = parsePositiveId(productoId, 'producto id');
  const producto = await ensureOwnedProductOrFail(parsedProductoId, usuarioId);

  return serializeProducto(producto);
};

const createProduct = async (tiendaId, payload, usuarioId) => {
  const parsedTiendaId = parsePositiveId(tiendaId, 'tienda id');

  const tienda = await ensureOwnedStoreOrFail(parsedTiendaId, usuarioId);

  const nombre = ensureProductName(payload?.Nombre);
  const categoriaId = parsePositiveId(payload?.CategoriaID, 'categoria id');

  await ensureOwnedCategoryInStoreOrFail(categoriaId, parsedTiendaId, usuarioId);

  const usaTallas = payload?.UsaTallas !== undefined
    ? parseBooleanValue(payload.UsaTallas, 'UsaTallas')
    : false;
  const imagenesPayload = normalizeImagenesPayload(payload?.Imagenes);
  const tallasPayload = normalizeTallasPayload(payload?.Tallas);
  const uploadedImagenesPayload = await uploadImagenesPayload(imagenesPayload, {
    usuarioId,
    tiendaSlug: tienda.Slug,
    productoNombre: nombre,
  });

  let precioMenor;
  let precioMayor;

  if (usaTallas) {
    if (!tallasPayload || !tallasPayload.length) {
      throw new HttpError(400, 'Tallas are required when UsaTallas is true.');
    }

    ({ precioMenor, precioMayor } = calculatePriceRangeFromTallas(tallasPayload));
  } else {
    ({ precioMenor, precioMayor } = ensureProductPrices(payload));
  }

  const sequelize = getSequelize();

  const producto = await sequelize.transaction(async (transaction) => {
    const createdProduct = await productoRepository.createProducto({
      TiendaID: parsedTiendaId,
      CategoriaID: categoriaId,
      Nombre: nombre,
      Descripcion: payload?.Descripcion || null,
      PrecioMenor: precioMenor,
      PrecioMayor: precioMayor,
      UsaTallas: usaTallas,
      Estado: true,
    }, { transaction });

    const imagenes = await syncImagenes(
      createdProduct.ProductoID,
      uploadedImagenesPayload || [],
      transaction,
    );
    const tallas = usaTallas
      ? await syncTallas(createdProduct.ProductoID, tallasPayload || [], transaction)
      : [];

    createdProduct.setDataValue('Imagenes', imagenes);
    createdProduct.setDataValue('Tallas', tallas);

    return createdProduct;
  });

  return serializeProducto(producto);
};

const updateProduct = async (productoId, payload, usuarioId) => {
  const parsedProductoId = parsePositiveId(productoId, 'producto id');
  const producto = await ensureOwnedProductOrFail(parsedProductoId, usuarioId);
  const tienda = await ensureOwnedStoreOrFail(producto.TiendaID, usuarioId);

  if (payload?.CategoriaID !== undefined) {
    const categoriaId = parsePositiveId(payload.CategoriaID, 'categoria id');
    await ensureOwnedCategoryInStoreOrFail(categoriaId, producto.TiendaID, usuarioId);
  }

  const targetUsaTallas = payload?.UsaTallas !== undefined
    ? parseBooleanValue(payload.UsaTallas, 'UsaTallas')
    : producto.UsaTallas;
  const imagenesPayload = normalizeImagenesPayload(payload?.Imagenes);
  const tallasPayload = normalizeTallasPayload(payload?.Tallas);
  const uploadedImagenesPayload = await uploadImagenesPayload(imagenesPayload, {
    usuarioId,
    tiendaSlug: tienda.Slug,
    productoNombre: payload?.Nombre !== undefined ? payload.Nombre : producto.Nombre,
  });
  const updatePayload = {};

  if (payload?.Nombre !== undefined) {
    updatePayload.Nombre = ensureProductName(payload.Nombre);
  }

  if (payload?.Descripcion !== undefined) {
    updatePayload.Descripcion = payload.Descripcion || null;
  }

  if (payload?.CategoriaID !== undefined) {
    updatePayload.CategoriaID = parsePositiveId(payload.CategoriaID, 'categoria id');
  }

  updatePayload.UsaTallas = targetUsaTallas;
  updatePayload.FechaModificacion = new Date();

  const sequelize = getSequelize();

  const updatedProduct = await sequelize.transaction(async (transaction) => {
    let tallas;

    if (targetUsaTallas) {
      tallas = await syncTallas(producto.ProductoID, tallasPayload, transaction);

      if (!tallas.length) {
        throw new HttpError(400, 'At least one talla is required when UsaTallas is true.');
      }

      const priceRange = calculatePriceRangeFromTallas(tallas);
      updatePayload.PrecioMenor = priceRange.precioMenor;
      updatePayload.PrecioMayor = priceRange.precioMayor;
    } else {
      const productPrices = ensureProductPrices(payload, producto);
      updatePayload.PrecioMenor = productPrices.precioMenor;
      updatePayload.PrecioMayor = productPrices.precioMayor;
      tallas = await deactivateAllTallas(producto.ProductoID, transaction);
    }

    const persistedProduct = await productoRepository.updateProducto(producto, updatePayload, { transaction });
    const imagenes = await syncImagenes(
      producto.ProductoID,
      uploadedImagenesPayload,
      transaction,
    );

    persistedProduct.setDataValue('Imagenes', imagenes);
    persistedProduct.setDataValue('Tallas', tallas);

    return persistedProduct;
  });

  return serializeProducto(updatedProduct);
};

const deleteProduct = async (productoId, usuarioId) => {
  const parsedProductoId = parsePositiveId(productoId, 'producto id');
  const producto = await ensureOwnedProductOrFail(parsedProductoId, usuarioId);
  const sequelize = getSequelize();

  const deletedProduct = await sequelize.transaction(async (transaction) => {
    const imagenes = await productoRepository.findActiveImagesByProductoId(producto.ProductoID, { transaction });
    const tallas = await productoRepository.findActiveTallasByProductoId(producto.ProductoID, { transaction });

    for (const imagen of imagenes) {
      await productoRepository.softDeleteProductoImagen(imagen, { transaction });
    }

    for (const talla of tallas) {
      await productoRepository.softDeleteProductoTalla(talla, { transaction });
    }

    const persistedProduct = await productoRepository.softDeleteProducto(producto, { transaction });
    persistedProduct.setDataValue('Imagenes', []);
    persistedProduct.setDataValue('Tallas', []);

    return persistedProduct;
  });

  return serializeProducto(deletedProduct);
};

module.exports = {
  listStoreProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  serializeProducto,
};
