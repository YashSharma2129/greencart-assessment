const mongoose = require('mongoose');

const simulationResultSchema = new mongoose.Schema({
  simulationId: {
    type: String,
    required: true,
    unique: true
  },
  inputParameters: {
    numberOfDrivers: {
      type: Number,
      required: true
    },
    routeStartTime: {
      type: String,
      required: true
    },
    maxHoursPerDriver: {
      type: Number,
      required: true
    }
  },
  results: {
    totalProfit: {
      type: Number,
      default: 0
    },
    efficiencyScore: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    onTimeDeliveries: {
      type: Number,
      default: 0
    },
    lateDeliveries: {
      type: Number,
      default: 0
    },
    totalFuelCost: {
      type: Number,
      default: 0
    },
    totalPenalties: {
      type: Number,
      default: 0
    },
    totalBonuses: {
      type: Number,
      default: 0
    },
    averageDeliveryTime: {
      type: Number,
      default: 0
    },
    driversUsed: {
      type: Number,
      default: 0
    }
  },
  breakdown: {
    fuelCostByTraffic: {
      low: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      high: { type: Number, default: 0 }
    },
    deliveryStatus: {
      onTime: { type: Number, default: 0 },
      late: { type: Number, default: 0 }
    }
  },
  simulationDate: {
    type: Date,
    default: Date.now
  },
  executedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SimulationResult', simulationResultSchema);
