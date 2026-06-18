import api from '../api/axiosConfig';

export const getMenus = async (params = {}) => {
  const response = await api.get('/api/menus', { params });
  return response.data;
};

export const getTodayMenu = async () => {
  const response = await api.get('/api/menus/today');
  return response.data;
};

export const getMenuById = async (id) => {
  const response = await api.get(`/api/menus/${id}`);
  return response.data;
};

export const createMenu = async (data) => {
  const response = await api.post('/api/menus', data);
  return response.data;
};

export const updateMenu = async (id, data) => {
  const response = await api.put(`/api/menus/${id}`, data);
  return response.data;
};

export const deleteMenu = async (id) => {
  await api.delete(`/api/menus/${id}`);
};
