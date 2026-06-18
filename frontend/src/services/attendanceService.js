import api from '../api/axiosConfig';

export const getAttendance = async (params = {}) => {
  const response = await api.get('/api/attendance', { params });
  return response.data;
};

export const getAttendanceByStudent = async (studentId, params = {}) => {
  const response = await api.get(`/api/attendance/student/${studentId}`, { params });
  return response.data;
};

export const getAttendanceById = async (id) => {
  const response = await api.get(`/api/attendance/${id}`);
  return response.data;
};

export const createAttendance = async (data) => {
  const response = await api.post('/api/attendance', data);
  return response.data;
};

export const updateAttendance = async (id, data) => {
  const response = await api.put(`/api/attendance/${id}`, data);
  return response.data;
};

export const deleteAttendance = async (id) => {
  await api.delete(`/api/attendance/${id}`);
};
