import api from './api';

export interface CSVUploadResponse {
  success: boolean;
  message: string;
  data?: {
    type: string;
    count: number;
  };
  error?: string;
}

export interface DatabaseStats {
  success: boolean;
  data: {
    totals: {
      drivers: number;
      routes: number;
      orders: number;
    };
    ordersByStatus: Record<string, number>;
    routesByTraffic: Record<string, { count: number; avgDistance: number }>;
  };
}

export const csvApi = {
  // Upload CSV file
  uploadCsv: async (file: File, type: 'drivers' | 'orders' | 'routes'): Promise<CSVUploadResponse> => {
    const formData = new FormData();
    formData.append('csvFile', file);
    
    const response = await api.post(`/data/upload/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Initialize sample data
  initializeData: async (): Promise<CSVUploadResponse> => {
    const response = await api.post('/data/init');
    return response.data;
  },

  // Get database statistics
  getDatabaseStats: async (): Promise<DatabaseStats> => {
    const response = await api.get('/data/stats');
    return response.data;
  },

  // Clear all data
  clearAllData: async (): Promise<CSVUploadResponse> => {
    const response = await api.delete('/data/clear');
    return response.data;
  },

  // Clear specific data type
  clearSpecificData: async (type: 'drivers' | 'orders' | 'routes'): Promise<CSVUploadResponse> => {
    const response = await api.delete(`/data/clear/${type}`);
    return response.data;
  },

  // Download CSV template
  downloadTemplate: (type: 'drivers' | 'orders' | 'routes'): void => {
    const templates = {
      drivers: `name,shift_hours,past_week_hours
John Doe,6,6|8|7|7|7|6|10
Jane Smith,8,10|9|6|6|6|7|7
Mike Johnson,7,10|6|10|7|10|9|7`,
      
      orders: `order_id,value_rs,route_id,delivery_time
1,2594,7,02:07
2,1835,6,01:19
3,766,9,01:06`,
      
      routes: `route_id,distance_km,traffic_level,base_time_min
1,25,High,125
2,12,High,48
3,6,Low,18`
    };

    const content = templates[type];
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
