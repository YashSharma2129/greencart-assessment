const Route = require('../models/Route');

// @desc    Create a new route
// @route   POST /api/routes
// @access  Public
const createRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json(route);
  } catch (error) {
    console.error('Create route error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single route
// @route   GET /api/routes/:id
// @access  Public
const getRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    res.json(route);
  } catch (error) {
    console.error('Get route error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update route
// @route   PUT /api/routes/:id
// @access  Public
const updateRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    res.json(route);
  } catch (error) {
    console.error('Update route error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete route
// @route   DELETE /api/routes/:id
// @access  Public
const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    res.json({ message: 'Route removed' });
  } catch (error) {
    console.error('Delete route error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createRoute,
  getRoutes,
  getRoute,
  updateRoute,
  deleteRoute
};



