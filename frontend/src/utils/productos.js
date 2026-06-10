import { readFileAsDataUrl } from './files';

export const getProductFormValues = (product) => {
  const rawImages = Array.isArray(product?.Imagenes) ? product.Imagenes : [];
  const normalizedImages = rawImages.map((image, index) => ({
    ProductoImagenID: image?.ProductoImagenID || null,
    UrlImagen: image?.UrlImagen || '',
    EsPrincipal: Boolean(image?.EsPrincipal),
    Orden: image?.Orden || index + 1,
  }));

  if (normalizedImages.length && !normalizedImages.some((image) => image.EsPrincipal)) {
    normalizedImages[0].EsPrincipal = true;
  }

  return {
    Nombre: product?.Nombre || '',
    Descripcion: product?.Descripcion || '',
    CategoriaID: product?.CategoriaID ? String(product.CategoriaID) : '',
    PrecioMenor: product?.PrecioMenor ?? '',
    PrecioMayor: product?.PrecioMayor ?? '',
    UsaTallas: Boolean(product?.UsaTallas),
    Estado: product?.Estado ?? true,
    Imagenes: normalizedImages,
    Tallas: Array.isArray(product?.Tallas)
      ? product.Tallas.map((size) => ({
        ProductoTallaID: size?.ProductoTallaID || null,
        Talla: size?.Talla || '',
        Stock: size?.Stock ?? 0,
        PrecioMenor: size?.PrecioMenor ?? '',
        PrecioMayor: size?.PrecioMayor ?? '',
      }))
      : [],
  };
};

const parseTrimmedString = (value) => String(value ?? '').trim();

const parseRequiredString = (value, label) => {
  const normalizedValue = parseTrimmedString(value);

  if (!normalizedValue) {
    throw new Error(`${label} es obligatorio.`);
  }

  return normalizedValue;
};

const parsePositiveId = (value, label) => {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    throw new Error(`${label} es obligatorio.`);
  }

  return parsedValue;
};

const parseNonNegativeNumber = (value, label) => {
  const normalizedValue = parseTrimmedString(value);
  const parsedValue = Number(normalizedValue);

  if (!normalizedValue.length || Number.isNaN(parsedValue) || parsedValue < 0) {
    throw new Error(`${label} debe ser un número mayor o igual a 0.`);
  }

  return parsedValue;
};

const parseNonNegativeInteger = (value, label) => {
  const normalizedValue = parseTrimmedString(value);
  const parsedValue = Number.parseInt(normalizedValue, 10);

  if (!normalizedValue.length || Number.isNaN(parsedValue) || parsedValue < 0) {
    throw new Error(`${label} debe ser un entero mayor o igual a 0.`);
  }

  return parsedValue;
};

const normalizeImages = (images = []) => {
  const validImages = images
    .map((image) => ({
      ProductoImagenID: image?.ProductoImagenID || null,
      UrlImagen: parseTrimmedString(image?.UrlImagen),
      EsPrincipal: Boolean(image?.EsPrincipal),
    }))
    .filter((image) => image.UrlImagen);

  if (!validImages.length) {
    return [];
  }

  let principalIndex = validImages.findIndex((image) => image.EsPrincipal);

  if (principalIndex < 0) {
    principalIndex = 0;
  }

  return validImages.map((image, index) => ({
    ProductoImagenID: image.ProductoImagenID || undefined,
    UrlImagen: image.UrlImagen,
    Orden: index + 1,
    EsPrincipal: index === principalIndex,
  }));
};

const normalizeSizes = (sizes = []) => {
  const nonEmptySizes = sizes.filter((size) => (
    parseTrimmedString(size?.Talla)
    || parseTrimmedString(size?.Stock)
    || parseTrimmedString(size?.PrecioMenor)
    || parseTrimmedString(size?.PrecioMayor)
  ));

  return nonEmptySizes.map((size, index) => {
    const talla = parseRequiredString(size?.Talla, `Talla ${index + 1}`);
    const stock = parseNonNegativeInteger(size?.Stock, `Stock de ${talla}`);
    const precioMenor = parseNonNegativeNumber(size?.PrecioMenor, `Precio menor de ${talla}`);
    const precioMayor = parseNonNegativeNumber(size?.PrecioMayor, `Precio mayor de ${talla}`);

    return {
      ProductoTallaID: size?.ProductoTallaID || undefined,
      Talla: talla,
      Stock: stock,
      PrecioMenor: precioMenor,
      PrecioMayor: precioMayor,
    };
  });
};

export const buildProductPayload = (values) => {
  const payload = {
    Nombre: parseRequiredString(values?.Nombre, 'Nombre'),
    Descripcion: parseTrimmedString(values?.Descripcion) || null,
    CategoriaID: parsePositiveId(values?.CategoriaID, 'Categoría'),
    UsaTallas: Boolean(values?.UsaTallas),
    Estado: values?.Estado ?? true,
    Imagenes: normalizeImages(values?.Imagenes || []),
  };

  if (payload.UsaTallas) {
    const tallas = normalizeSizes(values?.Tallas || []);

    if (!tallas.length) {
      throw new Error('Debes registrar al menos una talla activa.');
    }

    payload.Tallas = tallas;
    return payload;
  }

  const precioMenor = parseNonNegativeNumber(values?.PrecioMenor, 'Precio menor');
  const precioMayor = parseNonNegativeNumber(values?.PrecioMayor, 'Precio mayor');

  payload.PrecioMenor = precioMenor;
  payload.PrecioMayor = precioMayor;

  return payload;
};

export const getPriceRangeFromSizes = (sizes = []) => {
  const normalizedPrices = sizes
    .map((size) => ({
      min: Number(size?.PrecioMenor),
      max: Number(size?.PrecioMayor),
    }))
    .filter((size) => !Number.isNaN(size.min) && !Number.isNaN(size.max));

  if (!normalizedPrices.length) {
    return null;
  }

  return {
    min: Math.min(...normalizedPrices.map((size) => size.min)),
    max: Math.max(...normalizedPrices.map((size) => size.max)),
  };
};

export const getPrincipalImage = (images = []) => (
  images.find((image) => image?.EsPrincipal) || images[0] || null
);
