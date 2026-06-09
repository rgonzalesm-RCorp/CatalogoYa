import api from './axios';

export const getTiendas = async () => {
  const { data } = await api.get('/tiendas');
  return data;
};

export const getTiendaById = async (id) => {
  const { data } = await api.get(`/tiendas/${id}`);
  return data;
};

export const createTienda = async (payload) => {
  const { data } = await api.post('/tiendas', payload);
  return data;
};

export const updateTienda = async (id, payload) => {
  const { data } = await api.put(`/tiendas/${id}`, payload);
  return data;
};

export const deleteTienda = async (id) => {
  const { data } = await api.delete(`/tiendas/${id}`);
  return data;
};
