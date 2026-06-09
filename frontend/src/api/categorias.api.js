import api from './axios';

export const getCategoriasByTienda = async (tiendaId) => {
  const { data } = await api.get(`/tiendas/${tiendaId}/categorias`);
  return data;
};

export const getCategoriaById = async (id) => {
  const { data } = await api.get(`/categorias/${id}`);
  return data;
};

export const createCategoria = async (tiendaId, payload) => {
  const { data } = await api.post(`/tiendas/${tiendaId}/categorias`, payload);
  return data;
};

export const updateCategoria = async (id, payload) => {
  const { data } = await api.put(`/categorias/${id}`, payload);
  return data;
};

export const deleteCategoria = async (id) => {
  const { data } = await api.delete(`/categorias/${id}`);
  return data;
};
