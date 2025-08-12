const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeId: {
    type: String,
    required: [true, 'Route ID is required'],
    unique: true,
    trim: true
  },
  routeName: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true
  },
  startLocation: {
    type: String,
    required: [true, 'Start location is required'],
    trim: true
  },
  endLocation: {
    type: String,
    required: [true, 'End location is required'],
    trim: true
  },
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0, 'Distance cannot be negative']
  },
  trafficLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
    required: true
  },
  baseTime: {
    type: Number,
    required: [true, 'Base time is required'],
    min: [0, 'Base time cannot be negative']
  },
  estimatedTime: {
    type: Number,
    min: [0, 'Estimated time cannot be negative']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Route', routeSchema);
