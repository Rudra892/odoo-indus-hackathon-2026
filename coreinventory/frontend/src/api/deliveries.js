import api from './axios';

export const getDeliveries = (params) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/deliveries?${query}`);
};
export const createDelivery = (data) => api.post('/deliveries', data);
export const updateDelivery = (id, data) => api.put(`/deliveries/${id}`, data);
export const confirmDelivery = (id) => api.put(`/deliveries/${id}/confirm`);
export const validateDelivery = (id) => api.put(`/deliveries/${id}/validate`);
export const cancelDelivery = (id) => api.put(`/deliveries/${id}/cancel`);
export const deleteDelivery = (id) => api.delete(`/deliveries/${id}`);
