import { useState, useEffect } from 'react';
import type { Route, CreateRouteInput } from '../types';
import { routeApi } from '../services/routeApi';
import { getErrorMessage } from '../lib/utils';

export const useRoutes = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await routeApi.getAll();
      setRoutes(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const createRoute = async (routeData: CreateRouteInput): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      const newRoute = await routeApi.create(routeData);
      setRoutes(prev => [...prev, newRoute]);
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateRoute = async (id: string, routeData: Partial<CreateRouteInput>): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      const updatedRoute = await routeApi.update(id, routeData);
      setRoutes(prev => prev.map(route => route._id === id ? updatedRoute : route));
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteRoute = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      await routeApi.delete(id);
      setRoutes(prev => prev.filter(route => route._id !== id));
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  return {
    routes,
    loading,
    error,
    fetchRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
    setError
  };
};
