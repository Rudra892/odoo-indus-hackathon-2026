import api from './axios';

export const getAdjustments = (params) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/adjustments?${query}`);
};
export const createAdjustment = (data) => api.post('/adjustments', data);
