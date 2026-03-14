import api from './axios';

export const getLocations = (params) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/locations?${query}`);
};
export const createLocation = (data) => api.post('/locations', data);
export const updateLocation = (id, data) => api.put(`/locations/${id}`, data);
export const deleteLocation = (id) => api.delete(`/locations/${id}`);
