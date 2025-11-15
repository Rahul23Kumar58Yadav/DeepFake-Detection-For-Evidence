const express = require('express');
const router = express.Router();
const detectionController = require('../controllers/DetectionController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.get('/', auth, detectionController.getDetectionHistory); // Add this for /api/analyses
router.get('/history', auth, detectionController.getDetectionHistory);
router.get('/:id', auth, detectionController.getDetection);
router.post('/', auth, detectionController.createDetection);
router.delete('/:id', auth, detectionController.deleteDetection);
router.get('/:id/report', auth, detectionController.getDetectionReport);

module.exports = router;