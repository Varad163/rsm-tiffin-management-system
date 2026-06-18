import api from '../api/axiosConfig';

export const getStudents = async (params = {}) => {
  const response = await api.get('/api/admin/students', { params });
  return response.data;
};

export const getStudentById = async (id) => {
  const response = await api.get(`/api/admin/students/${id}`);
  return response.data;
};

export const createStudent = async (data) => {
  const response = await api.post('/api/admin/students', data);
  return response.data;
};

export const updateStudent = async (id, data) => {
  const response = await api.put(`/api/admin/students/${id}`, data);
  return response.data;
};

export const deleteStudent = async (id) => {
  await api.delete(`/api/admin/students/${id}`);
};

export const getProfile = async () => {
  const response = await api.get('/api/student/profile');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/api/student/profile', data);
  return response.data;
};

export const uploadAadhaar = async (studentId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/api/students/${studentId}/aadhaar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
