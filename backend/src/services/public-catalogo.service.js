const categoriaRepository = require('../repositories/categoria.repository');
const productoRepository = require('../repositories/producto.repository');
const tiendaRepository = require('../repositories/tienda.repository');
const { HttpError } = require('../helpers/http-error.helper');
const { generateSlug } = require('../helpers/slug.helper');

const serializePublicStore = (tienda) => ({
  TiendaID: tienda.TiendaID,
  Nombre: tienda.Nombre,
  Slug: tienda.Slug,
  Logo: tienda.Logo,
  Portada: tienda.Portada,
  WhatsApp: tienda.WhatsApp,
  Descripcion: tienda.Descripcion,
  ColorPrincipal: tienda.ColorPrincipal,
});

const serializePublicCategory = (categoria) => ({
  CategoriaID: categoria.CategoriaID,
  TiendaID: categoria.TiendaID,
  Nombre: categoria.Nombre,
  Descripcion: categoria.Descripcion,
});

const serializePublicImage = (imagen) => ({
  ProductoImagenID: imagen.ProductoImagenID,
  UrlImagen: imagen.UrlImagen,
  Orden: imagen.Orden,
  EsPrincipal: imagen.EsPrincipal,
});

const serializePublicSize = (talla) => ({
  ProductoTallaID: talla.ProductoTallaID,
  Talla: talla.Talla,
  Stock: talla.Stock,
  PrecioMenor: talla.PrecioMenor,
  PrecioMayor: talla.PrecioMayor,
});

const sortImages = (imagenes = []) => [...imagenes].sort((left, right) => {
  if (left.Orden !== right.Orden) {
    return left.Orden - right.Orden;
  }

  return left.ProductoImagenID - right.ProductoImagenID;
});

const sortSizes = (tallas = []) => [...tallas].sort(
  (left, right) => left.ProductoTallaID - right.ProductoTallaID,
);

const serializePublicProduct = (producto) => ({
  ProductoID: producto.ProductoID,
  TiendaID: producto.TiendaID,
  CategoriaID: producto.CategoriaID,
  Categoria: producto.Categoria
    ? {
      CategoriaID: producto.Categoria.CategoriaID,
      Nombre: producto.Categoria.Nombre,
    }
    : null,
  Nombre: producto.Nombre,
  Descripcion: producto.Descripcion,
  PrecioMenor: producto.PrecioMenor,
  PrecioMayor: producto.PrecioMayor,
  UsaTallas: producto.UsaTallas,
  Imagenes: sortImages(producto.Imagenes || []).map(serializePublicImage),
  Tallas: producto.UsaTallas
    ? sortSizes(producto.Tallas || []).map(serializePublicSize)
    : [],
});

const getPublicCatalogBySlug = async (slug) => {
  const normalizedSlug = generateSlug(slug);

  if (!normalizedSlug) {
    throw new HttpError(404, 'Store not found.');
  }

  const tienda = await tiendaRepository.findActiveBySlug(normalizedSlug);

  if (!tienda) {
    throw new HttpError(404, 'Store not found.');
  }

  const [categorias, productos] = await Promise.all([
    categoriaRepository.findActiveByTiendaId(tienda.TiendaID),
    productoRepository.findActiveByTiendaId(tienda.TiendaID),
  ]);

  return {
    tienda: serializePublicStore(tienda),
    categorias: categorias.map(serializePublicCategory),
    productos: productos.map(serializePublicProduct),
  };
};

module.exports = {
  getPublicCatalogBySlug,
};
