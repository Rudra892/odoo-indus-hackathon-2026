import api from './axios';

export const getTransfers = (params) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/transfers?${query}`);
};
export const createTransfer = (data) => api.post('/transfers', data);
export const updateTransfer = (id, data) => api.put(`/transfers/${id}`, data);
export const validateTransfer = (id) => api.put(`/transfers/${id}/validate`);
export const cancelTransfer = (id) => api.put(`/transfers/${id}/cancel`);
export const deleteTransfer = (id) => api.delete(`/transfers/${id}`);
