import api from './api';
import type { Driver, CreateDriverInput } from '../types';

export const driverApi = {
  getAll: async (): Promise<Driver[]> => {
    const response = await api.get('/drivers');
    return response.data;
  },

  getById: async (id: string): Promise<Driver> => {
    const response = await api.get(`/drivers/${id}`);
    return response.data;
  },

  create: async (driverData: CreateDriverInput): Promise<Driver> => {
    const response = await api.post('/drivers', driverData);
    return response.data;
  },

  update: async (id: string, driverData: Partial<CreateDriverInput>): Promise<Driver> => {
    const response = await api.put(`/drivers/${id}`, driverData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/drivers/${id}`);
  }
};
