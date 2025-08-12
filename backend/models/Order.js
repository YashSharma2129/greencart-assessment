const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: [true, 'Order ID is required'],
    unique: true,
    trim: true
  },
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    trim: true
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  deliveryAddress: {
    type: String,
    required: [true, 'Delivery address is required'],
    trim: true
  },
  value: {
    type: Number,
    required: [true, 'Order value is required'],
    min: [0, 'Order value cannot be negative']
  },
  assignedRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },
  routeId: {
    type: String,
    trim: true
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  status: {
    type: String,
    enum: ['pending', 'in-transit', 'delivered', 'late'],
    default: 'pending'
  },
  deliveryTimestamp: {
    type: Date
  },
  actualDeliveryTime: {
    type: Number // in minutes
  },
  isOnTime: {
    type: Boolean,
    default: true
  },
  penalty: {
    type: Number,
    default: 0
  },
  bonus: {
    type: Number,
    default: 0
  },
  fuelCost: {
    type: Number,
    default: 0
  },
  profit: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
