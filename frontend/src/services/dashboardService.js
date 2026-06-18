import api from '../api/axiosConfig';

export const getDashboardStats = async () => {
  const response = await api.get('/api/dashboard');
  return response.data;
};
