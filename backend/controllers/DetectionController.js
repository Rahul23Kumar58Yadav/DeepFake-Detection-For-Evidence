const Detection = require('../models/Detection');

// Helper: Send error
const sendError = (res, status, message) => res.status(status).json({ error: message });

// Get user's detection history
const getDetectionHistory = async (req, res) => {
  try {
    const detections = await Detection.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const formatted = detections.map(d => ({
      id: d._id,
      fileName: d.fileName,
      type: d.fileType,
      result: d.result.toLowerCase(), // REAL → authentic
      confidence: d.confidence,
      timestamp: d.createdAt,
      createdAt: d.createdAt,
      fileSize: d.fileSize ? `${(d.fileSize / (1024*1024)).toFixed(2)} MB` : 'N/A',
      userId: d.userId,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};
// Get single detection
const getDetection = async (req, res) => {
  try {
    const detection = await Detection.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!detection) {
      return sendError(res, 404, 'Detection not found');
    }

    res.json({
      id: detection._id,
      fileName: detection.fileName,
      type: detection.fileType,
      result: detection.result.toLowerCase(),
      confidence: detection.confidence,
      timestamp: detection.createdAt,
      fileSize: detection.fileSize,
      analysisDetails: detection.analysisDetails,
    });
  } catch (error) {
    console.error('Get detection error:', error);
    sendError(res, 500, 'Failed to fetch detection');
  }
};

// Create new detection
const createDetection = async (req, res) => {
  try {
    // Support both JSON and FormData
    const body = req.body;

    const fileName = body.fileName || req.file?.originalname;
    const fileType = body.fileType || 'video';
    const fileSize = body.fileSize ? parseInt(body.fileSize) : req.file?.size;
    const result = body.result?.toUpperCase();
    const confidence = parseFloat(body.confidence);
    let analysisDetails = body.analysisDetails;

    if (!fileName || !fileType || !result || isNaN(confidence)) {
      return sendError(res, 400, 'Missing required fields');
    }

    if (typeof analysisDetails === 'string') {
      try {
        analysisDetails = JSON.parse(analysisDetails);
      } catch {
        analysisDetails = {};
      }
    }

    const detection = new Detection({
      userId: req.user._id,
      fileName,
      fileType,
      fileSize,
      result,
      confidence,
      analysisDetails: analysisDetails || {},
    });

    await detection.save();

    res.status(201).json({
      message: 'Detection saved',
      detection: {
        id: detection._id,
        fileName,
        type: fileType,
        result: result.toLowerCase(),
        confidence,
        timestamp: detection.createdAt,
      },
    });
  } catch (error) {
    console.error('Create detection error:', error);
    sendError(res, 500, 'Failed to save detection');
  }
};

// Delete detection
const deleteDetection = async (req, res) => {
  try {
    const detection = await Detection.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!detection) {
      return sendError(res, 404, 'Detection not found');
    }

    await Detection.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'Detection deleted successfully',
      success: true 
    });
  } catch (error) {
    console.error('Delete detection error:', error);
    sendError(res, 500, 'Failed to delete detection');
  }
};

const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone || '',
    location: req.user.location || '',
    createdAt: req.user.createdAt,
    lastLogin: req.user.lastLogin,
    joinDate: req.user.createdAt,
  });
};

const getDetectionReport = async (req, res) => {
  try {
    const detection = await Detection.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!detection) {
      return sendError(res, 404, 'Detection not found');
    }

    res.json({
      fileName: detection.fileName,
      fileType: detection.fileType,
      result: detection.result.toLowerCase(),
      confidence: detection.confidence,
      timestamp: detection.createdAt,
      analysisDetails: detection.analysisDetails,
      user: {
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    console.error('Report generation error:', error);
    sendError(res, 500, 'Failed to generate report');
  }
};

module.exports = {
  getDetectionHistory,
  getDetection,
  createDetection,
  deleteDetection,
  getDetectionReport,
  getMe,
};