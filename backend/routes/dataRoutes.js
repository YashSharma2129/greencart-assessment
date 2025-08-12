const express = require('express');
const { 
  initializeData,
  uploadCsvData,
  getDatabaseStats,
  clearAllData,
  upload
} = require('../controllers/dataController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All data routes require authentication
router.use(protect);

// Routes
router.post('/init', initializeData);
router.post('/upload/:type', upload.single('csvFile'), uploadCsvData);
router.get('/stats', getDatabaseStats);
router.delete('/clear', clearAllData);

module.exports = router;
