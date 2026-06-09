const { v2: cloudinary } = require('cloudinary');

const { env } = require('../config/env');
const { HttpError } = require('../helpers/http-error.helper');
const { generateSlug } = require('../helpers/slug.helper');

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const ensureCloudinaryConfigured = () => {
  if (
    !env.CLOUDINARY_CLOUD_NAME
    || !env.CLOUDINARY_API_KEY
    || !env.CLOUDINARY_API_SECRET
  ) {
    throw new HttpError(500, 'Cloudinary is not configured.');
  }
};

const sanitizeFolderSegment = (value, fallback) => generateSlug(value) || fallback;

const isCloudinaryUrl = (value) => {
  if (!value) {
    return false;
  }

  try {
    const parsedUrl = new URL(value);

    return parsedUrl.hostname === 'res.cloudinary.com';
  } catch (error) {
    return false;
  }
};

const uploadImage = async (source, folder) => {
  const normalizedSource = typeof source === 'string' ? source.trim() : '';

  if (!normalizedSource) {
    return null;
  }

  if (isCloudinaryUrl(normalizedSource)) {
    return normalizedSource;
  }

  ensureCloudinaryConfigured();

  try {
    const result = await cloudinary.uploader.upload(normalizedSource, {
      folder,
      resource_type: 'image',
      overwrite: false,
      unique_filename: true,
    });

    return result.secure_url;
  } catch (error) {
    throw new HttpError(400, 'Image upload to Cloudinary failed.');
  }
};

const resolveStoreImageUrl = async (source, {
  usuarioId,
  tiendaSlug,
  assetType,
}) => {
  const folder = [
    'catalogosya',
    'tiendas',
    `usuario-${usuarioId}`,
    sanitizeFolderSegment(tiendaSlug, 'tienda'),
    sanitizeFolderSegment(assetType, 'imagen'),
  ].join('/');

  return uploadImage(source, folder);
};

const resolveProductImageUrl = async (source, {
  usuarioId,
  tiendaSlug,
  productoNombre,
}) => {
  const folder = [
    'catalogosya',
    'tiendas',
    `usuario-${usuarioId}`,
    sanitizeFolderSegment(tiendaSlug, 'tienda'),
    'productos',
    sanitizeFolderSegment(productoNombre, 'producto'),
  ].join('/');

  return uploadImage(source, folder);
};

module.exports = {
  resolveStoreImageUrl,
  resolveProductImageUrl,
};
