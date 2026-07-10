# 🕵️ DeepFake Detection for Evidence

**A full-stack system for detecting deepfake audio and video, purpose-built for legal and forensic evidentiary use.**

Combines deep learning models, signal processing, and a web interface to classify media as **Real** or **Fake**, with a confidence score attached to every result — designed for contexts where the output may need to withstand scrutiny.

---

## 🚀 Overview

Manipulated audio and video are increasingly relevant in legal disputes, fraud cases, and cybercrime investigations — and standard media players give investigators no way to verify authenticity. This system provides a structured pipeline for analyzing submitted media and producing a classification result with a quantified confidence score, suitable for use as supporting evidence in an investigative or legal workflow.

---

## 🎯 Key Features

### 🎥 Video Deepfake Detection
- CNN and EfficientNet-based classification models
- Frame-level analysis for manipulation artifacts

### 🔊 Audio Deepfake Detection
- Spectrogram-based feature extraction
- Transformer-based classification for synthetic speech detection

### 📊 Confidence Scoring
- Every classification returns a confidence score, not just a binary label
- Supports risk-weighted decision-making rather than blind trust in a single output

### 📁 Multi-Format Support
- Accepts `MP4`, `WAV`, `MP3`, and other common evidentiary media formats

### 🧪 Batch Testing Mode
- Run classification across full datasets for validation, benchmarking, or bulk case review

### ⚠️ Evidence-Oriented Output
- Results structured for use in forensic reporting and investigative documentation

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **ML/DL Models** | PyTorch / TensorFlow |
| **Video Detection** | MesoNet, EfficientNet |
| **Audio Detection** | Spectrogram + Transformer-based models |
| **Backend** | Python (Flask / FastAPI) |
| **Frontend** | React, Vite |
| **Styling** | Tailwind CSS *(optional)* |

---

## 🔒 Forensic Use Case

This system is built for **digital forensic analysts, law enforcement, and legal investigators** who need to verify the authenticity of submitted media evidence.

It supports:

- **Court evidence validation** — assessing whether submitted media has been manipulated
- **Media authenticity verification** — general-purpose deepfake screening
- **Cybercrime investigation** — identifying synthetic media used in fraud, impersonation, or disinformation
- **Fraud detection** — flagging manipulated audio/video used in financial or identity fraud

> ⚠️ **Disclaimer:** This tool provides a probabilistic classification, not a definitive legal determination. Results should be interpreted by a qualified forensic analyst and used as one input among several in any evidentiary process — not as a standalone verdict of authenticity.

---

## 🛠️ Getting Started

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py          # or: uvicorn app:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

> Add model weights and any required environment variables (API endpoints, model paths) in a `.env` file before running.

---

## 📈 Roadmap

- [ ] Explainability layer (highlight manipulated frames/segments, not just a score)
- [ ] Chain-of-custody metadata logging for submitted evidence
- [ ] Support for additional media formats and codecs
- [ ] Model performance benchmarking against public deepfake datasets

---

## 📄 License

MIT
