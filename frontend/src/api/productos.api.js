import api from './axios';

export const getProductosByTienda = async (tiendaId) => {
  const { data } = await api.get(`/tiendas/${tiendaId}/productos`);
  return data;
};

export const getProductoById = async (id) => {
  const { data } = await api.get(`/productos/${id}`);
  return data;
};

export const createProducto = async (tiendaId, payload) => {
  const { data } = await api.post(`/tiendas/${tiendaId}/productos`, payload);
  return data;
};

export const updateProducto = async (id, payload) => {
  const { data } = await api.put(`/productos/${id}`, payload);
  return data;
};

export const deleteProducto = async (id) => {
  const { data } = await api.delete(`/productos/${id}`);
  return data;
};
