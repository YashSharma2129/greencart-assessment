const Order = require('../models/Order');
const SimulationResult = require('../models/SimulationResult');
const simulationEngine = require('../utils/simulationEngine');

// @desc    Run simulation with custom parameters
// @route   POST /api/simulation/run
// @access  Private (requires authentication)
const runSimulation = async (req, res) => {
  try {
    const { numberOfDrivers, routeStartTime, maxHoursPerDriver } = req.body;
    
    // Validate required fields
    if (!numberOfDrivers || !routeStartTime || !maxHoursPerDriver) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: numberOfDrivers, routeStartTime, maxHoursPerDriver'
      });
    }

    // Validate input ranges
    if (numberOfDrivers < 1 || numberOfDrivers > 50) {
      return res.status(400).json({
        success: false,
        message: 'Number of drivers must be between 1 and 50'
      });
    }

    if (maxHoursPerDriver < 1 || maxHoursPerDriver > 16) {
      return res.status(400).json({
        success: false,
        message: 'Max hours per driver must be between 1 and 16'
      });
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(routeStartTime)) {
      return res.status(400).json({
        success: false,
        message: 'Route start time must be in HH:MM format'
      });
    }

    // Run simulation
    const simulationResult = await simulationEngine.runSimulation(
      {
        numberOfDrivers: parseInt(numberOfDrivers),
        routeStartTime,
        maxHoursPerDriver: parseInt(maxHoursPerDriver)
      },
      req.user._id
    );

    res.status(201).json({
      success: true,
      message: 'Simulation completed successfully',
      data: simulationResult
    });

  } catch (error) {
    console.error('Simulation error:', error);
    
    if (error.message.includes('validation')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during simulation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all simulation results with pagination
// @route   GET /api/simulation/results
// @access  Private
const getSimulationResults = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const results = await SimulationResult.find()
      .populate('executedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SimulationResult.countDocuments();

    res.json({
      success: true,
      data: results,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get simulation results error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching simulation results'
    });
  }
};

// @desc    Get single simulation result by ID
// @route   GET /api/simulation/results/:id
// @access  Private
const getSimulationResult = async (req, res) => {
  try {
    const result = await SimulationResult.findById(req.params.id)
      .populate('executedBy', 'name email');
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Simulation result not found'
      });
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get simulation result error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid simulation result ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching simulation result'
    });
  }
};

// @desc    Get simulation result by simulation ID
// @route   GET /api/simulation/:simulationId
// @access  Private
const getSimulationBySimulationId = async (req, res) => {
  try {
    const result = await simulationEngine.getSimulationById(req.params.simulationId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Simulation not found'
      });
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get simulation by simulation ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching simulation'
    });
  }
};

// @desc    Get simulation history
// @route   GET /api/simulation/history
// @access  Private
const getSimulationHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const results = await simulationEngine.getSimulationHistory(limit);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Get simulation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching simulation history'
    });
  }
};

// @desc    Delete simulation result
// @route   DELETE /api/simulation/results/:id
// @access  Private (Admin only)
const deleteSimulationResult = async (req, res) => {
  try {
    const result = await SimulationResult.findById(req.params.id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Simulation result not found'
      });
    }

    // Check if user is admin or owns the simulation
    if (req.user.role !== 'admin' && result.executedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this simulation result'
      });
    }

    await SimulationResult.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Simulation result deleted successfully'
    });
  } catch (error) {
    console.error('Delete simulation result error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid simulation result ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting simulation result'
    });
  }
};

module.exports = {
  runSimulation,
  getSimulationResults,
  getSimulationResult,
  getSimulationBySimulationId,
  getSimulationHistory,
  deleteSimulationResult
};
