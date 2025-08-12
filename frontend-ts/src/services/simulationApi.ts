import api from './api';
import type { 
  SimulationResult, 
  SimulationInputs, 
  SimulationResponse,
  ApiResponse,
  DatabaseStats
} from '../types';

export const simulationApi = {
  run: async (inputs: SimulationInputs): Promise<SimulationResponse> => {
    const response = await api.post<ApiResponse<SimulationResponse>>('/simulation/run', inputs);
    return response.data.data;
  },

  getResults: async (page = 1, limit = 10): Promise<ApiResponse<SimulationResult[]>> => {
    const response = await api.get<ApiResponse<SimulationResult[]>>(
      `/simulation/results?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getResult: async (id: string): Promise<SimulationResult> => {
    const response = await api.get<ApiResponse<SimulationResult>>(`/simulation/results/${id}`);
    return response.data.data;
  },

  getBySimulationId: async (simulationId: string): Promise<SimulationResult> => {
    const response = await api.get<ApiResponse<SimulationResult>>(`/simulation/${simulationId}`);
    return response.data.data;
  },

  getHistory: async (limit = 10): Promise<SimulationResult[]> => {
    const response = await api.get<ApiResponse<SimulationResult[]>>(
      `/simulation/history?limit=${limit}`
    );
    return response.data.data;
  },

  deleteResult: async (id: string): Promise<void> => {
    await api.delete(`/simulation/results/${id}`);
  }
};

export const dataApi = {
  initializeData: async (): Promise<void> => {
    await api.post('/data/init');
  },

  uploadCsv: async (type: 'drivers' | 'routes' | 'orders', filePath: string): Promise<void> => {
    await api.post(`/data/upload/${type}`, { filePath });
  },

  getStats: async (): Promise<DatabaseStats> => {
    const response = await api.get<ApiResponse<DatabaseStats>>('/data/stats');
    return response.data.data;
  },

  clearData: async (): Promise<void> => {
    await api.delete('/data/clear');
  }
};
