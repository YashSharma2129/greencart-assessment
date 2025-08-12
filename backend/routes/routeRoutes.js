const express = require('express');
const { createRoute, getRoutes, getRoute, updateRoute, deleteRoute } = require('../controllers/routeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router.post('/', createRoute);
router.get('/', getRoutes);
router.get('/:id', getRoute);
router.put('/:id', updateRoute);
router.delete('/:id', deleteRoute);

module.exports = router;
