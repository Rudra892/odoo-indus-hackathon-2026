import api from './axios';

export const getKPIs = () => api.get('/dashboard/kpis');
