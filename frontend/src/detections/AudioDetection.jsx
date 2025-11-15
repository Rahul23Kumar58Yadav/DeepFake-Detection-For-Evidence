import React, { useState } from 'react';
import axios from 'axios';
import './AudioDetection.css';

function AudioDetection() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const API_URL = 'http://localhost:5000';

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/flac', 'audio/x-m4a'];
    const maxSize = 50 * 1024 * 1024; // 50 MB

    if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(wav|mp3|ogg|flac|m4a)$/i)) {
      setError('Invalid file type. Please upload an audio file (WAV, MP3, OGG, FLAC, M4A)');
      setFile(null);
      return;
    }

    if (selectedFile.size > maxSize) {
      setError('File size exceeds 50 MB limit');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);
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
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an audio file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await axios.post(`${API_URL}/api/audio/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds
      });

      console.log('API Response:', response.data); // Debug log

      if (response.data.success) {
        setResult(response.data);
      } else {
        setError(response.data.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to analyze audio');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setLoading(false);
  };

  const formatPercentage = (value) => {
    if (value === undefined || value === null) return '0.00%';
    return (value * 100).toFixed(2) + '%';
  };

  // Safe access to nested properties with fallbacks
  const getResultData = () => {
    if (!result || !result.result) return null;
    
    return {
      is_fake: result.result.is_fake ?? false,
      verdict: result.result.verdict || 'UNKNOWN',
      confidence: result.result.confidence ?? 0,
      real_probability: result.result.real_probability ?? 0,
      fake_probability: result.result.fake_probability ?? 0,
      predictions: result.result.predictions || [],
      audio_features: {
        duration: result.result.audio_features?.duration ?? 0,
        rms_energy: result.result.audio_features?.rms_energy ?? 0,
        zero_crossing_rate: result.result.audio_features?.zero_crossing_rate ?? 0,
        spectral_centroid_mean: result.result.audio_features?.spectral_centroid_mean ?? 0,
        spectral_centroid_std: result.result.audio_features?.spectral_centroid_std ?? 0
      }
    };
  };

  const resultData = getResultData();

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🎵 Audio Fake Detection</h1>
          <p>Upload an audio file to detect if it's real or AI-generated</p>
        </header>

        <div className="upload-section">
          <form onSubmit={handleSubmit}>
            <div 
              className={`upload-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="audio-input"
                accept="audio/*"
                onChange={handleFileChange}
                disabled={loading}
                className="file-input"
              />
              <label htmlFor="audio-input" className="upload-label">
                {file ? (
                  <div className="file-selected">
                    <span className="file-icon">📁</span>
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <span className="upload-icon">☁️</span>
                    <p>Drag & drop an audio file here</p>
                    <p className="upload-hint">or click to browse</p>
                    <p className="file-types">Supported: WAV, MP3, OGG, FLAC, M4A (Max 50 MB)</p>
                  </div>
                )}
              </label>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="button-group">
              <button 
                type="submit" 
                disabled={!file || loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing...
                  </>
                ) : (
                  'Analyze Audio'
                )}
              </button>
              
              {(file || result) && !loading && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="btn btn-secondary"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {resultData && (
          <div className="result-section">
            <h2>Analysis Results</h2>
            
            <div className={`verdict-card ${resultData.is_fake ? 'fake' : 'real'}`}>
              <div className="verdict-icon">
                {resultData.is_fake ? '🚫' : '✅'}
              </div>
              <div className="verdict-content">
                <h3>{resultData.verdict}</h3>
                <p className="confidence">
                  Confidence: <strong>{formatPercentage(resultData.confidence)}</strong>
                </p>
              </div>
            </div>

            <div className="probabilities">
              <div className="probability-item">
                <span className="probability-label">Real Probability:</span>
                <div className="probability-bar-container">
                  <div 
                    className="probability-bar real"
                    style={{ width: formatPercentage(resultData.real_probability) }}
                  ></div>
                </div>
                <span className="probability-value">
                  {formatPercentage(resultData.real_probability)}
                </span>
              </div>

              <div className="probability-item">
                <span className="probability-label">Fake Probability:</span>
                <div className="probability-bar-container">
                  <div 
                    className="probability-bar fake"
                    style={{ width: formatPercentage(resultData.fake_probability) }}
                  ></div>
                </div>
                <span className="probability-value">
                  {formatPercentage(resultData.fake_probability)}
                </span>
              </div>
            </div>

            <div className="details-section">
              <h3>Audio Features</h3>
              <div className="features-grid">
                <div className="feature-item">
                  <span className="feature-label">Duration:</span>
                  <span className="feature-value">
                    {resultData.audio_features.duration.toFixed(2)}s
                  </span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">RMS Energy:</span>
                  <span className="feature-value">
                    {resultData.audio_features.rms_energy.toFixed(4)}
                  </span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Zero Crossing Rate:</span>
                  <span className="feature-value">
                    {resultData.audio_features.zero_crossing_rate.toFixed(4)}
                  </span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Spectral Centroid:</span>
                  <span className="feature-value">
                    {resultData.audio_features.spectral_centroid_mean.toFixed(2)} Hz
                  </span>
                </div>
              </div>
            </div>

            {resultData.predictions.length > 0 && (
              <div className="predictions-section">
                <h3>Top Predictions</h3>
                <div className="predictions-list">
                  {resultData.predictions.slice(0, 5).map((pred, index) => (
                    <div key={index} className="prediction-item">
                      <span className="prediction-rank">{index + 1}</span>
                      <span className="prediction-label">{pred.label}</span>
                      <span className="prediction-score">{formatPercentage(pred.score)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <footer className="footer">
          <p>Powered by Hugging Face Transformers & MERN Stack</p>
        </footer>
      </div>
    </div>
  );
}

export default AudioDetection;