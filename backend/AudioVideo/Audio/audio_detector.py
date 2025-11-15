import sys
import json
import torch
import librosa
import numpy as np
import warnings
warnings.filterwarnings('ignore')

class AudioFakeDetector:
    def __init__(self):
        print("Loading audio fake detection model...", file=sys.stderr)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        try:
            from transformers import AutoFeatureExtractor, AutoModelForAudioClassification
            
            # Using a pre-trained audio classification model
            model_name = "MIT/ast-finetuned-audioset-10-10-0.4593"
            
            self.feature_extractor = AutoFeatureExtractor.from_pretrained(model_name)
            self.model = AutoModelForAudioClassification.from_pretrained(model_name)
            self.model.to(self.device)
            self.model.eval()
            print(f"Model loaded successfully on {self.device}", file=sys.stderr)
        except Exception as e:
            print(f"Error loading model: {e}", file=sys.stderr)
            print("IMPORTANT: Install transformers with: pip install transformers torch", file=sys.stderr)
            raise
    
    def load_audio(self, audio_path, target_sr=16000):
        """Load and preprocess audio file"""
        try:
            # Load audio and convert to mono
            audio, sr = librosa.load(audio_path, sr=target_sr, mono=True)
            
            # Ensure minimum length (1 second)
            min_samples = target_sr
            if len(audio) < min_samples:
                audio = np.pad(audio, (0, min_samples - len(audio)), mode='constant')
            
            return audio, sr
        except Exception as e:
            print(f"Error loading audio: {e}", file=sys.stderr)
            raise
    
    def analyze_audio_features(self, audio, sr):
        """Extract audio features for analysis"""
        features = {}
        
        try:
            # Basic features
            features['duration'] = float(len(audio) / sr)
            features['rms_energy'] = float(np.sqrt(np.mean(audio**2)))
            
            # Zero crossing rate
            zcr = librosa.feature.zero_crossing_rate(audio)
            features['zero_crossing_rate'] = float(np.mean(zcr))
            
            # Spectral features
            spectral_centroids = librosa.feature.spectral_centroid(y=audio, sr=sr)[0]
            features['spectral_centroid_mean'] = float(np.mean(spectral_centroids))
            features['spectral_centroid_std'] = float(np.std(spectral_centroids))
            
        except Exception as e:
            print(f"Warning: Error extracting some features: {e}", file=sys.stderr)
            # Return basic features even if some fail
            features.setdefault('duration', 0.0)
            features.setdefault('rms_energy', 0.0)
            features.setdefault('zero_crossing_rate', 0.0)
            features.setdefault('spectral_centroid_mean', 0.0)
            features.setdefault('spectral_centroid_std', 0.0)
        
        return features
    
    def detect_fake(self, audio_path):
        """Main detection function"""
        try:
            # Load audio
            print(f"Loading audio from: {audio_path}", file=sys.stderr)
            audio, sr = self.load_audio(audio_path)
            print(f"Audio loaded: {len(audio)} samples at {sr}Hz", file=sys.stderr)
            
            # Get audio features
            features = self.analyze_audio_features(audio, sr)
            print("Audio features extracted", file=sys.stderr)
            
            # Prepare input for model
            inputs = self.feature_extractor(
                audio, 
                sampling_rate=sr, 
                return_tensors="pt",
                padding=True
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            print("Input prepared for model", file=sys.stderr)
            
            # Get predictions
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                probabilities = torch.nn.functional.softmax(logits, dim=-1)
            
            print("Model inference completed", file=sys.stderr)
            
            # Get top predictions
            top_probs, top_indices = torch.topk(probabilities[0], k=min(5, probabilities.shape[1]))
            
            predictions = []
            for prob, idx in zip(top_probs, top_indices):
                label = self.model.config.id2label.get(idx.item(), f"Class_{idx.item()}")
                predictions.append({
                    'label': label,
                    'score': float(prob.item())
                })
            
            # Enhanced heuristic for fake detection
            # Look for indicators of natural speech/music vs synthetic
            speech_indicators = ['Speech', 'Conversation', 'Narration', 'Monologue', 'Chatter']
            music_indicators = ['Music', 'Musical', 'Song', 'Singing']
            synthetic_indicators = ['Synthesizer', 'Electronic', 'Computer']
            
            speech_score = sum(pred['score'] for pred in predictions 
                             if any(indicator in pred['label'] for indicator in speech_indicators))
            music_score = sum(pred['score'] for pred in predictions 
                            if any(indicator in pred['label'] for indicator in music_indicators))
            synthetic_score = sum(pred['score'] for pred in predictions 
                                if any(indicator in pred['label'] for indicator in synthetic_indicators))
            
            # Natural score combines speech and music
            natural_score = speech_score + music_score
            
            # If synthetic indicators are high or natural indicators are very low, likely fake
            if synthetic_score > 0.4 or natural_score < 0.2:
                is_fake = True
                real_score = 1 - synthetic_score if synthetic_score > 0 else natural_score
            else:
                is_fake = natural_score < 0.35
                real_score = natural_score
            
            # Ensure real_score is between 0 and 1
            real_score = max(0.0, min(1.0, real_score))
            
            confidence = abs(real_score - 0.5) * 2  # 0 to 1 scale
            
            result = {
                'success': True,
                'is_fake': bool(is_fake),
                'confidence': float(confidence),
                'verdict': 'FAKE' if is_fake else 'REAL',
                'real_probability': float(real_score),
                'fake_probability': float(1 - real_score),
                'predictions': predictions,
                'audio_features': features
            }
            
            print("Detection completed successfully", file=sys.stderr)
            return result
            
        except Exception as e:
            print(f"Error in detection: {e}", file=sys.stderr)
            import traceback
            traceback.print_exc(file=sys.stderr)
            return {
                'success': False,
                'error': str(e)
            }

def main():
    if len(sys.argv) < 2:
        result = {
            'success': False,
            'error': 'No audio file path provided'
        }
        print(json.dumps(result))
        sys.exit(1)
    
    audio_path = sys.argv[1]
    
    print(f"\n{'='*60}", file=sys.stderr)
    print(f"Audio Fake Detector Starting", file=sys.stderr)
    print(f"Audio Path: {audio_path}", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)
    
    try:
        detector = AudioFakeDetector()
        result = detector.detect_fake(audio_path)
        
        # Output JSON to stdout
        print(json.dumps(result))
        
        if result.get('success'):
            sys.exit(0)
        else:
            sys.exit(1)
            
    except Exception as e:
        result = {
            'success': False,
            'error': str(e)
        }
        print(json.dumps(result))
        sys.exit(1)

if __name__ == '__main__':
    main()