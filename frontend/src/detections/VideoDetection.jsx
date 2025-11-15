import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Activity,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  History,
  TrendingUp,
  Clock,
  Film,
  Eye,
  BarChart3,
  RefreshCw,
  Zap,
  Lock,
  Award,
} from "lucide-react";
import { useAuth } from "../context/AuthContext"; // ✅ FIXED: Import useAuth
import "./VideoDetection.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function VideoDetection() {
  const { getAuthHeaders } = useAuth(); // ✅ FIXED: Get auth headers
  const [activeTab, setActiveTab] = useState("upload");
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [options, setOptions] = useState({ maxFrames: 30, sampleRate: 2 });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
    if (activeTab === "statistics") fetchStatistics();
  }, [activeTab]);

  // ✅ NEW - Fetches from Detection collection (same as Profile)
const fetchHistory = async () => {
  try {
    const res = await fetch(`${API_URL}/detections/history`, {
      headers: getAuthHeaders(),
    });
    
    if (res.ok) {
      const data = await res.json();
      
      // Map to match the expected format
      const formattedHistory = data.map(item => ({
        _id: item.id,
        originalName: item.fileName,
        uploadDate: item.timestamp,
        fileSize: typeof item.fileSize === 'string' 
          ? parseFloat(item.fileSize) * 1024 * 1024  // Convert "X.XX MB" back to bytes
          : item.fileSize,
        verdict: {
          classification: item.result === 'authentic' ? 'REAL' : 
                         item.result === 'deepfake' ? 'FAKE' : 'UNCERTAIN',
          confidence: item.confidence
        }
      }));
      
      setHistory(formattedHistory);
    } else {
      console.error("Failed to fetch history");
      setHistory([]);
    }
  } catch (error) {
    console.error("Failed to fetch history:", error);
    setHistory([]);
  }
};

  const fetchStatistics = async () => {
    try {
      const res = await fetch(`${API_URL}/statistics`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) setStatistics(data.statistics);
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith("video/")) {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert("Please select a valid video file");
    }
  };

  const analyzeVideo = async () => {
    if (!file) return;

    setAnalyzing(true);
    setProgress(0);
    setResult(null);

    const formData = new FormData();
    formData.append("video", file);
    formData.append("maxFrames", options.maxFrames);
    formData.append("sampleRate", options.sampleRate);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90));
    }, 500);

    try {
      const headers = getAuthHeaders();
      delete headers['Content-Type']; // Let browser set multipart boundary

      const response = await fetch(`${API_URL}/video/analyze`, {
        method: "POST",
        headers,
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (data.success) {
        setResult(data);
        
        // ✅ FIXED: Save to Detection model with correct parameters
        await saveDetectionToDB(data, file);
        
        setTimeout(() => setActiveTab("result"), 500);
      } else {
        alert("Analysis failed: " + data.error);
      }
    } catch (error) {
      clearInterval(progressInterval);
      alert("Network error: " + error.message);
    } finally {
      setAnalyzing(false);
      setProgress(0);
    }
  };

  // ✅ FIXED: Corrected saveDetectionToDB function
  const saveDetectionToDB = async (analysisResult, uploadedFile) => {
    try {
      console.log('💾 Saving detection to database...');
      
      // Map Python result to profile format
      let mappedResult = 'uncertain';
      if (analysisResult.verdict.classification === 'REAL') {
        mappedResult = 'authentic';
      } else if (analysisResult.verdict.classification === 'FAKE') {
        mappedResult = 'deepfake';
      }

      const detectionData = {
        fileName: uploadedFile.name,
        fileType: 'video',
        fileSize: uploadedFile.size,
        result: analysisResult.verdict.classification, // REAL/FAKE for backend
        confidence: analysisResult.verdict.confidence,
        analysisDetails: JSON.stringify(analysisResult),
      };

      const headers = getAuthHeaders();
      
      const res = await fetch(`${API_URL}/detections`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(detectionData),
      });

      if (res.ok) {
        console.log('✅ Detection saved to database');
        
        // Trigger profile refresh
        window.dispatchEvent(new Event('profile-refresh'));
        console.log('✅ Profile refresh event dispatched');
      } else {
        const errorData = await res.json();
        console.error('❌ Failed to save detection:', errorData);
      }
    } catch (err) {
      console.error('❌ Save detection error:', err);
    }
  };

  const deleteAnalysis = async (id) => {
    try {
      const res = await fetch(`${API_URL}/analyses/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        fetchHistory();
        window.dispatchEvent(new Event('profile-refresh'));
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }


  };
  

  return (
    <div className="app-container">
      <div className="animated-bg"></div>

      <div className="main-wrapper">
        <div className="content-wrapper">
          {/* Header */}
          <div className="header-section">
            <p className="app-subtitle">AI-Powered Deepfake Detection System</p>

            {/* Feature Badges */}
            <div className="feature-badges">
              <div className="badge">
                <Zap className="badge-icon" />
                <span>Lightning Fast</span>
              </div>
              <div className="badge">
                <Lock className="badge-icon" />
                <span>Secure</span>
              </div>
              <div className="badge">
                <Award className="badge-icon" />
                <span>99% Accuracy</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="nav-tabs-container">
            <div className="nav-tabs">
              {[
                { id: "upload", icon: Upload, label: "Upload", color: "#6366f1" },
                { id: "result", icon: Activity, label: "Result", color: "#8b5cf6" },
                { id: "history", icon: History, label: "History", color: "#ec4899" },
                { id: "statistics", icon: TrendingUp, label: "Stats", color: "#f59e0b" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
                  style={activeTab === tab.id ? { "--tab-color": tab.color } : {}}
                >
                  <tab.icon className="tab-icon" />
                  <span className="tab-label">{tab.label}</span>
                  {activeTab === tab.id && <div className="tab-indicator"></div>}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="content-card">
            {/* Upload Tab */}
            {activeTab === "upload" && (
              <div className="tab-content">
                <h2 className="section-title">Upload Video for Analysis</h2>

                {/* Upload Area */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`upload-zone ${dragActive ? "drag-active" : ""}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      e.target.files?.[0] && handleFileSelect(e.target.files[0])
                    }
                    className="hidden"
                  />
                  <div className="upload-icon-wrapper">
                    <Film className="upload-icon" />
                    <div className="upload-pulse"></div>
                  </div>
                  <h3 className="upload-title">Drop your video here</h3>
                  <p className="upload-subtitle">or click to browse</p>
                  <div className="upload-formats">
                    <span className="format-tag">MP4</span>
                    <span className="format-tag">AVI</span>
                    <span className="format-tag">MOV</span>
                    <span className="format-tag">MKV</span>
                    <span className="format-tag">WEBM</span>
                  </div>
                  <p className="upload-note">Maximum file size: 100MB</p>
                </div>

                {/* File Info */}
                {file && (
                  <div className="file-info-card">
                    <div className="file-info-content">
                      <div className="file-info-left">
                        <div className="file-icon-wrapper">
                          <Film className="file-icon" />
                        </div>
                        <div>
                          <p className="file-name">{file.name}</p>
                          <p className="file-size">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="remove-file-btn"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Options */}
                <div className="options-grid">
                  <div className="option-group">
                    <label className="option-label">
                      <BarChart3 className="option-icon" />
                      Max Frames
                    </label>
                    <select
                      value={options.maxFrames}
                      onChange={(e) =>
                        setOptions({
                          ...options,
                          maxFrames: parseInt(e.target.value),
                        })
                      }
                      className="option-select"
                    >
                      <option value="15">15 frames (Faster)</option>
                      <option value="30">30 frames (Balanced)</option>
                      <option value="50">50 frames (More Accurate)</option>
                    </select>
                  </div>
                  <div className="option-group">
                    <label className="option-label">
                      <Clock className="option-icon" />
                      Sample Rate
                    </label>
                    <select
                      value={options.sampleRate}
                      onChange={(e) =>
                        setOptions({
                          ...options,
                          sampleRate: parseInt(e.target.value),
                        })
                      }
                      className="option-select"
                    >
                      <option value="1">1 fps (Thorough)</option>
                      <option value="2">2 fps (Balanced)</option>
                      <option value="3">3 fps (Faster)</option>
                    </select>
                  </div>
                </div>

                {/* Analyze Button */}
                <button
                  onClick={analyzeVideo}
                  disabled={!file || analyzing}
                  className={`analyze-btn ${
                    !file || analyzing ? "disabled" : ""
                  }`}
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="btn-icon spinning" />
                      <span>Analyzing... {progress}%</span>
                    </>
                  ) : (
                    <>
                      <Zap className="btn-icon" />
                      <span>Analyze Video</span>
                    </>
                  )}
                </button>

                {/* Progress Bar */}
                {analyzing && (
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="progress-shimmer"></div>
                      </div>
                    </div>
                    <p className="progress-text">
                      Processing frames and analyzing patterns...
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Result Tab - Keep existing implementation */}
            {activeTab === "result" && (
              <div className="tab-content">
                {result ? (
                  <div className="result-content">
                    <h2 className="section-title">Analysis Results</h2>

                    {/* Verdict Card */}
                    <div
                      className={`verdict-card ${result.verdict.classification.toLowerCase()}`}
                    >
                      <div className="verdict-bg-pattern"></div>
                      <div className="verdict-content">
                        {result.verdict.classification === "REAL" ? (
                          <CheckCircle className="verdict-icon" />
                        ) : result.verdict.classification === "FAKE" ? (
                          <AlertCircle className="verdict-icon" />
                        ) : (
                          <Eye className="verdict-icon" />
                        )}
                        <h3 className="verdict-title">
                          {result.verdict.classification}
                        </h3>
                        <div className="confidence-meter">
                          <div className="confidence-circle">
                            <svg className="confidence-svg" viewBox="0 0 100 100">
                              <circle
                                className="confidence-bg"
                                cx="50"
                                cy="50"
                                r="45"
                              />
                              <circle
                                className="confidence-progress"
                                cx="50"
                                cy="50"
                                r="45"
                                style={{
                                  strokeDasharray: `${
                                    result.verdict.confidence * 2.827
                                  }, 283`,
                                }}
                              />
                            </svg>
                            <div className="confidence-text">
                              {result.verdict.confidence}%
                            </div>
                          </div>
                        </div>
                        <p className="reliability-text">
                          Reliability: {result.verdict.reliability}
                        </p>
                      </div>
                    </div>

                    {/* Statistics Grid */}
                    <div className="stats-grid">
                      {[
                        {
                          label: "Frames Analyzed",
                          value: result.statistics.frames_analyzed || 0,
                          icon: Film,
                          color: "#6366f1",
                        },
                        {
                          label: "Faces Detected",
                          value: result.statistics.faces_detected || 0,
                          icon: Eye,
                          color: "#8b5cf6",
                        },
                        {
                          label: "Real Score",
                          value: `${result.statistics.average_real_score || 0}%`,
                          icon: CheckCircle,
                          color: "#10b981",
                        },
                        {
                          label: "Fake Score",
                          value: `${result.statistics.average_fake_score || 0}%`,
                          icon: AlertCircle,
                          color: "#ef4444",
                        },
                      ].map((stat, idx) => (
                        <div
                          key={idx}
                          className="stat-card"
                          style={{ "--stat-color": stat.color }}
                        >
                          <stat.icon className="stat-icon" />
                          <p className="stat-value">{stat.value}</p>
                          <p className="stat-label">{stat.label}</p>
                          <div className="stat-shine"></div>
                        </div>
                      ))}
                    </div>

                    {/* Suspicious Frames */}
                    {result.suspicious_frames &&
                      result.suspicious_frames.length > 0 && (
                        <div className="suspicious-section">
                          <h3 className="suspicious-title">
                            <AlertCircle className="suspicious-icon" />
                            Suspicious Frames Detected
                          </h3>
                          <div className="suspicious-list">
                            {result.suspicious_frames
                              .slice(0, 5)
                              .map((frame, idx) => (
                                <div key={idx} className="suspicious-item">
                                  <div className="suspicious-info">
                                    <span className="frame-number">
                                      Frame {frame.frame_number}
                                    </span>
                                    <span className="frame-time">
                                      @ {frame.timestamp}s
                                    </span>
                                  </div>
                                  <div className="fake-score-badge">
                                    {(frame.fake_score * 100).toFixed(1)}%
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Activity className="empty-icon" />
                    <p className="empty-text">No results yet</p>
                    <p className="empty-subtext">
                      Upload and analyze a video to see results
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* History Tab - Keep existing */}
            {activeTab === "history" && (
              <div className="tab-content">
                <div className="section-header">
                  <h2 className="section-title">Analysis History</h2>
                  <button onClick={fetchHistory} className="refresh-btn">
                    <RefreshCw className="refresh-icon" />
                    <span>Refresh</span>
                  </button>
                </div>

                {history.length > 0 ? (
                  <div className="history-list">
                    {history.map((item) => (
                      <div key={item._id} className="history-item">
                        <div className="history-content">
                          <div className="history-icon-wrapper">
                            <Film className="history-icon" />
                          </div>
                          <div className="history-details">
                            <p className="history-name">{item.originalName}</p>
                            <p className="history-meta">
                              {new Date(item.uploadDate).toLocaleString()} •{" "}
                              {(item.fileSize / (1024 * 1024)).toFixed(2)} MB
                            </p>
                            <div className="history-tags">
                              <span
                                className={`verdict-tag ${
                                  item.verdict?.classification?.toLowerCase() ||
                                  "unknown"
                                }`}
                              >
                                {item.verdict?.classification || "N/A"}
                              </span>
                              <span className="confidence-tag">
                                {item.verdict?.confidence || 0}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteAnalysis(item._id)}
                          className="delete-btn"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <History className="empty-icon" />
                    <p className="empty-text">No analysis history</p>
                    <p className="empty-subtext">
                      Your analyzed videos will appear here
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Statistics Tab - Keep existing */}
            {activeTab === "statistics" && (
              <div className="tab-content">
                <div className="section-header">
                  <h2 className="section-title">Statistics Dashboard</h2>
                  <button onClick={fetchStatistics} className="refresh-btn">
                    <RefreshCw className="refresh-icon" />
                    <span>Refresh</span>
                  </button>
                </div>

                {statistics ? (
                  <div className="dashboard-grid">
                    {[
                      {
                        label: "Total Analyses",
                        value: statistics.totalAnalyses,
                        color: "#6366f1",
                        icon: BarChart3,
                      },
                      {
                        label: "Real Videos",
                        value: statistics.realVideos,
                        color: "#10b981",
                        icon: CheckCircle,
                      },
                      {
                        label: "Fake Videos",
                        value: statistics.fakeVideos,
                        color: "#ef4444",
                        icon: AlertCircle,
                      },
                      {
                        label: "Avg Processing Time",
                        value: `${(statistics.avgProcessingTime / 1000).toFixed(
                          1
                        )}s`,
                        color: "#8b5cf6",
                        icon: Clock,
                      },
                    ].map((stat, idx) => (
                      <div
                        key={idx}
                        className="dashboard-card"
                        style={{ "--card-color": stat.color }}
                      >
                        <div className="dashboard-icon-wrapper">
                          <stat.icon className="dashboard-icon" />
                        </div>
                        <p className="dashboard-value">{stat.value}</p>
                        <p className="dashboard-label">{stat.label}</p>
                        <div className="dashboard-gradient"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <TrendingUp className="empty-icon" />
                    <p className="empty-text">Loading statistics...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}