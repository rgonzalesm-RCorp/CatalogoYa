import api from './axios';

export const loginWithGoogle = async (payload) => {
  const { data } = await api.post('/auth/google', payload);
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};
