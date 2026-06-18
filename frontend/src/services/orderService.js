import api from '../api/axiosConfig';

export const getOrders = async (params = {}) => {
  const response = await api.get('/api/orders', { params });
  return response.data;
};

export const getOrdersByStudent = async (studentId, params = {}) => {
  const response = await api.get(`/api/orders/student/${studentId}`, { params });
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/api/orders/${id}`);
  return response.data;
};

export const createOrder = async (data) => {
  const response = await api.post('/api/orders', data);
  return response.data;
};

export const updateOrder = async (id, data) => {
  const response = await api.put(`/api/orders/${id}`, data);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/api/orders/${id}/status`, { status });
  return response.data;
};

export const cancelOrder = async (id) => {
  const response = await api.put(`/api/orders/${id}/cancel`);
  return response.data;
};

export const deleteOrder = async (id) => {
  await api.delete(`/api/orders/${id}`);
};
