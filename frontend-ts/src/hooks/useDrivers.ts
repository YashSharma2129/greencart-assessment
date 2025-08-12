import { useState, useEffect } from 'react';
import type { Driver, CreateDriverInput } from '../types';
import { driverApi } from '../services/driverApi';
import { getErrorMessage } from '../lib/utils';

export const useDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await driverApi.getAll();
      setDrivers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const createDriver = async (driverData: CreateDriverInput): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      const newDriver = await driverApi.create(driverData);
      setDrivers(prev => [...prev, newDriver]);
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateDriver = async (id: string, driverData: Partial<CreateDriverInput>): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      const updatedDriver = await driverApi.update(id, driverData);
      setDrivers(prev => prev.map(driver => driver._id === id ? updatedDriver : driver));
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteDriver = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      await driverApi.delete(id);
      setDrivers(prev => prev.filter(driver => driver._id !== id));
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return {
    drivers,
    loading,
    error,
    fetchDrivers,
    createDriver,
    updateDriver,
    deleteDriver,
    setError
  };
};
