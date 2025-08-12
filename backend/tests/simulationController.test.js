// Mock the database connection before requiring server
jest.mock('../config/db', () => jest.fn().mockResolvedValue(true));

// Mock mongoose completely before any imports
jest.mock('mongoose', () => {
  const mockObjectId = jest.fn().mockImplementation(() => ({
    toString: () => '507f1f77bcf86cd799439011'
  }));
  
  const mockSchema = function(schemaDefinition, options) {
    this.pre = jest.fn();
    this.methods = {};
    this.statics = {};
    return this;
  };
  
  // Add Types to Schema for model definitions
  mockSchema.Types = {
    ObjectId: mockObjectId
  };
  
  const mockModel = jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({}),
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
  }));
  
  return {
    Schema: mockSchema,
    model: jest.fn().mockReturnValue(mockModel),
    Types: {
      ObjectId: mockObjectId
    },
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn().mockResolvedValue(true),
    connection: {
      close: jest.fn().mockResolvedValue(true),
      readyState: 1
    }
  };
});

// Mock the User model
jest.mock('../models/User', () => {
  return {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
  };
});

const request = require('supertest');
const app = require('../server');
const simulationEngine = require('../utils/simulationEngine');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// Mock the simulation engine
jest.mock('../utils/simulationEngine');

// Mock JWT for authentication
jest.mock('jsonwebtoken');

describe('Simulation Controller', () => {
  let authToken;
  let mockUserId;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Generate valid MongoDB ObjectId for testing
    mockUserId = { toString: () => '507f1f77bcf86cd799439011' };
    
    // Mock JWT verification
    authToken = 'mock-token';
    jwt.verify.mockReturnValue({ 
      userId: mockUserId.toString(), 
      email: 'test@example.com' 
    });

    // Mock User.findById with chaining .select() method
    const mockUser = {
      _id: mockUserId,
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin'
    };
    
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });
  });

  afterAll(async () => {
    // Clean up any open handles
    jest.clearAllTimers();
    if (mongoose.connection && mongoose.connection.close) {
      await mongoose.connection.close();
    }
  });

  describe('POST /api/simulation/run', () => {
    test('should run simulation successfully with valid inputs', async () => {
      const mockResult = {
        simulationId: 'test-id',
        results: {
          totalProfit: 5000,
          efficiencyScore: 85,
          totalOrders: 10,
          onTimeDeliveries: 8,
          lateDeliveries: 2
        }
      };

      simulationEngine.runSimulation.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/simulation/run')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          numberOfDrivers: 5,
          routeStartTime: '09:00',
          maxHoursPerDriver: 8
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResult);
    });

    test('should return error for missing parameters', async () => {
      const response = await request(app)
        .post('/api/simulation/run')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          numberOfDrivers: 5
          // Missing routeStartTime and maxHoursPerDriver
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing required parameters');
    });

    test('should return error for invalid driver count', async () => {
      const response = await request(app)
        .post('/api/simulation/run')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          numberOfDrivers: 51, // Above the max limit of 50
          routeStartTime: '09:00',
          maxHoursPerDriver: 8
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Number of drivers must be between 1 and 50');
    });

    test('should return error for invalid time format', async () => {
      const response = await request(app)
        .post('/api/simulation/run')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          numberOfDrivers: 5,
          routeStartTime: '25:00',
          maxHoursPerDriver: 8
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Route start time must be in HH:MM format');
    });

    test('should handle simulation engine errors', async () => {
      simulationEngine.runSimulation.mockRejectedValue(new Error('No available drivers'));

      const response = await request(app)
        .post('/api/simulation/run')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          numberOfDrivers: 5,
          routeStartTime: '09:00',
          maxHoursPerDriver: 8
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});
