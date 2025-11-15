const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// ENVIRONMENT VALIDATION
// ============================================
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "CLIENT_URL"];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("❌ FATAL: Missing required environment variables:");
  missingVars.forEach((varName) => console.error(`   - ${varName}`));
  console.error("\nPlease create a .env file with:");
  console.error("MONGODB_URI=mongodb://localhost:27017/deepguard");
  console.error("JWT_SECRET=your-secret-key-here");
  console.error("CLIENT_URL=http://localhost:3000");
  process.exit(1);
}

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        process.env.CLIENT_URL,
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// ============================================
// RATE LIMITING
// ============================================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  skipSuccessfulRequests: true,
});

const profileLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { error: "Too many profile requests, please try again later." },
});

const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: { error: "Analysis limit reached. Please try again later." },
});

app.use("/api/", apiLimiter);

// ============================================
// MONGODB CONNECTION
// ============================================
const MONGODB_URI = process.env.MONGODB_URI;
let mongoConnected = false;

const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log("✅ MongoDB Connected Successfully");
      mongoConnected = true;
      return;
    } catch (err) {
      console.error(
        `❌ MongoDB Connection Attempt ${i + 1} Failed:`,
        err.message
      );
      if (i < retries - 1) {
        console.log(`⏳ Retrying in 5 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }
  console.error("❌ MongoDB Connection Failed After All Retries");
  mongoConnected = false;
  process.exit(1);
};

connectDB();

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB Disconnected. Attempting to reconnect...");
  mongoConnected = false;
  connectDB();
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB Error:", err);
  mongoConnected = false;
});

mongoose.connection.on("connected", () => {
  mongoConnected = true;
});

// ============================================
// MONGOOSE SCHEMAS
// ============================================
const videoAnalysisSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileType: { type: String, default: "video" },
    uploadDate: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verdict: {
      classification: { type: String, enum: ["REAL", "FAKE", "UNCERTAIN"] },
      confidence: Number,
      reliability: {
        type: String,
        enum: ["VERY HIGH", "HIGH", "MEDIUM", "LOW"],
      },
    },
    statistics: {
      frames_analyzed: Number,
      faces_detected: Number,
      total_faces: Number,
      average_fake_score: Number,
      average_real_score: Number,
      temporal_consistency: Number,
      temporal_variance: Number,
      rapid_changes: Number,
    },
    suspicious_frames: [
      {
        frame_number: Number,
        timestamp: Number,
        fake_score: Number,
        reason: String,
      },
    ],
    technical_info: {
      device: String,
      model_name: String,
      fps: Number,
      sample_rate: Number,
      face_detector: String,
      torch_version: String,
    },
    processing_time: Number,
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    error: String,
    warnings: [String],
    ipAddress: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const audioAnalysisSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileType: { type: String, default: "audio" },
    uploadDate: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    result: {
      prediction: { type: String, enum: ["REAL", "FAKE", "UNCERTAIN"] },
      confidence: Number,
      details: mongoose.Schema.Types.Mixed,
    },
    processing_time: Number,
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    error: String,
    ipAddress: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

videoAnalysisSchema.index({ uploadDate: -1, fileType: 1 });
videoAnalysisSchema.index({ status: 1 });
videoAnalysisSchema.index({ "verdict.classification": 1 });
videoAnalysisSchema.index({ userId: 1, createdAt: -1 });
videoAnalysisSchema.index({ createdAt: -1 });

audioAnalysisSchema.index({ uploadDate: -1, fileType: 1 });
audioAnalysisSchema.index({ status: 1 });
audioAnalysisSchema.index({ "result.prediction": 1 });
audioAnalysisSchema.index({ userId: 1, createdAt: -1 });
audioAnalysisSchema.index({ createdAt: -1 });

const VideoAnalysis = mongoose.model("VideoAnalysis", videoAnalysisSchema);
const AudioAnalysis = mongoose.model("AudioAnalysis", audioAnalysisSchema);
const Detection = mongoose.model(
  "Detection",
  require("./models/Detection").schema
);

// ============================================
// DIRECTORIES SETUP
// ============================================
const UPLOAD_DIR = path.join(__dirname, "uploads");
const TEMP_DIR = path.join(__dirname, "temp");
const AUDIO_UPLOAD_DIR = path.join(__dirname, "uploads", "audio");
const VIDEO_UPLOAD_DIR = path.join(__dirname, "..", "uploads", "video");

[UPLOAD_DIR, TEMP_DIR, AUDIO_UPLOAD_DIR, VIDEO_UPLOAD_DIR].forEach((dir) => {
  if (!fsSync.existsSync(dir)) {
    fsSync.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// ============================================
// PYTHON PATH DETECTION - UNIFIED
// ============================================

// Export / use it
function findVideoDetectorScript() {
  const p = path.join(
    __dirname,

    "AudioVideo",
    "python-detector",
    "detector.py"
  );
  return fsSync.existsSync(p) ? p : null;
}

function findAudioDetectorScript() {
  const p = path.join(
    __dirname,

    "AudioVideo",
    "python-api",
    "audio_detector.py"
  );
  return fsSync.existsSync(p) ? p : null;
}

function getPythonPath() {
  const possible = [
    // Video detector venv
    path.join(
      __dirname,
      "..",
      "AudioVideo",
      "python-detector",
      "venv",
      "Scripts",
      "python.exe"
    ), // Win
    path.join(
      __dirname,
      "..",
      "AudioVideo",
      "python-detector",
      "venv",
      "bin",
      "python"
    ), // *nix
    path.join(
      __dirname,
      "..",
      "AudioVideo",
      "python-detector",
      "venv",
      "bin",
      "python3"
    ), // *nix

    // Audio API venv (optional fallback)
    path.join(
      __dirname,
      "..",
      "AudioVideo",
      "python-api",
      "venv",
      "Scripts",
      "python.exe"
    ),
    path.join(
      __dirname,
      "..",
      "AudioVideo",
      "python-api",
      "venv",
      "bin",
      "python"
    ),
    path.join(
      __dirname,
      "..",
      "AudioVideo",
      "python-api",
      "venv",
      "bin",
      "python3"
    ),

    // System Python
    "python",
    "python3",
  ];

  console.log("Searching for Python executable...");
  for (const p of possible) {
    if (p.includes(path.sep) && fsSync.existsSync(p)) {
      console.log(`   FOUND: ${p}`);
      return p;
    }
    if (!p.includes(path.sep)) {
      console.log(`   Using system: ${p}`);
      return p;
    }
  }
  const fallback = process.platform === "win32" ? "python" : "python3";
  console.log(`   Fallback: ${fallback}`);
  return fallback;
}

const PYTHON_PATH = getPythonPath();
const PYTHON_VIDEO_SCRIPT = findVideoDetectorScript();
const PYTHON_AUDIO_SCRIPT = findAudioDetectorScript();

console.log("\n" + "=".repeat(80));
console.log("PYTHON ENVIRONMENT CONFIGURATION");
console.log("=".repeat(80));
console.log(`Server dir : ${__dirname}`);
console.log(`Python exe : ${PYTHON_PATH}`);
console.log(`Video script: ${PYTHON_VIDEO_SCRIPT || "NOT FOUND"}`);
console.log(`Audio script: ${PYTHON_AUDIO_SCRIPT || "NOT FOUND"}`);
console.log("=".repeat(80) + "\n");

if (!PYTHON_VIDEO_SCRIPT) {
  console.error("CRITICAL: Video detection will NOT work!");
  console.error(
    "   → detector.py must be in: FINAL PROJECT 5/AudioVideo/python-detector/"
  );
}
if (!PYTHON_AUDIO_SCRIPT) {
  console.warn("WARNING: Audio detection will NOT work!");
  console.warn(
    "   → audio_detector.py must be in: FINAL PROJECT 5/AudioVideo/python-api/"
  );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
const cleanupOldFiles = async () => {
  try {
    const dirs = [AUDIO_UPLOAD_DIR, VIDEO_UPLOAD_DIR];
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000;

    for (const dir of dirs) {
      const files = await fs.readdir(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtimeMs > maxAge) {
          await fs.unlink(filePath);
          console.log(`🗑️ Deleted old file: ${file}`);
        }
      }
    }
  } catch (error) {
    console.error("❌ Cleanup error:", error);
  }
};

setInterval(cleanupOldFiles, 60 * 60 * 1000);

const getClientIP = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    "unknown"
  );
};

// ============================================
// VIDEO ANALYSIS WITH PYTHON - IMPROVED
// ============================================
function analyzeVideoWithPython(
  videoPath,
  options = {},
  progressCallback = null
) {
  return new Promise((resolve, reject) => {
    const maxFrames = options.maxFrames || 30;
    const sampleRate = options.sampleRate || 2;

    console.log("\nVideo Analysis Starting");
    console.log(`Path: ${videoPath}`);
    console.log(`Frames: ${maxFrames}, Rate: ${sampleRate}`);

    // Validate inputs
    if (!fsSync.existsSync(videoPath)) {
      return reject({ error: "Video file not found", path: videoPath });
    }

    if (!PYTHON_VIDEO_SCRIPT || !fsSync.existsSync(PYTHON_VIDEO_SCRIPT)) {
      return reject({
        error: "detector.py not found",
        path: PYTHON_VIDEO_SCRIPT,
      });
    }

    const args = [
      PYTHON_VIDEO_SCRIPT,
      videoPath,
      maxFrames.toString(),
      sampleRate.toString(),
    ];

    console.log("Executing:", PYTHON_PATH);
    console.log("Args:", args);

    const isWindows = process.platform === "win32";
    const useShell = isWindows && PYTHON_PATH.includes(path.sep);

    const pythonProcess = spawn(PYTHON_PATH, args, {
      env: {
        ...process.env,
        PYTHONUNBUFFERED: "1",
        PYTHONIOENCODING: "utf-8",
        PYTHONDONTWRITEBYTECODE: "1",
      },
      cwd: path.dirname(PYTHON_VIDEO_SCRIPT),
      shell: useShell,
      windowsHide: true,
    });

    // === BUFFERS ===
    let stdoutBuffer = "";
    let stderrBuffer = "";
    let finalJsonBuffer = "";
    let hasFinalMarker = false;
    let hasStarted = false;
    let lastProgressUpdate = Date.now();

    pythonProcess.stdout.setEncoding("utf8");
    pythonProcess.stderr.setEncoding("utf8");

    // === STDOUT: Handle progress + FINAL_RESULTS ===
    pythonProcess.stdout.on("data", (chunk) => {
      const data = chunk.toString();

      // 1. Detect FINAL_RESULTS: marker
      if (!hasFinalMarker && data.includes("FINAL_RESULTS:")) {
        const parts = data.split("FINAL_RESULTS:");
        stdoutBuffer += parts[0];
        finalJsonBuffer = (parts[1] || "").trim();
        hasFinalMarker = true;
        console.log("FINAL_RESULTS marker detected");
      }
      // 2. Collect JSON after marker
      else if (hasFinalMarker) {
        finalJsonBuffer += data;
      }
      // 3. Normal progress
      else {
        stdoutBuffer += data;
      }

      // === PROCESS PROGRESS LINES (ONLY BEFORE FINAL_RESULTS) ===
      if (!hasFinalMarker) {
        const lines = stdoutBuffer.split("\n");
        stdoutBuffer = lines.pop() || "";

        lines.forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed) return;

          console.log("Python:", trimmed);

          if (trimmed.startsWith("{") && !trimmed.includes("FINAL_RESULTS")) {
            try {
              const progress = JSON.parse(trimmed);
              hasStarted = true;
              lastProgressUpdate = Date.now();
              progressCallback?.(progress);
            } catch (e) {
              // ignore
            }
          }
        });
      }
    });

    pythonProcess.stderr.on("data", (data) => {
      stderrBuffer += data.toString();
      console.error("Python stderr:", data.toString().trim());
    });

    // === PROCESS CLOSE ===
    pythonProcess.on("close", (code) => {
      console.log(`\nPython process exited with code: ${code}`);

      if (code !== 0) {
        let errorMsg = "Python script failed";
        if (stderrBuffer.includes("No module named")) {
          const match = stderrBuffer.match(/No module named ['"]([^'"]+)['"]/);
          errorMsg = `Missing module: ${
            match?.[1] || "unknown"
          }. Run: pip install -r requirements.txt`;
        } else if (stderrBuffer.includes("CUDA out of memory")) {
          errorMsg = "GPU out of memory. Try smaller video.";
        } else if (stderrBuffer.includes("FileNotFoundError")) {
          errorMsg = "Python cannot read the video file.";
        } else if (!hasStarted) {
          errorMsg = "Python script crashed on startup.";
        }

        return reject({
          error: errorMsg,
          exitCode: code,
          stderr: stderrBuffer.slice(0, 1000),
          stdout: stdoutBuffer.slice(0, 500),
        });
      }

      // === PARSE FINAL RESULT ===
      let finalResult = null;

      // 1. PRIMARY: Use FINAL_RESULTS buffer
      if (hasFinalMarker && finalJsonBuffer.trim()) {
        try {
          finalResult = JSON.parse(finalJsonBuffer);
          console.log("SUCCESS: Parsed FINAL_RESULTS JSON");
        } catch (e) {
          console.error("JSON parse error in FINAL_RESULTS:", e.message);
        }
      }

      // 2. FALLBACK: Scan stdoutBuffer
      if (!finalResult && stdoutBuffer.includes('"success"')) {
        const matches = stdoutBuffer.match(
          /\{[\s\S]*?"success"\s*:\s*(true|false)[\s\S]*?\}/gi
        );
        if (matches?.length) {
          try {
            finalResult = JSON.parse(matches[matches.length - 1]);
            console.log("FALLBACK: Parsed last JSON from stdout");
          } catch (e) {}
        }
      }

      if (!finalResult) {
        return reject({
          error: "No valid JSON result found",
          message: "FINAL_RESULTS parsing failed",
          finalJsonBuffer: finalJsonBuffer.slice(0, 500),
          stdoutBuffer: stdoutBuffer.slice(-500),
          stderr: stderrBuffer.slice(0, 300),
        });
      }

      // === HANDLE success: false FROM PYTHON ===
      if (!finalResult.success) {
        console.error("Python Analysis Failed:", finalResult.error);
        return reject({
          error: finalResult.error || "Analysis failed",
          traceback: finalResult.traceback || "No traceback",
        });
      }

      // Fix missing real score
      if (
        finalResult.statistics &&
        finalResult.statistics.average_fake_score !== undefined &&
        finalResult.statistics.average_real_score === undefined
      ) {
        finalResult.statistics.average_real_score =
          100 - finalResult.statistics.average_fake_score;
      }

      console.log(
        `Analysis Complete: ${finalResult.verdict.classification} (${finalResult.verdict.confidence}%)`
      );
      resolve(finalResult);
    });

    // === SPAWN ERROR ===
    pythonProcess.on("error", (err) => {
      reject({
        error: "Failed to start Python",
        message: err.message,
        suggestion: "Check PYTHON_PATH and permissions",
      });
    });

    // === TIMEOUT ===
    const timeout = setTimeout(() => {
      if (!finalResult) {
        console.error("Timeout: Killing Python process...");
        pythonProcess.kill("SIGTERM");
        setTimeout(() => pythonProcess.kill("SIGKILL"), 3000);
        reject({ error: "Analysis timeout after 10 minutes" });
      }
    }, 10 * 60 * 1000);

    pythonProcess.on("close", () => clearTimeout(timeout));
  });
}
// ============================================
// AUDIO ANALYSIS WITH PYTHON
// ============================================
function analyzeAudioWithPython(audioPath) {
  return new Promise((resolve, reject) => {
    console.log("\n🐍 Starting Python Audio Analysis");
    console.log(`Script: ${PYTHON_AUDIO_SCRIPT}`);
    console.log(`Audio: ${audioPath}`);

    if (!PYTHON_AUDIO_SCRIPT || !fsSync.existsSync(PYTHON_AUDIO_SCRIPT)) {
      return reject({ error: "Audio detector script not found" });
    }

    if (!fsSync.existsSync(audioPath)) {
      return reject({ error: "Audio file not found", path: audioPath });
    }

    const pythonProcess = spawn(PYTHON_PATH, [PYTHON_AUDIO_SCRIPT, audioPath], {
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
      cwd: path.dirname(PYTHON_AUDIO_SCRIPT),
    });

    let outputBuffer = "";
    let errorBuffer = "";

    pythonProcess.stdout.on("data", (data) => {
      outputBuffer += data.toString();
      console.log("📤 Audio:", data.toString().trim());
    });

    pythonProcess.stderr.on("data", (data) => {
      errorBuffer += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        return reject({
          error: "Audio analysis failed",
          exitCode: code,
          stderr: errorBuffer.substring(0, 1000),
        });
      }

      try {
        const jsonMatch = outputBuffer.match(/\{[\s\S]*"success"[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON output");

        const result = JSON.parse(jsonMatch[0]);
        if (!result.success) throw new Error(result.error || "Analysis failed");

        console.log(`✅ Audio analysis: ${result.verdict}`);
        resolve(result);
      } catch (error) {
        reject({ error: "Failed to parse results", message: error.message });
      }
    });

    const timeout = setTimeout(() => {
      pythonProcess.kill();
      reject({ error: "Audio analysis timeout (5 minutes)" });
    }, 5 * 60 * 1000);

    pythonProcess.on("close", () => clearTimeout(timeout));
  });
}

// ============================================
// MULTER CONFIGURATION
// ============================================
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, VIDEO_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, "video-" + uniqueSuffix + "-" + sanitizedName);
  },
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const allowed = /mp4|avi|mov|mkv|webm|flv|wmv|mpeg|mpg/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith("video/");
    cb(
      extname && mimetype ? null : new Error("Only video files allowed"),
      extname && mimetype
    );
  },
});

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AUDIO_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, "audio-" + uniqueSuffix + "-" + sanitizedName);
  },
});

const audioUpload = multer({
  storage: audioStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const types = [
      "audio/wav",
      "audio/mpeg",
      "audio/mp3",
      "audio/ogg",
      "audio/flac",
      "audio/x-m4a",
    ];
    const exts = [".wav", ".mp3", ".ogg", ".flac", ".m4a"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(
      types.includes(file.mimetype) || exts.includes(ext)
        ? null
        : new Error("Only audio files allowed"),
      types.includes(file.mimetype) || exts.includes(ext)
    );
  },
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================
try {
  const authRoutes = require("./routes/authRoutes");
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
  app.use("/api/auth/forgot-password", authLimiter);
  app.use("/api/auth/profile", profileLimiter);
  app.use("/api/auth", authRoutes);

  try {
    const detectionRoutes = require("./routes/DetectionRoutes");
    app.use("/api/analyses", detectionRoutes);
    app.use("/api/detections", detectionRoutes);
  } catch (err) {
    console.log("⚠️ Detection routes not found");
  }

  console.log("✅ Authentication routes loaded");
} catch (err) {
  console.log("⚠️ Authentication routes not found");
}

// ============================================
// API ROUTES
// ============================================
app.get("/", (req, res) => {
  res.json({
    name: "DeepGuard API",
    version: "2.1.0",
    endpoints: {
      videoAnalysis: "POST /api/video/analyze",
      audioAnalysis: "POST /api/audio/analyze",
      analyses: "GET /api/analyses",
      statistics: "GET /api/statistics",
      health: "GET /api/health",
      diagnostic: "GET /api/video/diagnostic",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoose.connection.readyState === 1,
      pythonVideo: PYTHON_VIDEO_SCRIPT
        ? fsSync.existsSync(PYTHON_VIDEO_SCRIPT)
        : false,
      pythonAudio: PYTHON_AUDIO_SCRIPT
        ? fsSync.existsSync(PYTHON_AUDIO_SCRIPT)
        : false,
    },
  });
});

// ============================================
// VIDEO ANALYSIS ROUTE - ENHANCED
// ============================================
app.post(
  "/api/video/analyze",
  analysisLimiter,
  videoUpload.single("video"),
  async (req, res) => {
    const startTime = Date.now();
    let analysisRecord = null;
    let videoPath = null;

    try {
      console.log("\n" + "=".repeat(80));
      console.log("🎬 NEW VIDEO ANALYSIS REQUEST");
      console.log("=".repeat(80));

      if (!PYTHON_VIDEO_SCRIPT || !fsSync.existsSync(PYTHON_VIDEO_SCRIPT)) {
        console.error("❌ Python script not found");
        return res.status(503).json({
          success: false,
          error: "Video detection service not available",
          scriptPath: PYTHON_VIDEO_SCRIPT,
        });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, error: "No video file uploaded" });
      }

      videoPath = req.file.path;
      console.log(
        `📁 File: ${req.file.originalname} (${(
          req.file.size /
          1024 /
          1024
        ).toFixed(2)} MB)`
      );

      const stats = await fs.stat(videoPath);
      if (stats.size === 0) throw new Error("Empty file");

      if (mongoConnected) {
        analysisRecord = new VideoAnalysis({
          filename: req.file.filename,
          originalName: req.file.originalname,
          fileSize: req.file.size,
          status: "processing",
          userId: req.user?.id,
          ipAddress: getClientIP(req),
        });
        await analysisRecord.save();
        console.log(`💾 Record created: ${analysisRecord._id}`);
      }

      const options = {
        maxFrames: parseInt(req.body.maxFrames) || 30,
        sampleRate: parseInt(req.body.sampleRate) || 2,
      };

      if (options.maxFrames < 5 || options.maxFrames > 100) {
        throw new Error("maxFrames must be 5-100");
      }

      console.log(
        `⚙️  Options: maxFrames=${options.maxFrames}, sampleRate=${options.sampleRate}`
      );
      console.log("🚀 Starting analysis...\n");

      const result = await analyzeVideoWithPython(
        videoPath,
        options,
        (progress) => {
          console.log(`${progress.status}: ${progress.message}`);
        }
      );

      if (!result.success) {
        throw new Error(result.error || "Analysis failed");
      }

      // SAVE TO VideoAnalysis (keep for history)
      if (mongoConnected && analysisRecord) {
        analysisRecord.verdict = result.verdict;
        analysisRecord.statistics = result.statistics;
        analysisRecord.suspicious_frames = result.suspicious_frames || [];
        analysisRecord.technical_info = result.technical_info || {};
        analysisRecord.warnings = result.warnings || [];
        analysisRecord.processing_time = Date.now() - startTime;
        analysisRecord.status = "completed";
        await analysisRecord.save();
      }

      // SAVE TO Detection MODEL (FOR PROFILE STATS)
      if (mongoConnected && req.user?.id) {
        const Detection = mongoose.model("Detection");
        const detection = new Detection({
          userId: req.user.id,
          fileName: req.file.originalname,
          fileType: "video",
          fileSize: req.file.size,
          result: result.verdict.classification,
          confidence: result.verdict.confidence,
          analysisDetails: result,
        });
        await detection.save();
        console.log("Detection saved for profile:", detection._id);
      }
      console.log(
        `✅ Completed: ${result.verdict.classification} (${result.verdict.confidence}%)`
      );
      console.log("=".repeat(80) + "\n");

      if (req.body.deleteAfterAnalysis !== "false") {
        fs.unlink(videoPath).catch((err) =>
          console.error("⚠️ Delete failed:", err)
        );
      }

      res.json({
        success: true,
        analysisId: analysisRecord?._id,
        type: "video",
        ...result,
        processing_time_ms: Date.now() - startTime,
      });
    } catch (error) {
      console.error("\n❌ VIDEO ANALYSIS ERROR:", error.message);
      console.error("=".repeat(80) + "\n");

      if (mongoConnected && analysisRecord) {
        analysisRecord.status = "failed";
        analysisRecord.error = error.message || "Unknown error";
        await analysisRecord.save().catch(() => {});
      }

      if (videoPath) {
        await fs.unlink(videoPath).catch(() => {});
      }

      res.status(500).json({
        success: false,
        error: error.error || error.message || "Video analysis failed",
        details: error.suggestion || error.details,
        stderr: error.stderr?.substring(0, 500),
        type: "video",
      });
    }
  }
);

// ============================================
// AUDIO ANALYSIS ROUTE
// ============================================
app.post(
  "/api/audio/analyze",
  analysisLimiter,
  audioUpload.single("audio"),
  async (req, res) => {
    const startTime = Date.now();
    let analysisRecord = null;
    let audioPath = null;

    try {
      if (!PYTHON_AUDIO_SCRIPT || !fsSync.existsSync(PYTHON_AUDIO_SCRIPT)) {
        return res.status(503).json({
          success: false,
          error: "Audio detection service not available",
        });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, error: "No audio file uploaded" });
      }

      audioPath = req.file.path;
      console.log(`\n🎵 Audio Analysis: ${req.file.originalname}`);

      const stats = await fs.stat(audioPath);
      if (stats.size === 0) throw new Error("Empty file");

      if (mongoConnected) {
        analysisRecord = new AudioAnalysis({
          filename: req.file.filename,
          originalName: req.file.originalname,
          fileSize: req.file.size,
          status: "processing",
          userId: req.user?.id,
          ipAddress: getClientIP(req),
        });
        await analysisRecord.save();
      }

      const result = await analyzeAudioWithPython(audioPath);

      if (!result.success && !result.is_fake) {
        throw new Error(result.error || "Analysis failed");
      }

      const response = {
        success: true,
        analysisId: analysisRecord?._id,
        type: "audio",
        result: {
          is_fake: result.is_fake,
          confidence: result.confidence,
          verdict: result.verdict,
          real_probability: result.real_probability,
          fake_probability: result.fake_probability,
          predictions: result.predictions || [],
          audio_features: result.audio_features || {
            duration: 0,
            rms_energy: 0,
            zero_crossing_rate: 0,
            spectral_centroid_mean: 0,
            spectral_centroid_std: 0,
          },
        },
        processing_time_ms: Date.now() - startTime,
      };

      if (mongoConnected && analysisRecord) {
        analysisRecord.result = {
          prediction: result.verdict,
          confidence: result.confidence,
          details: response.result,
        };
        analysisRecord.processing_time = Date.now() - startTime;
        analysisRecord.status = "completed";
        await analysisRecord.save();
      }

      console.log(`✅ Audio completed: ${result.verdict}\n`);

      await fs.unlink(audioPath).catch(() => {});

      res.json(response);
    } catch (error) {
      console.error("❌ Audio error:", error.message);

      if (mongoConnected && analysisRecord) {
        analysisRecord.status = "failed";
        analysisRecord.error = error.message;
        await analysisRecord.save().catch(() => {});
      }

      if (audioPath) {
        await fs.unlink(audioPath).catch(() => {});
      }

      res.status(500).json({
        success: false,
        error: error.error || error.message || "Audio analysis failed",
        details: error.details || error.suggestion,
        type: "audio",
      });
    }
  }
);

// ============================================
// UNIFIED ANALYSIS ROUTES
// ============================================
app.get("/api/analyses", async (req, res) => {
  try {
    if (!mongoConnected) {
      return res
        .status(503)
        .json({ success: false, error: "Database unavailable" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const fileType = req.query.type;
    const userId = req.user?.id;

    const videoQuery = userId ? { userId } : {};
    const audioQuery = userId ? { userId } : {};

    const [videoAnalyses, audioAnalyses] = await Promise.all([
      fileType === "audio"
        ? []
        : VideoAnalysis.find(videoQuery)
            .sort({ createdAt: -1 })
            .skip(fileType ? skip : 0)
            .limit(fileType ? limit : limit / 2)
            .select("-__v -ipAddress")
            .lean(),
      fileType === "video"
        ? []
        : AudioAnalysis.find(audioQuery)
            .sort({ createdAt: -1 })
            .skip(fileType ? skip : 0)
            .limit(fileType ? limit : limit / 2)
            .select("-__v -ipAddress")
            .lean(),
    ]);

    const allAnalyses = [...videoAnalyses, ...audioAnalyses]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    const [videoCount, audioCount] = await Promise.all([
      fileType === "audio" ? 0 : VideoAnalysis.countDocuments(videoQuery),
      fileType === "video" ? 0 : AudioAnalysis.countDocuments(audioQuery),
    ]);

    res.json({
      success: true,
      data: allAnalyses,
      pagination: {
        total: videoCount + audioCount,
        videoCount,
        audioCount,
        page,
        pages: Math.ceil((videoCount + audioCount) / limit),
        limit,
      },
    });
  } catch (error) {
    console.error("❌ Fetch analyses error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch analyses" });
  }
});

app.get("/api/video/analyses", async (req, res) => {
  try {
    if (!mongoConnected) {
      return res
        .status(503)
        .json({ success: false, error: "Database unavailable" });
    }

    const userId = req.user?.id;
    const query = userId ? { userId } : {};

    const analyses = await VideoAnalysis.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .select("-__v -ipAddress")
      .lean();

    res.json({ success: true, data: analyses });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch video analyses" });
  }
});

app.get("/api/audio/analyses", async (req, res) => {
  try {
    if (!mongoConnected) {
      return res
        .status(503)
        .json({ success: false, error: "Database unavailable" });
    }

    const userId = req.user?.id;
    const query = userId ? { userId } : {};

    const analyses = await AudioAnalysis.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .select("-__v -ipAddress")
      .lean();

    res.json({ success: true, data: analyses });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch audio analyses" });
  }
});

app.delete("/api/analyses/:id", async (req, res) => {
  try {
    if (!mongoConnected) {
      return res
        .status(503)
        .json({ success: false, error: "Database unavailable" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "Invalid ID" });
    }

    const videoAnalysis = await VideoAnalysis.findByIdAndDelete(req.params.id);
    const audioAnalysis = await AudioAnalysis.findByIdAndDelete(req.params.id);

    if (!videoAnalysis && !audioAnalysis) {
      return res
        .status(404)
        .json({ success: false, error: "Analysis not found" });
    }

    console.log(`🗑️ Deleted: ${req.params.id}`);
    res.json({
      success: true,
      message: "Deleted",
      type: videoAnalysis ? "video" : "audio",
    });
  } catch (error) {
    console.error("❌ Delete error:", error);
    res.status(500).json({ success: false, error: "Failed to delete" });
  }
});

app.post("/api/analyses/batch-delete", async (req, res) => {
  try {
    if (!mongoConnected) {
      return res
        .status(503)
        .json({ success: false, error: "Database unavailable" });
    }

    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: "No IDs provided" });
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));

    const [videoResult, audioResult] = await Promise.all([
      VideoAnalysis.deleteMany({ _id: { $in: validIds } }),
      AudioAnalysis.deleteMany({ _id: { $in: validIds } }),
    ]);

    const totalDeleted = videoResult.deletedCount + audioResult.deletedCount;
    console.log(`🗑️ Batch deleted ${totalDeleted} analyses`);

    res.json({
      success: true,
      deletedCount: totalDeleted,
      videoDeleted: videoResult.deletedCount,
      audioDeleted: audioResult.deletedCount,
    });
  } catch (error) {
    console.error("❌ Batch delete error:", error);
    res.status(500).json({ success: false, error: "Failed to batch delete" });
  }
});

app.get("/api/statistics", async (req, res) => {
  try {
    if (!mongoConnected) {
      return res
        .status(503)
        .json({ success: false, error: "Database unavailable" });
    }

    const userId = req.user?.id;
    const userFilter = userId ? { userId } : {};

    const [
      totalVideos,
      realVideos,
      fakeVideos,
      uncertainVideos,
      failedVideos,
      avgVideoTime,
      totalAudio,
      realAudio,
      fakeAudio,
      uncertainAudio,
      failedAudio,
      avgAudioTime,
      todayVideos,
      todayAudio,
    ] = await Promise.all([
      VideoAnalysis.countDocuments(userFilter),
      VideoAnalysis.countDocuments({
        ...userFilter,
        "verdict.classification": "REAL",
      }),
      VideoAnalysis.countDocuments({
        ...userFilter,
        "verdict.classification": "FAKE",
      }),
      VideoAnalysis.countDocuments({
        ...userFilter,
        "verdict.classification": "UNCERTAIN",
      }),
      VideoAnalysis.countDocuments({ ...userFilter, status: "failed" }),
      VideoAnalysis.aggregate([
        {
          $match: {
            ...userFilter,
            status: "completed",
            processing_time: { $exists: true },
          },
        },
        { $group: { _id: null, avgTime: { $avg: "$processing_time" } } },
      ]),
      AudioAnalysis.countDocuments(userFilter),
      AudioAnalysis.countDocuments({
        ...userFilter,
        "result.prediction": "REAL",
      }),
      AudioAnalysis.countDocuments({
        ...userFilter,
        "result.prediction": "FAKE",
      }),
      AudioAnalysis.countDocuments({
        ...userFilter,
        "result.prediction": "UNCERTAIN",
      }),
      AudioAnalysis.countDocuments({ ...userFilter, status: "failed" }),
      AudioAnalysis.aggregate([
        {
          $match: {
            ...userFilter,
            status: "completed",
            processing_time: { $exists: true },
          },
        },
        { $group: { _id: null, avgTime: { $avg: "$processing_time" } } },
      ]),
      VideoAnalysis.countDocuments({
        ...userFilter,
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      AudioAnalysis.countDocuments({
        ...userFilter,
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ]);

    res.json({
      success: true,
      statistics: {
        totalAnalyses: totalVideos + totalAudio,
        realVideos: realVideos + realAudio,
        fakeVideos: fakeVideos + fakeAudio,
        uncertainVideos: uncertainVideos + uncertainAudio,
        failedVideos: failedVideos + failedAudio,
        avgProcessingTime: avgVideoTime[0]?.avgTime || 0,
        video: {
          total: totalVideos,
          real: realVideos,
          fake: fakeVideos,
          uncertain: uncertainVideos,
          failed: failedVideos,
          avgProcessingTime: avgVideoTime[0]?.avgTime || 0,
          today: todayVideos,
        },
        audio: {
          total: totalAudio,
          real: realAudio,
          fake: fakeAudio,
          uncertain: uncertainAudio,
          failed: failedAudio,
          avgProcessingTime: avgAudioTime[0]?.avgTime || 0,
          today: todayAudio,
        },
      },
    });
  } catch (error) {
    console.error("❌ Statistics error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch statistics" });
  }
});

// ============================================
// DIAGNOSTIC ROUTES
// ============================================
app.get("/api/test-python", async (req, res) => {
  try {
    const testProcess = spawn(PYTHON_PATH, ["--version"], { timeout: 5000 });

    let output = "";
    let error = "";

    testProcess.stdout.on("data", (data) => {
      output += data.toString();
    });
    testProcess.stderr.on("data", (data) => {
      error += data.toString();
    });

    testProcess.on("close", (code) => {
      res.json({
        success: code === 0,
        video: {
          pythonPath: PYTHON_PATH,
          version: (output + error).trim(),
          scriptExists: PYTHON_VIDEO_SCRIPT
            ? fsSync.existsSync(PYTHON_VIDEO_SCRIPT)
            : false,
          venvExists: fsSync.existsSync(PYTHON_VENV),
        },
        audio: {
          pythonPath: PYTHON_PATH,
          scriptExists: PYTHON_AUDIO_SCRIPT
            ? fsSync.existsSync(PYTHON_AUDIO_SCRIPT)
            : false,
        },
        platform: process.platform,
        nodeVersion: process.version,
      });
    });

    testProcess.on("error", (err) => {
      res.json({ success: false, error: err.message });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/video/diagnostic", async (req, res) => {
  console.log("\n🔍 Running video diagnostic...\n");

  const diagnostics = {
    timestamp: new Date().toISOString(),
    serverDir: __dirname,
    pythonPath: PYTHON_PATH,
    videoScriptPath: PYTHON_VIDEO_SCRIPT,
    videoScriptExists: PYTHON_VIDEO_SCRIPT
      ? fsSync.existsSync(PYTHON_VIDEO_SCRIPT)
      : false,
    uploadDirExists: fsSync.existsSync(VIDEO_UPLOAD_DIR),
    searchedPaths: [
      path.join(__dirname, "AudioVideo", "python-detector", "detector.py"),
      path.join(
        __dirname,
        "..",
        "AudioVideo",
        "python-detector",
        "detector.py"
      ),
      path.join(__dirname, "python-detector", "detector.py"),
    ].map((p) => ({
      path: p,
      exists: fsSync.existsSync(p),
      absolute: path.resolve(p),
    })),
  };

  try {
    const testProcess = spawn(PYTHON_PATH, ["--version"], {
      timeout: 5000,
      shell: process.platform === "win32",
    });

    let output = "";
    let error = "";

    testProcess.stdout.on("data", (data) => {
      output += data.toString();
    });
    testProcess.stderr.on("data", (data) => {
      error += data.toString();
    });

    testProcess.on("close", (code) => {
      diagnostics.pythonTest = {
        exitCode: code,
        version: (output + error).trim(),
        success: code === 0,
      };
      diagnostics.ready =
        code === 0 &&
        diagnostics.videoScriptExists &&
        diagnostics.uploadDirExists;

      console.log("📊 Diagnostic Results:");
      console.log("   Python:", diagnostics.pythonTest.success ? "✅" : "❌");
      console.log("   Script:", diagnostics.videoScriptExists ? "✅" : "❌");
      console.log("   Ready:", diagnostics.ready ? "✅" : "❌");
      console.log("");

      res.json(diagnostics);
    });

    testProcess.on("error", (err) => {
      diagnostics.pythonTest = { error: err.message, success: false };
      diagnostics.ready = false;
      res.json(diagnostics);
    });
  } catch (err) {
    diagnostics.pythonTest = { error: err.message, success: false };
    diagnostics.ready = false;
    res.json(diagnostics);
  }
});
app.get("/api/diagnostic", (req, res) => {
  res.json({
    serverDir: __dirname,
    pythonPath: PYTHON_PATH,
    videoScriptPath: PYTHON_VIDEO_SCRIPT,
    videoScriptExists: PYTHON_VIDEO_SCRIPT
      ? fsSync.existsSync(PYTHON_VIDEO_SCRIPT)
      : false,
    audioScriptPath: PYTHON_AUDIO_SCRIPT,
    audioScriptExists: PYTHON_AUDIO_SCRIPT
      ? fsSync.existsSync(PYTHON_AUDIO_SCRIPT)
      : false,
    platform: process.platform,
    checkedPaths: [
      path.join(__dirname, "AudioVideo", "python-detector", "detector.py"),
      path.join(
        __dirname,
        "..",
        "AudioVideo",
        "python-detector",
        "detector.py"
      ),
      path.join(__dirname, "python-detector", "detector.py"),
    ].map((p) => ({
      path: p,
      exists: fsSync.existsSync(p),
    })),
  });
});
app.get("/api/audio/diagnostic", (req, res) => {
  const diagnostics = {
    pythonPath: PYTHON_PATH,
    audioScriptPath: PYTHON_AUDIO_SCRIPT,
    audioScriptExists: PYTHON_AUDIO_SCRIPT
      ? fsSync.existsSync(PYTHON_AUDIO_SCRIPT)
      : false,
    uploadDirExists: fsSync.existsSync(AUDIO_UPLOAD_DIR),
    serverDir: __dirname,
  };

  res.json(diagnostics);
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((error, req, res, next) => {
  console.error("❌ Error:", error.message);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File too large (Max: 100MB video, 50MB audio)",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ success: false, error: "Too many files" });
    }
  }

  res.status(error.status || 500).json({
    success: false,
    error: error.message || "Internal server error",
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on("SIGINT", async () => {
  console.log("\n⏹️  Shutting down...");
  if (mongoConnected) await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n⏹️  Shutting down...");
  if (mongoConnected) await mongoose.connection.close();
  process.exit(0);
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(80));
  console.log("🚀 DeepGuard Server Started");
  console.log("=".repeat(80));
  console.log(`📡 Server:        http://localhost:${PORT}`);
  console.log(
    `🗄️  MongoDB:       ${mongoConnected ? "✅ Connected" : "⚠️  Disconnected"}`
  );
  console.log(
    `🐍 Python Video:  ${PYTHON_VIDEO_SCRIPT ? "✅ Found" : "❌ Not Found"}`
  );
  console.log(
    `🎵 Python Audio:  ${PYTHON_AUDIO_SCRIPT ? "✅ Found" : "❌ Not Found"}`
  );
  console.log(`💻 Environment:   ${process.env.NODE_ENV || "development"}`);
  console.log("=".repeat(80));
  console.log("\n📌 Endpoints:");
  console.log("   POST   /api/video/analyze       - Analyze video");
  console.log("   POST   /api/audio/analyze       - Analyze audio");
  console.log("   GET    /api/analyses            - Get analyses");
  console.log("   GET    /api/statistics          - Statistics");
  console.log("   GET    /api/health              - Health check");
  console.log("   GET    /api/diagnostic    - Video diagnostic");
  console.log("   GET    /api/audio/diagnostic    - Audio diagnostic");
  console.log("=".repeat(80) + "\n");
});

module.exports = app;
