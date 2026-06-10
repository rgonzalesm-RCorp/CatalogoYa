import {
  Eye,
  MessageCircle,
  ShoppingBag,
  Store,
  Tag,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { getCatalogoPublico } from '../api/catalogo.api';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import { formatCurrency } from '../utils/format';
import { getErrorMessage, showErrorToast } from '../utils/notifications';
import {
  applyStoreDocumentBranding,
  buildWhatsAppUrl,
  formatWhatsAppDisplay,
  getCatalogAccentColor,
  getProductUnitPrice,
  getProductWholesalePrice,
  hexToRgba,
  mixHexWithWhite,
  sanitizeCatalog,
} from '../utils/catalogo-publico';

function CatalogoPublicoPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const response = await getCatalogoPublico(slug);
        setCatalog(sanitizeCatalog(response.data));
      } catch (error) {
        setCatalog(null);

        if (error?.response?.status === 404) {
          setNotFound(true);
        } else {
          showErrorToast(getErrorMessage(error, 'No se pudo cargar el catalogo publico.'));
        }
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, [slug]);

  const selectedCategoryId = searchParams.get('categoria') || 'all';

  const setCategoryFilter = (categoryId) => {
    const nextParams = new URLSearchParams(searchParams);

    if (!categoryId || categoryId === 'all') {
      nextParams.delete('categoria');
    } else {
      nextParams.set('categoria', String(categoryId));
    }

    setSearchParams(nextParams);
  };

  const visibleProducts = useMemo(() => {
    if (!catalog) {
      return [];
    }

    return catalog.productos.filter((product) => (
      selectedCategoryId === 'all'
      || String(product.CategoriaID) === String(selectedCategoryId)
    ));
  }, [catalog, selectedCategoryId]);

  useEffect(() => {
    if (!catalog?.tienda) {
      return undefined;
    }

    return applyStoreDocumentBranding(catalog.tienda.Nombre, catalog.tienda.Logo);
  }, [catalog?.tienda]);

  if (loading) {
    return <LoadingScreen label="Cargando catalogo publico..." />;
  }

  if (notFound) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="panel text-center">
          <p className="badge mx-auto">404</p>
          <h1 className="mt-5 font-display text-4xl font-semibold text-brand-forest">
            Esta tienda no existe o ya no esta activa
          </h1>
          <p className="mt-4 text-sm leading-6 text-brand-moss">
            Revisa el slug de la URL. Si eres dueno de la tienda, entra al panel para validar que siga activa.
          </p>
        </div>
      </section>
    );
  }

  if (!catalog) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <EmptyState
          title="Catalogo no disponible"
          description="No se pudo cargar el catalogo publico de esta tienda en este momento."
        />
      </section>
    );
  }

  const accentColor = getCatalogAccentColor(catalog);
  const storeWhatsAppUrl = buildWhatsAppUrl(
    catalog.tienda.WhatsApp,
    `Hola, quiero consultar por la tienda ${catalog.tienda.Nombre}.`,
  );
  const displayPhone = formatWhatsAppDisplay(catalog.tienda.WhatsApp);
  const pageBackground = `linear-gradient(180deg, ${mixHexWithWhite(accentColor, 0.92)} 0%, ${mixHexWithWhite(accentColor, 0.97)} 100%)`;
  const headerBackground = `linear-gradient(180deg, ${mixHexWithWhite(accentColor, 0.95)} 0%, ${mixHexWithWhite(accentColor, 0.985)} 100%)`;
  const footerBackground = `linear-gradient(180deg, ${mixHexWithWhite(accentColor, 0.965)} 0%, ${mixHexWithWhite(accentColor, 0.93)} 100%)`;
  const sectionBorder = hexToRgba(accentColor, 0.16);
  const categoryItems = catalog.categorias;
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col text-[#162033]" style={{ background: pageBackground }}>
      <header
        className="border-b"
        style={{
          background: headerBackground,
          borderColor: sectionBorder,
        }}
      >
        <div className="mx-auto flex max-w-[1220px] flex-col gap-5 px-4 py-6 md:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {catalog.tienda.Logo ? (
              <img
                alt={`Logo de ${catalog.tienda.Nombre}`}
                className="h-14 w-14 rounded-2xl border border-[#ebedf2] object-cover"
                src={catalog.tienda.Logo}
              />
            ) : (
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ebedf2] bg-[#f8fafc] text-[#22304b]">
                <Store size={24} />
              </span>
            )}

            <div>
              <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#102340] md:text-[2.15rem]">
                {catalog.tienda.Nombre}
              </h1>
              <p className="mt-1 text-sm text-[#63708b]">Catalogo Digital</p>
            </div>
          </div>

          {storeWhatsAppUrl ? (
            <a
              className="inline-flex items-center gap-4 rounded-[24px] border bg-white/88 px-5 py-4 shadow-[0_10px_30px_rgba(16,35,64,0.05)] transition hover:-translate-y-0.5"
              href={storeWhatsAppUrl}
              rel="noreferrer"
              style={{ borderColor: sectionBorder }}
              target="_blank"
            >
              <span
                className="inline-flex h-12 w-12 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: accentColor }}
              >
                <MessageCircle size={22} />
              </span>
              <span className="block">
                <span className="block text-sm text-[#61708b]">Escribenos por WhatsApp</span>
                <span className="block text-[1.15rem] font-bold tracking-[0.01em]" style={{ color: accentColor }}>
                  {displayPhone || catalog.tienda.WhatsApp}
                </span>
              </span>
            </a>
          ) : null}
        </div>
      </header>

      <main className="mx-auto flex-1 w-full max-w-[1220px] px-4 py-5 md:px-6 md:py-6">
        <section className="overflow-x-auto pb-2">
          <div className="flex min-w-max items-center gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-[18px] border px-5 py-3 text-sm font-semibold shadow-sm transition"
              onClick={() => setCategoryFilter('all')}
              style={{
                backgroundColor: selectedCategoryId === 'all' ? accentColor : '#ffffff',
                borderColor: selectedCategoryId === 'all' ? accentColor : '#dbe1e8',
                color: selectedCategoryId === 'all' ? '#ffffff' : '#13233d',
              }}
              type="button"
            >
              <ShoppingBag size={16} />
              Todas
            </button>

            {categoryItems.map((category) => {
              const isActive = String(selectedCategoryId) === String(category.CategoriaID);

              return (
                <button
                  className="inline-flex items-center gap-2 rounded-[18px] border bg-white px-5 py-3 text-sm font-semibold text-[#13233d] shadow-sm transition hover:border-[#cfd7e2]"
                  key={category.CategoriaID}
                  onClick={() => setCategoryFilter(category.CategoriaID)}
                  style={{
                    backgroundColor: isActive ? `${accentColor}14` : '#ffffff',
                    borderColor: isActive ? accentColor : '#dbe1e8',
                    color: isActive ? accentColor : '#13233d',
                  }}
                  type="button"
                >
                  <Tag size={15} />
                  {category.Nombre}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[#6c7891]">
              Mostrando <span className="font-semibold text-[#13233d]">{visibleProducts.length}</span> productos
              {selectedCategoryId !== 'all' ? ' en la categoria seleccionada' : ''}
            </p>
          </div>

          {selectedCategoryId !== 'all' ? (
            <button
              className="rounded-full border border-[#dbe1e8] bg-white px-4 py-2 text-sm font-semibold text-[#31415f]"
              onClick={() => setCategoryFilter('all')}
              type="button"
            >
              Limpiar filtro
            </button>
          ) : null}
        </section>

        <section className="mt-5">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {visibleProducts.length > 0 ? visibleProducts.map((product) => {
              const unitPrice = getProductUnitPrice(product);
              const wholesalePrice = getProductWholesalePrice(product);
              const productUrl = `/${catalog.tienda.Slug}/producto/${product.ProductoID}${selectedCategoryId !== 'all' ? `?categoria=${selectedCategoryId}` : ''}`;
              const productWhatsAppUrl = buildWhatsAppUrl(
                catalog.tienda.WhatsApp,
                `Hola, quiero consultar por ${product.Nombre} en ${catalog.tienda.Nombre}.`,
              );

              return (
                <article
                  className="overflow-hidden rounded-[26px] border border-[#dde2e8] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(15,23,42,0.1)]"
                  key={product.ProductoID}
                  onClick={() => navigate(productUrl)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      navigate(productUrl);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="relative">
                    <button
                      className="absolute left-4 top-4 z-10 rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.02em] text-[#22304b] shadow-[0_6px_18px_rgba(15,23,42,0.08)]"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setCategoryFilter(product.CategoriaID);
                      }}
                      type="button"
                    >
                      {product.Categoria?.Nombre || 'General'}
                    </button>

                    <Link className="block" to={productUrl}>
                      <div className="aspect-[1/0.92] overflow-hidden bg-[#f1f3f6]">
                        {product.Imagenes[0]?.UrlImagen ? (
                          <img
                            alt={product.Nombre}
                            className="h-full w-full object-cover"
                            src={product.Imagenes[0].UrlImagen}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[#8a94a9]">
                            <ShoppingBag size={28} />
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>

                  <div className="p-2">
                    <Link className="block" to={productUrl}>
                      <h2 className="mt-1 line-clamp-2 text-[0.875rem] font-extrabold uppercase leading-6 text-[#13233d]">
                        {product.Nombre}
                      </h2>
                    </Link>

                    <div className="mt-3">
                      <p className="text-[1.25rem] font-extrabold leading-none" style={{ color: accentColor }}>
                        {formatCurrency(unitPrice)}
                      </p>
                      {wholesalePrice !== undefined && wholesalePrice !== null ? (
                        <p className="mt-2 text-sm font-medium text-[#6f7890]">
                          Mayor: <span className="font-semibold text-[#13233d]">{formatCurrency(wholesalePrice)}</span>
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <Link
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#d9dee6] bg-white px-4 py-3 text-sm font-semibold text-[#111c31] transition hover:border-[#c5ceda]"
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                        to={productUrl}
                      >
                        <Eye size={16} />
                        Ver detalle
                      </Link>

                      <a
                        className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] text-white transition hover:scale-[1.03]"
                        href={productWhatsAppUrl || storeWhatsAppUrl || '#contacto'}
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                        rel="noreferrer"
                        style={{ backgroundColor: accentColor }}
                        target={productWhatsAppUrl || storeWhatsAppUrl ? '_blank' : undefined}
                      >
                        <MessageCircle size={20} />
                      </a>
                    </div>
                  </div>
                </article>
              );
            }) : (
              <div className="rounded-[28px] border border-dashed border-[#d7dde5] bg-white p-8 text-sm text-[#6c7891] sm:col-span-2 xl:col-span-4">
                No hay productos para la categoria seleccionada.
              </div>
            )}
          </div>

          {categoryItems.length === 0 ? (
            <div className="mt-6 rounded-[28px] border border-dashed border-[#d7dde5] bg-white p-8 text-sm text-[#6c7891]">
              Esta tienda aun no tiene categorias publicas activas.
            </div>
          ) : null}
        </section>
      </main>

      <footer
        className="border-t"
        style={{
          background: footerBackground,
          borderColor: sectionBorder,
        }}
      >
        <div className="mx-auto max-w-[1220px] px-4 py-5 text-center text-sm text-[#63708b] md:px-6">
          Copyright {currentYear} {catalog.tienda.Nombre}. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

export default CatalogoPublicoPage;
