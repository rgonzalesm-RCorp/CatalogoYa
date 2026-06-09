import {
  ImageOff,
  MessageCircle,
  Search,
  SearchX,
  Shirt,
  Sparkles,
  Store,
} from 'lucide-react';
import { useDeferredValue, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getCatalogoPublico } from '../api/catalogo.api';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import { formatCurrency } from '../utils/format';
import { getErrorMessage, showErrorToast } from '../utils/notifications';

const normalizeText = (value = '') => String(value).toLowerCase().trim();

const sortImages = (images = []) => [...images].sort((left, right) => {
  if (Boolean(left?.EsPrincipal) !== Boolean(right?.EsPrincipal)) {
    return left?.EsPrincipal ? -1 : 1;
  }

  return (left?.Orden || 0) - (right?.Orden || 0);
});

const buildWhatsAppUrl = (phone, message = '') => {
  const digits = String(phone || '').replace(/\D/g, '');
  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : '';

  return digits ? `https://wa.me/${digits}${encodedMessage}` : '';
};

const sanitizeCatalog = (catalog) => {
  if (!catalog?.tienda?.TiendaID) {
    return null;
  }

  const storeId = catalog.tienda.TiendaID;
  const categories = Array.isArray(catalog.categorias)
    ? catalog.categorias.filter((category) => category?.TiendaID === storeId)
    : [];
  const categoryIds = new Set(categories.map((category) => category.CategoriaID));
  const products = Array.isArray(catalog.productos)
    ? catalog.productos
      .filter((product) => (
        product?.TiendaID === storeId
        && (!product?.CategoriaID || categoryIds.has(product.CategoriaID))
      ))
      .map((product) => ({
        ...product,
        Imagenes: sortImages(product.Imagenes || []),
        Tallas: product.UsaTallas ? (product.Tallas || []) : [],
      }))
    : [];

  return {
    tienda: catalog.tienda,
    categorias: categories,
    productos: products,
  };
};

