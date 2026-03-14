import api from './axios';

export const getReceipts = (params) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/receipts?${query}`);
};
export const createReceipt = (data) => api.post('/receipts', data);
export const updateReceipt = (id, data) => api.put(`/receipts/${id}`, data);
export const confirmReceipt = (id) => api.put(`/receipts/${id}/confirm`);
export const validateReceipt = (id) => api.put(`/receipts/${id}/validate`);
export const cancelReceipt = (id) => api.put(`/receipts/${id}/cancel`);
export const deleteReceipt = (id) => api.delete(`/receipts/${id}`);
