const simulationEngine = require('../utils/simulationEngine');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// Mock the models
jest.mock('../models/Driver');
jest.mock('../models/Route');
jest.mock('../models/Order');
jest.mock('../models/SimulationResult');

describe('Simulation Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock sample data
    const mockDrivers = [
      { _id: 'driver1', name: 'John Doe', isAvailable: true, dailyHoursWorked: 4, fatigueStatus: false },
      { _id: 'driver2', name: 'Jane Smith', isAvailable: true, dailyHoursWorked: 6, fatigueStatus: false },
      { _id: 'driver3', name: 'Bob Wilson', isAvailable: true, dailyHoursWorked: 2, fatigueStatus: false }
    ];

    const mockRoutes = [
      { _id: 'route1', distance: 10, baseTime: 45, trafficLevel: 'Medium' },
      { _id: 'route2', distance: 15, baseTime: 60, trafficLevel: 'High' }
    ];

    const mockOrders = [
      { _id: 'order1', value: 800, assignedRoute: mockRoutes[0], toObject: () => ({ value: 800 }) },
      { _id: 'order2', value: 1200, assignedRoute: mockRoutes[1], toObject: () => ({ value: 1200 }) }
    ];

    // Mock database queries
    Driver.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockDrivers)
      })
    });

    Route.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockRoutes)
    });

    Order.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockOrders)
    });
  });

  test('should handle basic simulation scenario', async () => {
    const inputs = {
      numberOfDrivers: 3,
      routeStartTime: '09:00',
      maxHoursPerDriver: 8
    };

    const result = await simulationEngine.runSimulation(inputs, 'test-user-id');
    
    expect(result).toBeDefined();
    expect(result.results).toBeDefined();
    expect(result.results.totalProfit).toBeDefined();
    expect(result.results.efficiencyScore).toBeDefined();
    expect(result.breakdown).toBeDefined();
  }, 10000); // Increase timeout

  test('should produce consistent results for same inputs', async () => {
    const inputs = {
      numberOfDrivers: 2,
      routeStartTime: '10:00',
      maxHoursPerDriver: 6
    };

    const result1 = await simulationEngine.runSimulation(inputs, 'test-user-id');
    const result2 = await simulationEngine.runSimulation(inputs, 'test-user-id');
    
    expect(result1.results.totalOrders).toBe(result2.results.totalOrders);
    expect(result1.results.driversUsed).toBe(result2.results.driversUsed);
  }, 10000); // Increase timeout
});