import api from './api';
import type { Route, CreateRouteInput } from '../types';

export const routeApi = {
  getAll: async (): Promise<Route[]> => {
    const response = await api.get('/routes');
    return response.data;
  },

  getById: async (id: string): Promise<Route> => {
    const response = await api.get(`/routes/${id}`);
    return response.data;
  },

  create: async (routeData: CreateRouteInput): Promise<Route> => {
    const response = await api.post('/routes', routeData);
    return response.data;
  },

  update: async (id: string, routeData: Partial<CreateRouteInput>): Promise<Route> => {
    const response = await api.put(`/routes/${id}`, routeData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/routes/${id}`);
  }
};
