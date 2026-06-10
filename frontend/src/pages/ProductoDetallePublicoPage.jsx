import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ImageOff,
  MessageCircle,
  ShoppingBag,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { getCatalogoPublico } from '../api/catalogo.api';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import { formatCurrency } from '../utils/format';
import { getErrorMessage, showErrorToast } from '../utils/notifications';
import {
  applyStoreDocumentBranding,
  buildWhatsAppUrl,
  getCatalogAccentColor,
  getProductUnitPrice,
  getProductWholesalePrice,
  sanitizeCatalog,
} from '../utils/catalogo-publico';

function ProductoDetallePublicoPage() {
  const { slug, productoId } = useParams();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true);

      try {
        const response = await getCatalogoPublico(slug);
        setCatalog(sanitizeCatalog(response.data));
      } catch (error) {
        setCatalog(null);
        showErrorToast(getErrorMessage(error, 'No se pudo cargar el detalle publico del producto.'));
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, [slug]);

  const product = useMemo(() => (
    catalog?.productos?.find((item) => String(item.ProductoID) === String(productoId)) || null
  ), [catalog, productoId]);

  useEffect(() => {
    if (!catalog?.tienda) {
      return undefined;
    }

    return applyStoreDocumentBranding(catalog.tienda.Nombre, catalog.tienda.Logo);
  }, [catalog?.tienda]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [productoId]);

  if (loading) {
    return <LoadingScreen label="Cargando detalle del producto..." />;
  }

  if (!catalog || !product) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <EmptyState
          title="Producto no disponible"
          description="No encontramos este producto dentro del catalogo publico de la tienda."
        />
      </section>
    );
  }

  const accentColor = getCatalogAccentColor(catalog);
  const selectedCategoryId = searchParams.get('categoria');
  const backUrl = `/${catalog.tienda.Slug}${selectedCategoryId ? `?categoria=${selectedCategoryId}` : ''}`;
  const productWhatsAppUrl = buildWhatsAppUrl(
    catalog.tienda.WhatsApp,
    `Hola, quiero consultar por ${product.Nombre} en ${catalog.tienda.Nombre}.`,
  );
  const activeImage = product.Imagenes?.[selectedImageIndex] || product.Imagenes?.[0] || null;
  const unitPrice = getProductUnitPrice(product);
  const wholesalePrice = getProductWholesalePrice(product);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          className="inline-flex items-center gap-2 rounded-full border border-[#eadce5] bg-white px-4 py-2 text-sm font-semibold text-[#2a3454]"
          to={backUrl}
        >
          <ArrowLeft size={16} />
          Volver al catalogo
        </Link>
        <span className="text-sm text-[#7a8098]">{catalog.tienda.Nombre}</span>
      </div>

      <section className="grid gap-6 rounded-[32px] border border-[#efe2e8] bg-white p-6 shadow-[0_20px_60px_rgba(223,183,196,0.18)] lg:grid-cols-[1.05fr,0.95fr]">
        <div>
          <div className="overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#f8f1f5_100%)]">
            {activeImage?.UrlImagen ? (
              <img
                alt={product.Nombre}
                className="h-[420px] w-full object-contain p-6"
                src={activeImage.UrlImagen}
              />
            ) : (
              <div className="flex h-[420px] items-center justify-center text-[#8d91a6]">
                <ImageOff size={34} />
              </div>
            )}
          </div>

          {product.Imagenes?.length > 1 ? (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {product.Imagenes.map((image, index) => (
                <button
                  className="overflow-hidden rounded-2xl border bg-white"
                  key={image.ProductoImagenID || `${image.UrlImagen}-${index}`}
                  onClick={() => setSelectedImageIndex(index)}
                  style={{ borderColor: index === selectedImageIndex ? accentColor : '#eadce5' }}
                  type="button"
                >
                  <img
                    alt={`Vista ${index + 1} de ${product.Nombre}`}
                    className="h-20 w-20 object-cover"
                    src={image.UrlImagen}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: `${accentColor}14`, color: accentColor }}
              to={`/${catalog.tienda.Slug}?categoria=${product.CategoriaID}`}
            >
              {product.Categoria?.Nombre || 'General'}
            </Link>
            <span className="text-sm text-[#7c829d]">{catalog.tienda.Nombre}</span>
          </div>

          <h1 className="mt-4 text-4xl font-semibold text-[#17213c] md:text-5xl">
            {product.Nombre}
          </h1>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-[#efdfE8] bg-[#fff8fb] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8b90a6]">Precio por unidad</p>
              <p className="mt-2 text-3xl font-bold text-[#17213c]">{formatCurrency(unitPrice)}</p>
            </div>
            <div className="rounded-[24px] border border-[#efdfE8] bg-[#fff8fb] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8b90a6]">Precio por mayor</p>
              <p className="mt-2 text-3xl font-bold text-[#17213c]">{formatCurrency(wholesalePrice)}</p>
            </div>
          </div>

          <p className="mt-6 text-base leading-8 text-[#6d728a]">
            {product.Descripcion || 'Este producto aun no tiene una descripcion adicional publicada.'}
          </p>

          {product.UsaTallas && product.Tallas?.length > 0 ? (
            <div className="mt-6 rounded-[28px] border border-[#efdfE8] bg-[#fffdfd] p-5">
              <p className="text-lg font-semibold text-[#18223e]">Tallas disponibles</p>
              <div className="mt-4 grid gap-3">
                {product.Tallas.map((size) => (
                  <div className="flex items-center justify-between rounded-[20px] bg-[#faf7fb] px-4 py-4" key={size.ProductoTallaID}>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ backgroundColor: accentColor }}>
                        <Check size={16} />
                      </span>
                      <div>
                        <p className="font-semibold text-[#18223e]">{size.Talla}</p>
                        <p className="text-sm text-[#76809a]">Stock: {size.Stock}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-[#5f6783]">
                      <p>Unidad: {formatCurrency(size.PrecioMenor)}</p>
                      <p>Mayor: {formatCurrency(size.PrecioMayor)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#eadce5] px-5 py-4 text-sm font-semibold text-[#22304d]"
              to={backUrl}
            >
              <ChevronLeft size={16} />
              Volver a productos
            </Link>
            {productWhatsAppUrl ? (
              <a
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold text-white"
                href={productWhatsAppUrl}
                rel="noreferrer"
                style={{ backgroundColor: accentColor }}
                target="_blank"
              >
                <MessageCircle size={16} />
                Consultar por WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductoDetallePublicoPage;
