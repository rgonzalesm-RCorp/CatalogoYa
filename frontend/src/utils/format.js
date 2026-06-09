export const formatCurrency = (value) => new Intl.NumberFormat('es-BO', {
  style: 'currency',
  currency: 'BOB',
  maximumFractionDigits: 2,
}).format(Number(value || 0));

export const formatDate = (value) => {
  if (!value) {
    return 'No disponible';
  }

  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'medium',
  }).format(new Date(value));
};
