const express = require('express');
const { 
  runSimulation, 
  getSimulationResults, 
  getSimulationResult,
  getSimulationBySimulationId,
  getSimulationHistory,
  deleteSimulationResult
} = require('../controllers/simulationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All simulation routes require authentication
router.use(protect);

// Routes
router.post('/run', runSimulation);
router.get('/results', getSimulationResults);
router.get('/results/:id', getSimulationResult);
router.get('/history', getSimulationHistory);
router.get('/:simulationId', getSimulationBySimulationId);
router.delete('/results/:id', deleteSimulationResult);

module.exports = router;
