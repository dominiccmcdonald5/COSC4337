from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import librosa
import librosa.display
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import base64
import io
import cv2
import pandas as pd
from werkzeug.utils import secure_filename
import tempfile
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
UPLOAD_FOLDER = 'temp_uploads'
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'flac', 'm4a', 'ogg'}

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global variables for model (will be loaded when available)
model = None
feature_extractor = None
min_adi = None
max_adi = None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def calculate_adi(audio, sr, n_fft=2048, hop_length=512):
    """Calculate Acoustic Diversity Index (ADI) from audio"""
    try:
        # Simple ADI calculation for demo purposes
        # In production, you'd use the maad library as in the notebook
        
        # Calculate spectrogram
        stft = librosa.stft(audio, n_fft=n_fft, hop_length=hop_length)
        magnitude = np.abs(stft)
        
        # Focus on biophony frequency range (2kHz-11kHz)
        freqs = librosa.fft_frequencies(sr=sr, n_fft=n_fft)
        freq_mask = (freqs >= 2000) & (freqs <= 11000)
        
        if np.sum(freq_mask) == 0:
            return 0.0
            
        # Calculate diversity across frequency bands
        biophony_spec = magnitude[freq_mask, :]
        
        # Divide into bands and calculate diversity
        n_bands = 10
        band_size = biophony_spec.shape[0] // n_bands
        
        if band_size == 0:
            return 0.0
            
        diversities = []
        for i in range(n_bands):
            start_idx = i * band_size
            end_idx = min((i + 1) * band_size, biophony_spec.shape[0])
            band_energy = np.mean(biophony_spec[start_idx:end_idx, :])
            if band_energy > 0:
                diversities.append(band_energy)
        
        if len(diversities) == 0:
            return 0.0
            
        # Calculate diversity using Shannon-like index
        diversities = np.array(diversities)
        diversities = diversities / np.sum(diversities) if np.sum(diversities) > 0 else diversities
        
        # Avoid log(0)
        diversities = diversities[diversities > 0]
        if len(diversities) == 0:
            return 0.0
            
        adi = -np.sum(diversities * np.log(diversities))
        
        # Normalize to 0-1 range
        max_possible_adi = np.log(n_bands)
        normalized_adi = adi / max_possible_adi if max_possible_adi > 0 else 0.0
        
        return float(np.clip(normalized_adi, 0.0, 1.0))
        
    except Exception as e:
        logger.error(f"Error calculating ADI: {e}")
        return 0.0

def create_spectrogram_plot(audio, sr, biodiversity_score, true_score=None):
    """Create matplotlib spectrogram plot and return as base64"""
    try:
        # Create mel spectrogram
        mel_spec = librosa.feature.melspectrogram(
            y=audio, sr=sr, n_fft=2048, hop_length=512, n_mels=224
        )
        log_mel_spec = librosa.power_to_db(mel_spec, ref=np.max)
        
        # Create plot
        fig, ax = plt.subplots(figsize=(12, 6))
        
        librosa.display.specshow(
            log_mel_spec, 
            sr=sr, 
            x_axis='time', 
            y_axis='mel', 
            fmax=8000,
            ax=ax,
            cmap='viridis'
        )
        
        plt.colorbar(ax.collections[0], ax=ax, format='%+2.0f dB')
        
        title = f'Audio Spectrogram - Predicted Biodiversity Score: {biodiversity_score:.3f}'
        if true_score is not None:
            title += f' (Calculated ADI: {true_score:.3f})'
        
        ax.set_title(title, fontsize=14)
        ax.set_xlabel('Time (s)')
        ax.set_ylabel('Frequency (Hz)')
        
        # Save plot to base64
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight', dpi=150)
        plt.close(fig)
        
        buf.seek(0)
        img_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        
        return img_b64
        
    except Exception as e:
        logger.error(f"Error creating spectrogram plot: {e}")
        return None

