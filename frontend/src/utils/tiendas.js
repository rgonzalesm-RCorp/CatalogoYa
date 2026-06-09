export const PUBLIC_STORES_DOMAIN = 'catalogosYa.com';

export const generateStoreSlug = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .replace(/-{2,}/g, '-');

export const buildPublicStoreUrl = (slug = '') => (
  slug ? `${PUBLIC_STORES_DOMAIN}/${slug}` : `${PUBLIC_STORES_DOMAIN}/tu-slug`
);

export const normalizeOptionalText = (value) => {
  const normalizedValue = typeof value === 'string' ? value.trim() : '';
  return normalizedValue;
};

export const getStoreFormValues = (store) => ({
  Nombre: store?.Nombre || '',
  Slug: store?.Slug || '',
  Logo: store?.Logo || '',
  Portada: store?.Portada || '',
  WhatsApp: store?.WhatsApp || '',
  Descripcion: store?.Descripcion || '',
  ColorPrincipal: store?.ColorPrincipal || '#244734',
  Estado: store?.Estado ?? true,
});

export const buildStorePayload = (values) => ({
  Nombre: normalizeOptionalText(values?.Nombre),
  Slug: generateStoreSlug(values?.Slug || values?.Nombre),
  Logo: normalizeOptionalText(values?.Logo),
  Portada: normalizeOptionalText(values?.Portada),
  WhatsApp: normalizeOptionalText(values?.WhatsApp),
  Descripcion: normalizeOptionalText(values?.Descripcion),
  ColorPrincipal: normalizeOptionalText(values?.ColorPrincipal),
  Estado: values?.Estado ?? true,
});

export const copyText = async (value) => {
  if (!value) {
    throw new Error('No hay contenido para copiar.');
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = value;
  textArea.setAttribute('readonly', 'readonly');
  textArea.style.position = 'absolute';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();

  const successful = document.execCommand('copy');
  document.body.removeChild(textArea);

  if (!successful) {
    throw new Error('No se pudo copiar la URL pública.');
  }
};
