const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GreenCart Logistics API',
      version: '1.0.0',
      description: 'A comprehensive logistics simulation API for Purple Merit Technologies assessment',
      contact: {
        name: 'API Support',
        email: 'yash.rathore2003@gmail.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://your-production-api.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'driver'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Driver: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            licenseNumber: { type: 'string' },
            phone: { type: 'string' },
            currentShiftHours: { type: 'number' },
            past7DaysHours: { type: 'number' },
            dailyHoursWorked: { type: 'number' },
            fatigueStatus: { type: 'boolean' },
            isAvailable: { type: 'boolean' }
          }
        },
        Route: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            routeId: { type: 'string' },
            routeName: { type: 'string' },
            startLocation: { type: 'string' },
            endLocation: { type: 'string' },
            distance: { type: 'number' },
            trafficLevel: { type: 'string', enum: ['Low', 'Medium', 'High'] },
            baseTime: { type: 'number' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            orderId: { type: 'string' },
            orderNumber: { type: 'string' },
            customerName: { type: 'string' },
            deliveryAddress: { type: 'string' },
            value: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'in-transit', 'delivered', 'late'] }
          }
        },
        SimulationInput: {
          type: 'object',
          required: ['numberOfDrivers', 'routeStartTime', 'maxHoursPerDriver'],
          properties: {
            numberOfDrivers: { type: 'integer', minimum: 1, maximum: 50 },
            routeStartTime: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
            maxHoursPerDriver: { type: 'integer', minimum: 1, maximum: 16 }
          }
        },
        SimulationResult: {
          type: 'object',
          properties: {
            simulationId: { type: 'string' },
            results: {
              type: 'object',
              properties: {
                totalProfit: { type: 'number' },
                efficiencyScore: { type: 'number' },
                totalOrders: { type: 'integer' },
                onTimeDeliveries: { type: 'integer' },
                lateDeliveries: { type: 'integer' },
                totalFuelCost: { type: 'number' },
                averageDeliveryTime: { type: 'number' }
              }
            },
            breakdown: {
              type: 'object',
              properties: {
                fuelCostByTraffic: {
                  type: 'object',
                  properties: {
                    low: { type: 'number' },
                    medium: { type: 'number' },
                    high: { type: 'number' }
                  }
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
