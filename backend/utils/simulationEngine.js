const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order');
const SimulationResult = require('../models/SimulationResult');
const { v4: uuidv4 } = require('uuid');

class SimulationEngine {
  constructor() {
    this.companyRules = {
      LATE_DELIVERY_PENALTY: 50, // ₹50 penalty per late delivery
      FATIGUE_THRESHOLD: 8, // 8 hours
      FATIGUE_SPEED_REDUCTION: 0.3, // 30% speed reduction
      HIGH_VALUE_THRESHOLD: 1000, // ₹1000
      HIGH_VALUE_BONUS_RATE: 0.1, // 10% bonus
      BASE_FUEL_COST: 5, // ₹5 per km
      HIGH_TRAFFIC_SURCHARGE: 2, // ₹2 per km extra for high traffic
      LATE_DELIVERY_THRESHOLD: 10 // 10 minutes grace period
    };
  }

  async runSimulation(params, userId) {
    try {
      const { numberOfDrivers, routeStartTime, maxHoursPerDriver } = params;
      this.validateInputs(params);

      const drivers = await this.getAvailableDrivers(numberOfDrivers);
      const routes = await Route.find();
      const orders = await Order.find({ status: 'pending' }).populate('assignedRoute');

      if (orders.length === 0) {
        throw new Error('No pending orders found for simulation');
      }

      const simulationId = uuidv4();
      const simulationData = {
        drivers: drivers.slice(0, numberOfDrivers),
        routes,
        orders,
        startTime: routeStartTime,
        maxHours: maxHoursPerDriver,
        results: {
          totalProfit: 0,
          totalOrders: orders.length,
          onTimeDeliveries: 0,
          lateDeliveries: 0,
          totalFuelCost: 0,
          totalPenalties: 0,
          totalBonuses: 0,
          averageDeliveryTime: 0,
          driversUsed: Math.min(numberOfDrivers, drivers.length)
        },
        breakdown: {
          fuelCostByTraffic: { low: 0, medium: 0, high: 0 },
          deliveryStatus: { onTime: 0, late: 0 }
        }
      };

      let totalDeliveryTime = 0;
      const processedOrders = [];

      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const driverIndex = i % simulationData.drivers.length;
        const assignedDriver = simulationData.drivers[driverIndex];
        const route = order.assignedRoute;

        if (!route) {
          console.warn(`Order ${order.orderId} has no assigned route, skipping`);
          continue;
        }

        const deliveryResult = this.calculateDeliveryMetrics(
          order,
          route,
          assignedDriver,
          simulationData.maxHours
        );

        const orderResult = this.applyCompanyRules(order, route, deliveryResult);
        
        this.updateSimulationResults(simulationData, orderResult);
        
        totalDeliveryTime += orderResult.deliveryTime;
        processedOrders.push({
          ...order.toObject(),
          ...orderResult
        });
      }

      simulationData.results.averageDeliveryTime = 
        processedOrders.length > 0 ? totalDeliveryTime / processedOrders.length : 0;
      
      simulationData.results.efficiencyScore = this.calculateEfficiencyScore(simulationData);

      const simulationResult = await this.saveSimulationResult(
        simulationId,
        params,
        simulationData.results,
        simulationData.breakdown,
        userId
      );

      return {
        simulationId,
        results: simulationData.results,
        breakdown: simulationData.breakdown,
        processedOrders,
        savedResult: simulationResult
      };

    } catch (error) {
      console.error('Simulation error:', error);
      throw error;
    }
  }

  validateInputs(params) {
    const { numberOfDrivers, routeStartTime, maxHoursPerDriver } = params;
    
    if (!numberOfDrivers || numberOfDrivers < 1) {
      throw new Error('Number of drivers must be at least 1');
    }
    
    if (numberOfDrivers > 50) {
      throw new Error('Number of drivers cannot exceed 50');
    }

    if (!routeStartTime || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(routeStartTime)) {
      throw new Error('Route start time must be in HH:MM format');
    }

    if (!maxHoursPerDriver || maxHoursPerDriver < 1 || maxHoursPerDriver > 16) {
      throw new Error('Max hours per driver must be between 1 and 16');
    }
  }

  async getAvailableDrivers(count) {
    const drivers = await Driver.find({ isAvailable: true })
      .sort({ dailyHoursWorked: 1 }) // Prioritize drivers with fewer hours
      .limit(count * 2); // Get more than needed in case some aren't suitable
    
    if (drivers.length === 0) {
      throw new Error('No available drivers found');
    }

    return drivers;
  }

  calculateDeliveryMetrics(order, route, driver, maxHours) {
    let baseDeliveryTime = route.baseTime;
    
    if (driver.dailyHoursWorked > this.companyRules.FATIGUE_THRESHOLD) {
      baseDeliveryTime *= (1 + this.companyRules.FATIGUE_SPEED_REDUCTION);
      driver.fatigueStatus = true;
    }

    if (route.trafficLevel === 'High') {
      baseDeliveryTime *= 1.3; // 30% longer in high traffic
    } else if (route.trafficLevel === 'Medium') {
      baseDeliveryTime *= 1.15; // 15% longer in medium traffic
    }

    const deliveryTime = Math.round(baseDeliveryTime);
    const expectedTime = route.baseTime + this.companyRules.LATE_DELIVERY_THRESHOLD;
    const isOnTime = deliveryTime <= expectedTime;

    return {
      deliveryTime,
      isOnTime,
      expectedTime,
      actualTime: deliveryTime
    };
  }

  applyCompanyRules(order, route, deliveryResult) {
    let penalty = 0;
    let bonus = 0;
    let fuelCost = 0;

    if (!deliveryResult.isOnTime) {
      penalty = this.companyRules.LATE_DELIVERY_PENALTY;
    }
    if (order.value > this.companyRules.HIGH_VALUE_THRESHOLD && deliveryResult.isOnTime) {
      bonus = order.value * this.companyRules.HIGH_VALUE_BONUS_RATE;
    }

    fuelCost = route.distance * this.companyRules.BASE_FUEL_COST;
    if (route.trafficLevel === 'High') {
      fuelCost += route.distance * this.companyRules.HIGH_TRAFFIC_SURCHARGE;
    }

    const profit = order.value + bonus - penalty - fuelCost;

    return {
      ...deliveryResult,
      penalty,
      bonus,
      fuelCost,
      profit,
      trafficLevel: route.trafficLevel
    };
  }

  updateSimulationResults(simulationData, orderResult) {
    const { results, breakdown } = simulationData;

    results.totalProfit += orderResult.profit;
    results.totalFuelCost += orderResult.fuelCost;
    results.totalPenalties += orderResult.penalty;
    results.totalBonuses += orderResult.bonus;

    if (orderResult.isOnTime) {
      results.onTimeDeliveries++;
      breakdown.deliveryStatus.onTime++;
    } else {
      results.lateDeliveries++;
      breakdown.deliveryStatus.late++;
    }

    const trafficKey = orderResult.trafficLevel.toLowerCase();
    if (breakdown.fuelCostByTraffic[trafficKey] !== undefined) {
      breakdown.fuelCostByTraffic[trafficKey] += orderResult.fuelCost;
    }
  }

  calculateEfficiencyScore(simulationData) {
    const { totalOrders, onTimeDeliveries } = simulationData.results;
    if (totalOrders === 0) return 0;
    return Math.round((onTimeDeliveries / totalOrders) * 100);
  }

  async saveSimulationResult(simulationId, inputParams, results, breakdown, userId) {
    const simulationResult = new SimulationResult({
      simulationId,
      inputParameters: inputParams,
      results,
      breakdown,
      executedBy: userId,
      notes: `Simulation executed with ${inputParams.numberOfDrivers} drivers`
    });

    return await simulationResult.save();
  }

  async getSimulationHistory(limit = 10) {
    return await SimulationResult.find()
      .populate('executedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getSimulationById(simulationId) {
    return await SimulationResult.findOne({ simulationId })
      .populate('executedBy', 'name email');
  }
}

module.exports = new SimulationEngine();
