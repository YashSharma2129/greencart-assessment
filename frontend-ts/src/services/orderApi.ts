import api from './api';
import type { Order, CreateOrderInput } from '../types';

export const orderApi = {
  getAll: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (orderData: CreateOrderInput): Promise<Order> => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  update: async (id: string, orderData: Partial<CreateOrderInput>): Promise<Order> => {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  }
};
