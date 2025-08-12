const simulationEngine = require('../utils/simulationEngine');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order');
const SimulationResult = require('../models/SimulationResult');

jest.mock('../models/Driver');
jest.mock('../models/Route');
jest.mock('../models/Order');
jest.mock('../models/SimulationResult');

describe('SimulationEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateInputs', () => {
    test('should validate correct inputs', () => {
      const validInputs = {
        numberOfDrivers: 5,
        routeStartTime: '09:00',
        maxHoursPerDriver: 8
      };

      expect(() => {
        simulationEngine.validateInputs(validInputs);
      }).not.toThrow();
    });

    test('should throw error for invalid number of drivers', () => {
      const invalidInputs = {
        numberOfDrivers: 0,
        routeStartTime: '09:00',
        maxHoursPerDriver: 8
      };

      expect(() => {
        simulationEngine.validateInputs(invalidInputs);
      }).toThrow('Number of drivers must be at least 1');
    });

    test('should throw error for invalid time format', () => {
      const invalidInputs = {
        numberOfDrivers: 5,
        routeStartTime: '25:00',
        maxHoursPerDriver: 8
      };

      expect(() => {
        simulationEngine.validateInputs(invalidInputs);
      }).toThrow('Route start time must be in HH:MM format');
    });

    test('should throw error for invalid max hours', () => {
      const invalidInputs = {
        numberOfDrivers: 5,
        routeStartTime: '09:00',
        maxHoursPerDriver: 20
      };

      expect(() => {
        simulationEngine.validateInputs(invalidInputs);
      }).toThrow('Max hours per driver must be between 1 and 16');
    });
  });

  describe('calculateDeliveryMetrics', () => {
    test('should calculate delivery metrics correctly for normal conditions', () => {
      const order = { value: 800 };
      const route = { baseTime: 60, trafficLevel: 'Low' };
      const driver = { dailyHoursWorked: 5, fatigueStatus: false };
      const maxHours = 8;

      const result = simulationEngine.calculateDeliveryMetrics(order, route, driver, maxHours);

      expect(result.deliveryTime).toBe(60);
      expect(result.isOnTime).toBe(true);
      expect(result.expectedTime).toBe(70); // baseTime + 10 minutes grace
    });

    test('should apply fatigue penalty correctly', () => {
      const order = { value: 800 };
      const route = { baseTime: 60, trafficLevel: 'Low' };
      const driver = { dailyHoursWorked: 10, fatigueStatus: false }; // Over 8 hours
      const maxHours = 8;

      const result = simulationEngine.calculateDeliveryMetrics(order, route, driver, maxHours);

      expect(result.deliveryTime).toBe(78); // 60 * 1.3 (fatigue penalty)
      expect(driver.fatigueStatus).toBe(true);
    });

    test('should apply traffic delay for high traffic', () => {
      const order = { value: 800 };
      const route = { baseTime: 60, trafficLevel: 'High' };
      const driver = { dailyHoursWorked: 5, fatigueStatus: false };
      const maxHours = 8;

      const result = simulationEngine.calculateDeliveryMetrics(order, route, driver, maxHours);

      expect(result.deliveryTime).toBe(78); // 60 * 1.3 (high traffic)
    });
  });

  describe('applyCompanyRules', () => {
    test('should apply late delivery penalty', () => {
      const order = { value: 800 };
      const route = { distance: 10, trafficLevel: 'Low' };
      const deliveryResult = { isOnTime: false, deliveryTime: 80 };

      const result = simulationEngine.applyCompanyRules(order, route, deliveryResult);

      expect(result.penalty).toBe(50); // Late delivery penalty
      expect(result.bonus).toBe(0); // No bonus for late delivery
    });

    test('should apply high-value bonus for on-time high-value orders', () => {
      const order = { value: 1500 }; // Above ₹1000 threshold
      const route = { distance: 10, trafficLevel: 'Low' };
      const deliveryResult = { isOnTime: true, deliveryTime: 50 };

      const result = simulationEngine.applyCompanyRules(order, route, deliveryResult);

      expect(result.penalty).toBe(0);
      expect(result.bonus).toBe(150); // 10% of 1500
    });

    test('should calculate fuel cost with high traffic surcharge', () => {
      const order = { value: 800 };
      const route = { distance: 10, trafficLevel: 'High' };
      const deliveryResult = { isOnTime: true, deliveryTime: 50 };

      const result = simulationEngine.applyCompanyRules(order, route, deliveryResult);

      expect(result.fuelCost).toBe(70); // (5 + 2) * 10 = 70
    });

    test('should calculate profit correctly', () => {
      const order = { value: 1200 }; // Above threshold
      const route = { distance: 5, trafficLevel: 'Low' };
      const deliveryResult = { isOnTime: true, deliveryTime: 40 };

      const result = simulationEngine.applyCompanyRules(order, route, deliveryResult);

      const expectedProfit = 1200 + 120 - 0 - 25; // value + bonus - penalty - fuelCost
      expect(result.profit).toBe(expectedProfit);
    });
  });

  describe('calculateEfficiencyScore', () => {
    test('should calculate efficiency score correctly', () => {
      const simulationData = {
        results: {
          totalOrders: 10,
          onTimeDeliveries: 8
        }
      };

      const efficiency = simulationEngine.calculateEfficiencyScore(simulationData);

      expect(efficiency).toBe(80); // (8/10) * 100
    });

    test('should return 0 for no orders', () => {
      const simulationData = {
        results: {
          totalOrders: 0,
          onTimeDeliveries: 0
        }
      };

      const efficiency = simulationEngine.calculateEfficiencyScore(simulationData);

      expect(efficiency).toBe(0);
    });
  });
});
