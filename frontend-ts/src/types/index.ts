export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string, role?: 'admin' | 'driver') => Promise<AuthResult>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  getToken: () => string | null;
}

export interface AuthResult {
  success: boolean;
  message?: string;
  data?: unknown;
}

export interface Driver {
  _id: string;
  name: string;
  licenseNumber: string;
  phone?: string;
  assignedRoute?: Route;
  currentShiftHours: number;
  past7DaysHours: number;
  dailyHoursWorked: number;
  fatigueStatus: boolean;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDriverInput {
  name: string;
  licenseNumber: string;
  phone?: string;
  assignedRoute?: string;
  currentShiftHours?: number;
  past7DaysHours?: number;
  dailyHoursWorked?: number;
  fatigueStatus?: boolean;
  isAvailable?: boolean;
}

export interface Route {
  _id: string;
  routeId: string;
  routeName: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  trafficLevel: 'Low' | 'Medium' | 'High';
  baseTime: number;
  estimatedTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRouteInput {
  routeId: string;
  routeName: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  trafficLevel: 'Low' | 'Medium' | 'High';
  baseTime: number;
  estimatedTime?: number;
}

// Order Types
export type OrderStatus = 'pending' | 'in-transit' | 'delivered' | 'late';

export interface Order {
  _id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  value: number;
  assignedRoute?: Route;
  assignedDriver?: Driver;
  status: OrderStatus;
  deliveryTimestamp?: string;
  actualDeliveryTime?: number;
  isOnTime: boolean;
  penalty: number;
  bonus: number;
  fuelCost: number;
  profit: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  orderId: string;
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  value: number;
  assignedRoute?: string;
  assignedDriver?: string;
  status?: OrderStatus;
}

// Simulation Types
export interface SimulationInputs {
  numberOfDrivers: number;
  routeStartTime: string;
  maxHoursPerDriver: number;
}

export interface SimulationResults {
  totalProfit: number;
  efficiencyScore: number;
  totalOrders: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  totalFuelCost: number;
  totalPenalties: number;
  totalBonuses: number;
  averageDeliveryTime: number;
  driversUsed: number;
}

export interface SimulationBreakdown {
  fuelCostByTraffic: {
    low: number;
    medium: number;
    high: number;
  };
  deliveryStatus: {
    onTime: number;
    late: number;
  };
}

export interface SimulationResult {
  _id: string;
  simulationId: string;
  inputParameters: SimulationInputs;
  results: SimulationResults;
  breakdown: SimulationBreakdown;
  simulationDate: string;
  executedBy: User;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SimulationResponse {
  simulationId: string;
  results: SimulationResults;
  breakdown: SimulationBreakdown;
  processedOrders: Order[];
  savedResult: SimulationResult;
}

// Dashboard Types
export interface DashboardStats {
  totalDrivers: number;
  totalRoutes: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  lateDeliveries: number;
  availableDrivers: number;
  fatigueDrivers: number;
}

export interface KPIData {
  totalProfit: number;
  efficiencyScore: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  totalFuelCost: number;
  averageDeliveryTime: number;
}

// Chart Data Types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface DeliveryChartData {
  name: string;
  onTime: number;
  late: number;
}

export interface FuelCostChartData {
  trafficLevel: string;
  cost: number;
  percentage: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  success: boolean;
  message: string;
  statusCode?: number;
  error?: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'driver';
}

export interface SimulationFormData {
  numberOfDrivers: number;
  routeStartTime: string;
  maxHoursPerDriver: number;
}

// Database Stats Types
export interface DatabaseStats {
  totals: {
    drivers: number;
    routes: number;
    orders: number;
  };
  ordersByStatus: {
    [key: string]: number;
  };
  routesByTraffic: {
    [key: string]: {
      count: number;
      avgDistance: number;
    };
  };
}

// Generic Types
export interface FormState<T> {
  data: T;
  loading: boolean;
  error: string;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
}

// Utility Types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  status?: OrderStatus;
  trafficLevel?: 'Low' | 'Medium' | 'High';
  isAvailable?: boolean;
}
