const Driver = require('../models/Driver');

// @desc    Create a new driver
// @route   POST /api/drivers
// @access  Public
const createDriver = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch (error) {
    console.error('Create driver error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'License number already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Public
const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate('assignedRoute');
    res.json(drivers);
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single driver
// @route   GET /api/drivers/:id
// @access  Public
const getDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).populate('assignedRoute');
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    res.json(driver);
  } catch (error) {
    console.error('Get driver error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Public
const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedRoute');
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    res.json(driver);
  } catch (error) {
    console.error('Update driver error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'License number already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
// @access  Public
const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    res.json({ message: 'Driver removed' });
  } catch (error) {
    console.error('Delete driver error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createDriver,
  getDrivers,
  getDriver,
  updateDriver,
  deleteDriver
};



