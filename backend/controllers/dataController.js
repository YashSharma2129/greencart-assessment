const { loadInitialData, createSampleData } = require('../utils/csvLoader');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname) === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// @desc    Initialize database with sample data
// @route   POST /api/data/init
// @access  Private (Admin only)
const initializeData = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const result = await createSampleData();
    
    res.status(201).json({
      success: true,
      message: 'Database initialized with sample data',
      data: result
    });

  } catch (error) {
    console.error('Initialize data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Upload CSV data
// @route   POST /api/data/upload/:type
// @access  Private (Admin only)
const uploadCsvData = async (req, res) => {
  try {
    const { type } = req.params;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    let Model;
    let dataType;

    switch (type) {
      case 'drivers':
        Model = Driver;
        dataType = 'drivers';
        break;
      case 'routes':
        Model = Route;
        dataType = 'routes';
        break;
      case 'orders':
        Model = Order;
        dataType = 'orders';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid data type. Supported types: drivers, routes, orders'
        });
    }

    const result = await loadInitialData(req.file.path, Model, dataType);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        type: dataType,
        count: result.count
      }
    });

  } catch (error) {
    console.error('Upload CSV data error:', error);
    
    // Clean up file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading CSV data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get database statistics
// @route   GET /api/data/stats
// @access  Private
const getDatabaseStats = async (req, res) => {
  try {
    const [driverCount, routeCount, orderCount] = await Promise.all([
      Driver.countDocuments(),
      Route.countDocuments(),
      Order.countDocuments()
    ]);

    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const routeStats = await Route.aggregate([
      {
        $group: {
          _id: '$trafficLevel',
          count: { $sum: 1 },
          avgDistance: { $avg: '$distance' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totals: {
          drivers: driverCount,
          routes: routeCount,
          orders: orderCount
        },
        ordersByStatus: orderStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        routesByTraffic: routeStats.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            avgDistance: Math.round(stat.avgDistance * 100) / 100
          };
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Get database stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching database statistics'
    });
  }
};

// @desc    Clear all data
// @route   DELETE /api/data/clear
// @access  Private (Admin only)
const clearAllData = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Clear all collections
    await Promise.all([
      Driver.deleteMany({}),
      Route.deleteMany({}),
      Order.deleteMany({})
    ]);

    res.json({
      success: true,
      message: 'All data cleared successfully'
    });

  } catch (error) {
    console.error('Clear all data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing data'
    });
  }
};

// Clear specific data type
const clearSpecificData = async (req, res) => {
  try {
    const { type } = req.params;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    let Model;
    switch (type) {
      case 'drivers':
        Model = require('../models/Driver');
        break;
      case 'routes':
        Model = require('../models/Route');
        break;
      case 'orders':
        Model = require('../models/Order');
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid data type. Use: drivers, routes, or orders'
        });
    }

    const deletedCount = await Model.countDocuments();
    await Model.deleteMany({});
    
    res.json({
      success: true,
      message: `Cleared ${deletedCount} ${type} records`,
      deletedCount
    });

  } catch (error) {
    console.error('Clear specific data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  initializeData,
  uploadCsvData,
  getDatabaseStats,
  clearAllData,
  clearSpecificData,
  upload
};
