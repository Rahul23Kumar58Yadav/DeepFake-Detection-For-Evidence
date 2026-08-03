# 🤖 DeepFake Detection for Evidence

**An AI-powered full-stack forensic platform for detecting deepfake audio and video using deep learning, computer vision, signal processing, and transformer-based models.**

The system analyzes submitted media and classifies it as **Real or Fake with a confidence score**, combining deep learning models, signal processing, and a web interface for legal, forensic, fraud investigation, and cybersecurity use cases.

> **AI/ML Core:** PyTorch • TensorFlow • MesoNet • EfficientNet • Spectrogram Analysis • Transformer Models • OpenCV • Librosa

---

## 🧠 AI/ML at a Glance

The core of this project is an **AI/ML-based multimodal deepfake detection pipeline** that analyzes both video and audio for signs of manipulation.

### AI Technologies Used

- **Deep Learning**
- **Computer Vision**
- **Natural Audio/Speech Processing**
- **Spectrogram Analysis**
- **Transformer-based Classification**
- **CNN-based Classification**
- **MesoNet**
- **EfficientNet**
- **PyTorch**
- **TensorFlow**
- **OpenCV**
- **Librosa**

### 🎥 Video AI

- CNN-based deepfake classification
- MesoNet-based manipulation detection
- EfficientNet-based classification
- Frame-level analysis
- Facial manipulation artifact detection
- Computer vision preprocessing using OpenCV

### 🔊 Audio AI

- Audio signal preprocessing
- Spectrogram-based feature extraction
- Transformer-based classification
- Synthetic speech detection
- Audio processing using Librosa

---

## 🚀 Overview

Manipulated audio and video are increasingly relevant in legal disputes, fraud cases, and cybercrime investigations — and standard media players give investigators no way to verify authenticity.

This system provides a structured pipeline for analyzing submitted media and producing a classification result with a quantified confidence score, suitable for use as supporting evidence in an investigative or legal workflow.

The platform combines:

- Deep learning models
- Signal processing
- Computer vision
- Audio analysis
- Transformer-based models
- REST APIs
- Full-stack web development

---

## 🔄 AI Detection Pipeline

```text
                    📁 Uploaded Media
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
           🎥 Video                🔊 Audio
                │                     │
                ▼                     ▼
        Frame Extraction       Audio Processing
                │                     │
                ▼                     ▼
       OpenCV Preprocessing      Spectrogram
                │                     │
          ┌─────┴─────┐              ▼
          │           │       Transformer Model
          ▼           ▼              │
       MesoNet    EfficientNet       │
          │           │              │
          └─────┬─────┘              │
                │                     │
                └──────────┬──────────┘
                           ▼
                    AI Classification
                           │
                           ▼
                    Real / Fake
                           │
                           ▼
                  Confidence Score
