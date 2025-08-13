import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Play,
  RotateCcw,
  DollarSign,
  Timer,
  BarChart3,
  Settings,
  Download,
  Target,
  Fuel,
  History,
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
import { simulationApi } from '../services/simulationApi';
import { toast } from 'sonner';
import type { 
  SimulationInputs, 
  SimulationResponse, 
  SimulationResult,
  DeliveryChartData,
  FuelCostChartData
} from '../types';

const Simulation: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('configure');
  const [simulationHistory, setSimulationHistory] = useState<SimulationResult[]>([]);
  const [currentSimulation, setCurrentSimulation] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [inputs, setInputs] = useState<SimulationInputs>({
    numberOfDrivers: 5,
    routeStartTime: '09:00',
    maxHoursPerDriver: 8,
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    fetchSimulationHistory();
  }, []);

  const fetchSimulationHistory = async () => {
    try {
      const history = await simulationApi.getHistory(10);
      setSimulationHistory(history);
    } catch (error) {
      console.error('Failed to fetch simulation history:', error);
    }
  };

  const handleRunSimulation = async () => {
    try {
      setIsRunning(true);
      setLoading(true);
      
      // Validate inputs
      if (inputs.numberOfDrivers < 1 || inputs.numberOfDrivers > 50) {
        toast.error('Number of drivers must be between 1 and 50');
        return;
      }

      if (inputs.maxHoursPerDriver < 1 || inputs.maxHoursPerDriver > 16) {
        toast.error('Max hours per driver must be between 1 and 16');
        return;
      }

      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(inputs.routeStartTime)) {
        toast.error('Route start time must be in HH:MM format');
        return;
      }

      const result = await simulationApi.run(inputs);
      setCurrentSimulation(result);
      setActiveTab('results');
      toast.success('Simulation completed successfully!');
      
      // Refresh history
      await fetchSimulationHistory();
      
    } catch (error: unknown) {
      console.error('Simulation failed:', error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Simulation failed. Please try again.');
    } finally {
      setIsRunning(false);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentSimulation(null);
    setActiveTab('configure');
  };

  const downloadReport = () => {
    if (!currentSimulation) return;
    
    const reportData = {
      simulationId: currentSimulation.simulationId,
      inputs: inputs,
      results: currentSimulation.results,
      breakdown: currentSimulation.breakdown,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `simulation-report-${currentSimulation.simulationId.slice(-8)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Report downloaded successfully');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDeliveryChartData = (): DeliveryChartData[] => {
    if (!currentSimulation) return [];
    
    return [
      {
        name: 'Delivery Performance',
        onTime: currentSimulation.results.onTimeDeliveries,
        late: currentSimulation.results.lateDeliveries
      }
    ];
  };

  const getFuelCostChartData = (): FuelCostChartData[] => {
    if (!currentSimulation) return [];
    
    const { fuelCostByTraffic } = currentSimulation.breakdown;
    const total = fuelCostByTraffic.low + fuelCostByTraffic.medium + fuelCostByTraffic.high;
    
    if (total === 0) return [];
    
    return [
      {
        trafficLevel: 'Low Traffic',
        cost: fuelCostByTraffic.low,
        percentage: (fuelCostByTraffic.low / total) * 100
      },
      {
        trafficLevel: 'Medium Traffic',
        cost: fuelCostByTraffic.medium,
        percentage: (fuelCostByTraffic.medium / total) * 100
      },
      {
        trafficLevel: 'High Traffic',
        cost: fuelCostByTraffic.high,
        percentage: (fuelCostByTraffic.high / total) * 100
      }
    ].filter(item => item.cost > 0);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Delivery Simulation</h1>
          <p className="text-muted-foreground">
            Run simulations to analyze delivery performance and calculate KPIs based on GreenCart's business rules
          </p>
        </div>
        <div className="flex gap-2">
          {currentSimulation && (
            <Button onClick={downloadReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          )}
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            New Simulation
          </Button>
        </div>
      </div>

      {/* Simulation Configuration & Results */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="configure">Configure</TabsTrigger>
              <TabsTrigger value="results" disabled={!currentSimulation}>Results</TabsTrigger>
              <TabsTrigger value="charts" disabled={!currentSimulation}>Charts</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Configuration Tab */}
            <TabsContent value="configure" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Simulation Parameters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="numberOfDrivers">Number of Drivers</Label>
                      <Input
                        id="numberOfDrivers"
                        type="number"
                        min="1"
                        max="50"
                        value={inputs.numberOfDrivers}
                        onChange={(e) => setInputs(prev => ({ 
                          ...prev, 
                          numberOfDrivers: parseInt(e.target.value) || 1 
                        }))}
                        disabled={isRunning}
                      />
                      <p className="text-sm text-muted-foreground">
                        Available drivers for the simulation (1-50)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="routeStartTime">Route Start Time</Label>
                      <Input
                        id="routeStartTime"
                        type="time"
                        value={inputs.routeStartTime}
                        onChange={(e) => setInputs(prev => ({ 
                          ...prev, 
                          routeStartTime: e.target.value 
                        }))}
                        disabled={isRunning}
                      />
                      <p className="text-sm text-muted-foreground">
                        Time when delivery routes begin (HH:MM format)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxHoursPerDriver">Max Hours per Driver</Label>
                      <Input
                        id="maxHoursPerDriver"
                        type="number"
                        min="1"
                        max="16"
                        value={inputs.maxHoursPerDriver}
                        onChange={(e) => setInputs(prev => ({ 
                          ...prev, 
                          maxHoursPerDriver: parseInt(e.target.value) || 8 
                        }))}
                        disabled={isRunning}
                      />
                      <p className="text-sm text-muted-foreground">
                        Maximum working hours per driver per day (1-16)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Company Rules Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">GreenCart Business Rules</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                    <div>
                      <p><strong>Late Delivery Penalty:</strong> ₹50 if delivery time exceeds base time + 10 minutes</p>
                      <p><strong>Driver Fatigue:</strong> 30% speed reduction if driver works &gt;8 hours</p>
                    </div>
                    <div>
                      <p><strong>High-Value Bonus:</strong> 10% bonus for orders &gt;₹1000 delivered on time</p>
                      <p><strong>Fuel Cost:</strong> ₹5/km base + ₹2/km surcharge for high traffic</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={handleRunSimulation} 
                    disabled={isRunning || loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Running Simulation...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Simulation
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="mt-6">
              {currentSimulation && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-700">Total Profit</p>
                            <p className="text-2xl font-bold text-green-800">
                              {formatCurrency(currentSimulation.results.totalProfit)}
                            </p>
                          </div>
                          <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-700">Efficiency Score</p>
                            <p className="text-2xl font-bold text-blue-800">
                              {currentSimulation.results.efficiencyScore}%
                            </p>
                          </div>
                          <Target className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-yellow-700">Total Fuel Cost</p>
                            <p className="text-2xl font-bold text-yellow-800">
                              {formatCurrency(currentSimulation.results.totalFuelCost)}
                            </p>
                          </div>
                          <Fuel className="h-8 w-8 text-yellow-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-purple-700">Avg Delivery Time</p>
                            <p className="text-2xl font-bold text-purple-800">
                              {Math.round(currentSimulation.results.averageDeliveryTime)}m
                            </p>
                          </div>
                          <Timer className="h-8 w-8 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Order Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>Total Orders:</span>
                          <span className="font-medium">{currentSimulation.results.totalOrders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>On-Time Deliveries:</span>
                          <span className="font-medium text-green-600">{currentSimulation.results.onTimeDeliveries}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Late Deliveries:</span>
                          <span className="font-medium text-red-600">{currentSimulation.results.lateDeliveries}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Drivers Used:</span>
                          <span className="font-medium">{currentSimulation.results.driversUsed}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Financial Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>Total Bonuses:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(currentSimulation.results.totalBonuses)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Penalties:</span>
                          <span className="font-medium text-red-600">
                            {formatCurrency(currentSimulation.results.totalPenalties)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fuel Costs:</span>
                          <span className="font-medium text-yellow-600">
                            {formatCurrency(currentSimulation.results.totalFuelCost)}
                          </span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between font-bold">
                            <span>Net Profit:</span>
                            <span className={currentSimulation.results.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(currentSimulation.results.totalProfit)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Charts Tab */}
            <TabsContent value="charts" className="mt-6">
              {currentSimulation && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Delivery Performance Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Performance</CardTitle>
                      <CardDescription>On-time vs Late deliveries</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getDeliveryChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="onTime" fill="#22c55e" name="On Time" />
                          <Bar dataKey="late" fill="#ef4444" name="Late" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Fuel Cost Breakdown Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Fuel Cost Breakdown</CardTitle>
                      <CardDescription>Distribution by traffic level</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={getFuelCostChartData()}
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
                            {getFuelCostChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Cost']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Simulation History
                  </h3>
                  <Button onClick={fetchSimulationHistory} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                
                {simulationHistory.length > 0 ? (
                  <div className="space-y-4">
                    {simulationHistory.map((simulation) => (
                      <Card key={simulation._id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium">
                                Simulation {simulation.simulationId.slice(-8)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {simulation.inputParameters.numberOfDrivers} drivers • 
                                {simulation.inputParameters.maxHoursPerDriver}h max • 
                                Started at {simulation.inputParameters.routeStartTime}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(simulation.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="font-bold text-lg">
                                {formatCurrency(simulation.results.totalProfit)}
                              </p>
                              <p className="text-sm">
                                <span className="text-green-600">{simulation.results.efficiencyScore}%</span> efficiency
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {simulation.results.onTimeDeliveries}/{simulation.results.totalOrders} on time
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No simulation history found</p>
                    <p className="text-sm text-muted-foreground">Run your first simulation to see results here</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Simulation;
