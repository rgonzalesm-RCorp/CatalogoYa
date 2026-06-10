export const sortImages = (images = []) => [...images].sort((left, right) => {
  if (Boolean(left?.EsPrincipal) !== Boolean(right?.EsPrincipal)) {
    return left?.EsPrincipal ? -1 : 1;
  }

  return (left?.Orden || 0) - (right?.Orden || 0);
});

export const buildWhatsAppUrl = (phone, message = '') => {
  const digits = String(phone || '').replace(/\D/g, '');
  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : '';

  return digits ? `https://wa.me/${digits}${encodedMessage}` : '';
};

export const formatWhatsAppDisplay = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if (digits.startsWith('591') && digits.length > 3) {
    const local = digits.slice(3);

    if (local.length >= 8) {
      return `+591 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 8)}${local.slice(8) ? ` ${local.slice(8)}` : ''}`.trim();
    }

    return `+591 ${local}`.trim();
  }

  return phone;
};

const clampChannel = (value) => Math.max(0, Math.min(255, Math.round(value)));

export const normalizeHexColor = (value, fallback = '#f0438a') => (
  /^#([0-9A-Fa-f]{6})$/.test(String(value || '').trim()) ? String(value).trim() : fallback
);

export const hexToRgba = (hexColor, alpha = 1) => {
  const normalized = normalizeHexColor(hexColor);
  const red = Number.parseInt(normalized.slice(1, 3), 16);
  const green = Number.parseInt(normalized.slice(3, 5), 16);
  const blue = Number.parseInt(normalized.slice(5, 7), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export const mixHexWithWhite = (hexColor, amount = 0.5) => {
  const normalized = normalizeHexColor(hexColor);
  const mixAmount = Math.max(0, Math.min(1, amount));
  const red = Number.parseInt(normalized.slice(1, 3), 16);
  const green = Number.parseInt(normalized.slice(3, 5), 16);
  const blue = Number.parseInt(normalized.slice(5, 7), 16);

  const mixedRed = clampChannel(red + ((255 - red) * mixAmount));
  const mixedGreen = clampChannel(green + ((255 - green) * mixAmount));
  const mixedBlue = clampChannel(blue + ((255 - blue) * mixAmount));

  return `#${mixedRed.toString(16).padStart(2, '0')}${mixedGreen.toString(16).padStart(2, '0')}${mixedBlue.toString(16).padStart(2, '0')}`;
};

export const applyStoreDocumentBranding = (storeName, iconUrl) => {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const previousTitle = document.title;
  const head = document.head;
  let favicon = head.querySelector("link[rel='icon'][data-store-favicon='true']");

  if (!favicon) {
    favicon = document.createElement('link');
    favicon.setAttribute('rel', 'icon');
    favicon.setAttribute('data-store-favicon', 'true');
    head.appendChild(favicon);
  }

  const previousHref = favicon.getAttribute('href') || '';
  document.title = storeName ? `${storeName} | Catalogo Digital` : previousTitle;

  if (iconUrl) {
    favicon.setAttribute('href', iconUrl);
  } else if (previousHref) {
    favicon.setAttribute('href', previousHref);
  }

  return () => {
    document.title = previousTitle;

    if (previousHref) {
      favicon.setAttribute('href', previousHref);
    } else {
      favicon.remove();
    }
  };
};

export const sanitizeCatalog = (catalog) => {
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

export const getCatalogAccentColor = (catalog) => (
  catalog?.tienda?.ColorPrincipal || '#f0438a'
);

export const getCategoryPreviewImage = (category, products) => {
  const match = products.find(
    (product) => String(product.CategoriaID) === String(category.CategoriaID) && product.Imagenes?.[0]?.UrlImagen,
  );

  return match?.Imagenes?.[0]?.UrlImagen || '';
};

export const getProductUnitPrice = (product) => product?.PrecioMenor;

export const getProductWholesalePrice = (product) => product?.PrecioMayor;

export const getHeroImage = (catalog) => (
  catalog?.tienda?.Portada
  || catalog?.productos?.find((product) => product.Imagenes?.[0]?.UrlImagen)?.Imagenes?.[0]?.UrlImagen
  || ''
);

export const getProductBadge = (product, index = 0) => {
  if (product.UsaTallas) {
    return { label: 'Tallas', className: 'bg-[#ffe8f1] text-[#e83f8b]' };
  }

  if (index % 3 === 1) {
    return { label: 'Oferta', className: 'bg-[#ffe9ef] text-[#f0527d]' };
  }

  return { label: 'Nuevo', className: 'bg-[#f4eafe] text-[#8550f5]' };
};