def get_benchmark_data():
    """Get benchmark data for comparison"""
    # These would come from your trained model's calibration data
    # For now, using example values
    benchmarks = {
        'urban_low': 0.1,
        'urban_park': 0.3,
        'forest_edge': 0.5,
        'primary_forest': 0.8,
        'pristine_ecosystem': 0.95
    }
    
    return benchmarks

def create_distribution_data(user_score, benchmarks):
    """Create data for Plotly distribution plot"""
    
    # Create sample distribution (in reality, this would come from your training data)
    np.random.seed(42)  # For consistent results
    
    # Simulate score distribution
    n_samples = 1000
    distribution_scores = []
    
    # Add benchmark concentrations
    for label, score in benchmarks.items():
        # Add some samples around each benchmark
        samples = np.random.normal(score, 0.05, n_samples // len(benchmarks))
        samples = np.clip(samples, 0, 1)
        distribution_scores.extend(samples)
    
    # Add some random samples for realistic distribution
    random_samples = np.random.beta(2, 2, n_samples // 2)  # Beta distribution for realistic shape
    distribution_scores.extend(random_samples)
    
    distribution_scores = np.array(distribution_scores)
    
    # Create histogram data
    hist_counts, hist_bins = np.histogram(distribution_scores, bins=50)
    bin_centers = (hist_bins[:-1] + hist_bins[1:]) / 2
    
    plot_data = {
        'histogram': {
            'x': bin_centers.tolist(),
            'y': hist_counts.tolist(),
            'type': 'bar',
            'name': 'Score Distribution'
        },
        'user_score': {
            'x': [user_score, user_score],
            'y': [0, max(hist_counts)],
            'type': 'line',
            'name': 'Your Recording',
            'line': {'color': 'red', 'width': 3}
        },
        'benchmarks': [
            {
                'x': [score, score],
                'y': [0, max(hist_counts) * 0.8],
                'type': 'line',
                'name': label.replace('_', ' ').title(),
                'line': {'dash': 'dash', 'width': 2}
            }
            for label, score in benchmarks.items()
        ]
    }
    
    return plot_data

@app.route('/analyze', methods=['POST'])
def analyze_audio():
    """Main endpoint to analyze uploaded audio file"""
    try:
        # Check if file is present
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        file = request.files['audio']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed types: ' + ', '.join(ALLOWED_EXTENSIONS)}), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(temp_path)
        
        try:
            # Load audio
            logger.info(f"Loading audio file: {filename}")
            audio, sr = librosa.load(temp_path, sr=16000, duration=60)  # Limit to 60 seconds
            
            # Calculate ADI score
            logger.info("Calculating ADI score...")
            adi_score = calculate_adi(audio, sr)
            
            # For now, use ADI as biodiversity score (in production, use your trained model)
            biodiversity_score = adi_score
            
            # Create spectrogram plot
            logger.info("Creating spectrogram plot...")
            spectrogram_b64 = create_spectrogram_plot(audio, sr, biodiversity_score, adi_score)
            
            # Get benchmark data
            benchmarks = get_benchmark_data()
            
            # Create distribution plot data
            logger.info("Creating distribution data...")
            distribution_data = create_distribution_data(biodiversity_score, benchmarks)
            
            # Prepare response
            response = {
                'biodiversity_score': float(biodiversity_score),
                'adi_score': float(adi_score),
                'spectrogram_b64': spectrogram_b64,
                'distribution_data': distribution_data,
                'benchmarks': benchmarks,
                'filename': filename,
                'duration': len(audio) / sr,
                'sample_rate': sr
            }
            
            logger.info(f"Analysis complete. Score: {biodiversity_score:.3f}")
            return jsonify(response)
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except Exception as e:
        logger.error(f"Error analyzing audio: {e}")
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Biodiversity Analysis API is running'})

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        'message': 'Biodiversity Analysis API',
        'endpoints': {
            '/analyze': 'POST - Upload audio file for analysis',
            '/health': 'GET - Health check'
        }
    })

if __name__ == '__main__':
    logger.info("Starting Biodiversity Analysis API...")
    app.run(debug=True, host='0.0.0.0', port=5000)