import { useState, useEffect } from 'react';
import type { Order, CreateOrderInput } from '../types';
import { orderApi } from '../services/orderApi';
import { getErrorMessage } from '../lib/utils';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await orderApi.getAll();
      setOrders(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: CreateOrderInput): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      const newOrder = await orderApi.create(orderData);
      setOrders(prev => [...prev, newOrder]);
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id: string, orderData: Partial<CreateOrderInput>): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      const updatedOrder = await orderApi.update(id, orderData);
      setOrders(prev => prev.map(order => order._id === id ? updatedOrder : order));
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      await orderApi.delete(id);
      setOrders(prev => prev.filter(order => order._id !== id));
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    setError
  };
};
