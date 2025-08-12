const express = require('express');
const { createDriver, getDrivers, getDriver, updateDriver, deleteDriver } = require('../controllers/driverController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router.post('/', createDriver);
router.get('/', getDrivers);
router.get('/:id', getDriver);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);

module.exports = router;
