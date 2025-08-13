import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import RoleBasedError from '../components/RoleBasedError';
import {
  Users,
  Package,
  Route as RouteIcon,
  Clock,
  Plus,
  Eye,
  BarChart3,
  DollarSign,
  Target,
  Truck,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { simulationApi, dataApi } from '../services/simulationApi';
import type { 
  SimulationResult,
  KPIData,
  DatabaseStats,
  DeliveryChartData,
  FuelCostChartData
} from '../types';
import { formatDateTime } from '../lib/utils';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [recentSimulations, setRecentSimulations] = useState<SimulationResult[]>([]);
  const [deliveryChartData, setDeliveryChartData] = useState<DeliveryChartData[]>([]);
  const [fuelCostChartData, setFuelCostChartData] = useState<FuelCostChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initError, setInitError] = useState<string>('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const dbStats = await dataApi.getStats();
      setStats(dbStats);

      const simulations = await simulationApi.getHistory(5);
      setRecentSimulations(simulations);

      if (simulations.length > 0) {
        const latestSim = simulations[0];
        setKpiData({
          totalProfit: latestSim.results.totalProfit,
          efficiencyScore: latestSim.results.efficiencyScore,
          onTimeDeliveries: latestSim.results.onTimeDeliveries,
          lateDeliveries: latestSim.results.lateDeliveries,
          totalFuelCost: latestSim.results.totalFuelCost,
          averageDeliveryTime: latestSim.results.averageDeliveryTime
        });

        const deliveryData: DeliveryChartData[] = [
          {
            name: 'Today',
            onTime: latestSim.results.onTimeDeliveries,
            late: latestSim.results.lateDeliveries
          }
        ];
        setDeliveryChartData(deliveryData);

        const fuelData: FuelCostChartData[] = [
          {
            trafficLevel: 'Low Traffic',
            cost: latestSim.breakdown.fuelCostByTraffic.low,
            percentage: latestSim.breakdown.fuelCostByTraffic.low / latestSim.results.totalFuelCost * 100
          },
          {
            trafficLevel: 'Medium Traffic',
            cost: latestSim.breakdown.fuelCostByTraffic.medium,
            percentage: latestSim.breakdown.fuelCostByTraffic.medium / latestSim.results.totalFuelCost * 100
          },
          {
            trafficLevel: 'High Traffic',
            cost: latestSim.breakdown.fuelCostByTraffic.high,
            percentage: latestSim.breakdown.fuelCostByTraffic.high / latestSim.results.totalFuelCost * 100
          }
        ];
        setFuelCostChartData(fuelData);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const initializeSampleData = async () => {
    try {
      setRefreshing(true);
      setInitError('');
      await dataApi.initializeData();
      toast.success('Sample data initialized successfully');
      await fetchDashboardData();
    } catch (error: unknown) {
      console.error('Failed to initialize data:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 
                          (error as { message?: string })?.message || 
                          'Failed to initialize sample data';
      setInitError(errorMessage);
      
      if (errorMessage.includes('Access denied') || errorMessage.includes('Admin privileges required')) {
        toast.error('Admin privileges required to initialize data');
      } else {
        toast.error('Failed to initialize sample data');
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            GreenCart Logistics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Monitor your delivery operations and KPIs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={initializeSampleData} 
            disabled={refreshing}
            variant="outline"
          >
            {refreshing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Initialize Sample Data
          </Button>
          <Button asChild>
            <Link to="/simulation">
              <BarChart3 className="h-4 w-4 mr-2" />
              Run Simulation
            </Link>
          </Button>
        </div>
      </div>

      {/* Role-based error display */}
      {initError && (
        <div className="mb-6">
          <RoleBasedError error={initError} currentUserRole={user?.role} />
        </div>
      )}

      {kpiData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Total Profit</p>
                  <p className="text-2xl font-bold text-green-800">
                    ₹{kpiData.totalProfit.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Efficiency Score</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {kpiData.efficiencyScore}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Fuel Cost</p>
                  <p className="text-2xl font-bold text-yellow-800">
                    ₹{kpiData.totalFuelCost.toLocaleString()}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Avg Delivery Time</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {Math.round(kpiData.averageDeliveryTime)}m
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Database Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Drivers</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totals.drivers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totals.orders}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Routes</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totals.routes}</p>
                </div>
                <RouteIcon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.ordersByStatus.pending || 0}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* On-time vs Late Deliveries Chart */}
        <Card>
          <CardHeader>
            <CardTitle>On-time vs Late Deliveries</CardTitle>
            <CardDescription>
              Delivery performance comparison from latest simulation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deliveryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deliveryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="onTime" fill="#22c55e" name="On Time" />
                  <Bar dataKey="late" fill="#ef4444" name="Late" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-300 text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No simulation data available</p>
                  <p className="text-sm">Run a simulation to see delivery performance</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fuel Cost Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Fuel Cost Breakdown</CardTitle>
            <CardDescription>
              Fuel costs by traffic level from latest simulation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fuelCostChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={fuelCostChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ trafficLevel, percentage }) => 
                      `${trafficLevel}: ${percentage.toFixed(1)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="cost"
                  >
                    {fuelCostChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${value}`, 'Cost']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-300 text-muted-foreground">
                <div className="text-center">
                  <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No fuel cost data available</p>
                  <p className="text-sm">Run a simulation to see fuel breakdown</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Manage Drivers</CardTitle>
            <CardDescription>
              Add, edit, and manage driver information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link to="/drivers">
                <Users className="h-4 w-4 mr-2" />
                View Drivers
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Manage Routes</CardTitle>
            <CardDescription>
              Create and optimize delivery routes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link to="/routes">
                <RouteIcon className="h-4 w-4 mr-2" />
                View Routes
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Track Orders</CardTitle>
            <CardDescription>
              Monitor and update order status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link to="/orders">
                <Package className="h-4 w-4 mr-2" />
                View Orders
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Run Simulation</CardTitle>
            <CardDescription>
              Analyze delivery performance with KPIs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link to="/simulation">
                <BarChart3 className="h-4 w-4 mr-2" />
                Start Simulation
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Simulations */}
      {recentSimulations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Simulations</CardTitle>
            <CardDescription>
              Latest simulation results and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSimulations.map((simulation) => (
                <div key={simulation._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Simulation {simulation.simulationId.slice(-8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {simulation.inputParameters.numberOfDrivers} drivers, 
                      {simulation.inputParameters.maxHoursPerDriver}h max
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(simulation.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="font-medium">₹{simulation.results.totalProfit.toLocaleString()}</p>
                      <p className="text-muted-foreground">{simulation.results.efficiencyScore}% efficiency</p>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <Link to="/simulation">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
