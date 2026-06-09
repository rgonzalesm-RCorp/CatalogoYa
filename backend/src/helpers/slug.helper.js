const normalizeText = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const generateSlug = (value) => {
  const normalizedValue = normalizeText(String(value || '').trim().toLowerCase());

  const slug = normalizedValue
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return slug;
};

module.exports = { generateSlug };
