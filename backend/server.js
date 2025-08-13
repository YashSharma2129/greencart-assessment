const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware (development mode)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Import routes
const authRoutes = require('./routes/authRoutes');
const driverRoutes = require('./routes/driverRoutes');
const routeRoutes = require('./routes/routeRoutes');
const orderRoutes = require('./routes/orderRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const dataRoutes = require('./routes/dataRoutes');

// Base route
app.get('/', (req, res) => {
  res.json({ message: "API is running" });
});

// Health check endpoint for Docker
app.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  
  if (mongoose.connection.readyState === 1) {
    res.status(200).json(healthCheck);
  } else {
    res.status(503).json({
      ...healthCheck,
      message: 'Service Unavailable - Database not connected'
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/data', dataRoutes);

// Import error middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Get port from environment variables
const PORT = process.env.PORT || 5000;

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export app for testing purposes
module.exports = app;
