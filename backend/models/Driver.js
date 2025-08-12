const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  assignedRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },
  currentShiftHours: {
    type: Number,
    default: 0,
    min: [0, 'Current shift hours cannot be negative']
  },
  past7DaysHours: {
    type: Number,
    default: 0,
    min: [0, 'Past 7 days hours cannot be negative']
  },
  dailyHoursWorked: {
    type: Number,
    default: 0,
    min: [0, 'Daily hours worked cannot be negative']
  },
  fatigueStatus: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Driver', driverSchema);
