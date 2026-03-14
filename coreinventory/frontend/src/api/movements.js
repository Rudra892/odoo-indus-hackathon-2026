import api from './axios';

export const getMovements = (params) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/movements?${query}`);
};