function CatalogoPublicoPage() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true);
      setNotFound(false);
      setSearchQuery('');
      setSelectedCategoryId('all');

      try {
        const response = await getCatalogoPublico(slug);
        setCatalog(sanitizeCatalog(response.data));
      } catch (error) {
        setCatalog(null);

        if (error?.response?.status === 404) {
          setNotFound(true);
        } else {
          showErrorToast(getErrorMessage(error, 'No se pudo cargar el catálogo público.'));
        }
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, [slug]);

  if (loading) {
    return <LoadingScreen label="Cargando catálogo público..." />;
  }

  if (notFound) {
    return (
      <section className="panel text-center">
        <p className="badge mx-auto">404</p>
        <h1 className="mt-5 font-display text-4xl font-semibold text-brand-forest">
          Esta tienda no existe o ya no está activa
        </h1>
        <p className="mt-4 text-sm leading-6 text-brand-moss">
          Revisa el `slug` de la URL. Si eres dueño de la tienda, entra al panel para validar que siga activa.
        </p>
      </section>
    );
  }

  if (!catalog) {
    return (
      <EmptyState
        title="Catálogo no disponible"
        description="No se pudo cargar el catálogo público de esta tienda en este momento."
      />
    );
  }

  const heroStyle = catalog.tienda.ColorPrincipal
    ? {
      background: `linear-gradient(135deg, ${catalog.tienda.ColorPrincipal}, #18261f)`,
    }
    : undefined;
  const normalizedQuery = normalizeText(deferredSearchQuery);
  const visibleProducts = catalog.productos.filter((product) => {
    const matchesCategory = selectedCategoryId === 'all'
      || String(product.CategoriaID) === String(selectedCategoryId);
    const searchableText = normalizeText([
      product.Nombre,
      product.Descripcion,
      product.Categoria?.Nombre,
    ].filter(Boolean).join(' '));
    const matchesSearch = !normalizedQuery || searchableText.includes(normalizedQuery);

    return matchesCategory && matchesSearch;
  });
  const totalProducts = catalog.productos.length;
  const hasWhatsApp = Boolean(catalog.tienda.WhatsApp);
  const storeWhatsAppUrl = hasWhatsApp
    ? buildWhatsAppUrl(
      catalog.tienda.WhatsApp,
      `Hola, quiero consultar por la tienda ${catalog.tienda.Nombre}.`,
    )
    : '';

  return (
    <div className="space-y-6">
      <section
        className="overflow-hidden rounded-[32px] border border-white/50 bg-[linear-gradient(135deg,_#244734_0%,_#18261f_100%)] shadow-soft"
        style={heroStyle}
      >
        <div className="grid gap-0 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="order-2 p-5 text-white md:p-8 lg:order-1">
            <div className="flex items-start gap-4">
              {catalog.tienda.Logo ? (
                <img
                  alt={`Logo de ${catalog.tienda.Nombre}`}
                  className="h-20 w-20 rounded-[28px] border border-white/20 object-cover shadow-soft md:h-24 md:w-24"
                  src={catalog.tienda.Logo}
                />
              ) : (
                <span className="inline-flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/20 bg-white/10 shadow-soft md:h-24 md:w-24">
                  <Store size={28} />
                </span>
              )}

              <div className="min-w-0">
                <p className="badge bg-white/15 text-white">{catalog.tienda.Slug}</p>
                <h1 className="mt-4 font-display text-4xl font-semibold md:text-5xl">
                  {catalog.tienda.Nombre}
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 md:text-base">
                  {catalog.tienda.Descripcion || 'Esta tienda todavía no publicó una descripción para su catálogo.'}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/15 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/65">Productos</p>
                <p className="mt-2 font-display text-3xl font-semibold">{totalProducts}</p>
              </div>
              <div className="rounded-[24px] border border-white/15 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/65">Categorías</p>
                <p className="mt-2 font-display text-3xl font-semibold">{catalog.categorias.length}</p>
              </div>
              <div className="rounded-[24px] border border-white/15 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/65">Contacto</p>
                <p className="mt-2 text-sm font-semibold">{catalog.tienda.WhatsApp || 'No disponible'}</p>
              </div>
            </div>

            {storeWhatsAppUrl ? (
              <a
                className="button-primary mt-6"
                href={storeWhatsAppUrl}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle size={16} />
                Consultar por WhatsApp
              </a>
            ) : null}
          </div>

          <div className="order-1 min-h-[260px] lg:order-2 lg:min-h-full">
            {catalog.tienda.Portada ? (
              <img
                alt={`Portada de ${catalog.tienda.Nombre}`}
                className="h-full min-h-[260px] w-full object-cover"
                src={catalog.tienda.Portada}
              />
            ) : (
              <div className="flex h-full min-h-[260px] items-center justify-center bg-brand-ink/30 text-white/80">
                <ImageOff size={30} />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="text-brand-coral" size={18} />
            <h2 className="font-display text-2xl font-semibold text-brand-forest">Explora el catálogo</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-moss" size={18} />
              <input
                className="field pl-12"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Busca por producto, categoría o descripción"
                value={searchQuery}
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                className={selectedCategoryId === 'all' ? 'button-primary' : 'button-secondary'}
                onClick={() => setSelectedCategoryId('all')}
                type="button"
              >
                Todas
              </button>
              {catalog.categorias.map((category) => (
                <button
                  className={String(selectedCategoryId) === String(category.CategoriaID) ? 'button-primary' : 'button-secondary'}
                  key={category.CategoriaID}
                  onClick={() => setSelectedCategoryId(String(category.CategoriaID))}
                  type="button"
                >
                  {category.Nombre}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 rounded-[24px] bg-brand-cream/70 px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-brand-forest">
              {visibleProducts.length} productos visibles
            </p>
            <p className="mt-1 text-sm text-brand-moss">
              Mostrando solo productos de <span className="font-semibold">{catalog.tienda.Nombre}</span>.
            </p>
          </div>
          <p className="hidden text-sm text-brand-moss sm:block">
            Filtro activo: {selectedCategoryId === 'all'
              ? 'Todas las categorías'
              : catalog.categorias.find((category) => String(category.CategoriaID) === String(selectedCategoryId))?.Nombre || 'Categoría'}
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleProducts.length > 0 ? (
          visibleProducts.map((product) => {
            const productWhatsAppUrl = hasWhatsApp
              ? buildWhatsAppUrl(
                catalog.tienda.WhatsApp,
                `Hola, quiero consultar por ${product.Nombre} en ${catalog.tienda.Nombre}.`,
              )
              : '';

            return (
              <article className="panel overflow-hidden p-0" key={product.ProductoID}>
                <div className="p-4">
                  {product.Imagenes[0]?.UrlImagen ? (
                    <img
                      alt={product.Nombre}
                      className="h-64 w-full rounded-[28px] object-cover"
                      src={product.Imagenes[0].UrlImagen}
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center rounded-[28px] bg-brand-cream text-brand-moss">
                      <ImageOff size={26} />
                    </div>
                  )}

                  {product.Imagenes.length > 1 ? (
                    <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                      {product.Imagenes.map((image) => (
                        <img
                          alt={`Imagen ${image.Orden} de ${product.Nombre}`}
                          className={[
                            'h-20 w-20 flex-none rounded-2xl object-cover',
                            image.EsPrincipal ? 'ring-2 ring-brand-coral' : '',
                          ].join(' ')}
                          key={image.ProductoImagenID}
                          src={image.UrlImagen}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="border-t border-brand-mist/60 px-4 pb-4 pt-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="badge">{product.Categoria?.Nombre || 'General'}</p>
                        <h3 className="mt-4 font-display text-3xl font-semibold text-brand-forest">
                          {product.Nombre}
                        </h3>
                      </div>
                      <div className="rounded-3xl bg-brand-cream px-4 py-3 text-right">
                        <p className="text-xs uppercase tracking-[0.18em] text-brand-moss">Precio</p>
                        <p className="mt-2 font-semibold text-brand-forest">
                          {formatCurrency(product.PrecioMenor)} - {formatCurrency(product.PrecioMayor)}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm leading-6 text-brand-moss">
                      {product.Descripcion || 'Sin descripción pública.'}
                    </p>

                    {product.UsaTallas && product.Tallas.length > 0 ? (
                      <div className="rounded-[24px] bg-brand-cream/70 p-4">
                        <div className="flex items-center gap-2 text-brand-forest">
                          <Shirt size={16} />
                          <p className="font-semibold">Tallas disponibles</p>
                        </div>
                        <div className="mt-4 grid gap-3">
                          {product.Tallas.map((size) => (
                            <div className="rounded-3xl bg-white p-4" key={size.ProductoTallaID}>
                              <div className="flex items-center justify-between gap-4">
                                <p className="text-sm font-semibold text-brand-forest">{size.Talla}</p>
                                <p className="text-sm text-brand-moss">Stock: {size.Stock}</p>
                              </div>
                              <p className="mt-2 text-sm text-brand-moss">
                                {formatCurrency(size.PrecioMenor)} - {formatCurrency(size.PrecioMayor)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {productWhatsAppUrl ? (
                      <a
                        className="button-primary mt-2 w-full"
                        href={productWhatsAppUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <MessageCircle size={16} />
                        Consultar por WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="sm:col-span-2 xl:col-span-3">
            {totalProducts === 0 ? (
              <EmptyState
                title="Sin productos activos"
                description="La tienda todavía no tiene productos públicos activos en este catálogo."
              />
            ) : (
              <div className="panel text-center">
                <SearchX className="mx-auto text-brand-coral" size={28} />
                <p className="mt-4 font-display text-2xl font-semibold text-brand-forest">
                  No encontramos productos con esos filtros
                </p>
                <p className="mt-3 text-sm leading-6 text-brand-moss">
                  Cambia la búsqueda o vuelve a `Todas` para ver más productos de esta tienda.
                </p>
                <div className="mt-5 flex justify-center">
                  <button
                    className="button-secondary"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategoryId('all');
                    }}
                    type="button"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default CatalogoPublicoPage;
