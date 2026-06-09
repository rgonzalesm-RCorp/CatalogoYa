import api from './axios';

export const getCatalogoPublico = async (slug) => {
  const { data } = await api.get(`/public/catalogo/${slug}`);
  return data;
};
