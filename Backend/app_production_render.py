#!/usr/bin/env python3
"""
Production Flask API for Biodiversity Analysis - Render Deployment
Demo version that works without trained model weights
"""

import os
import io
import base64
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend for server deployment
import matplotlib.pyplot as plt
import pandas as pd
from werkzeug.utils import secure_filename
import logging
import wave
import random

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS for production - allow your frontend domain
CORS(app, origins=[
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "https://*.vercel.app",  # Allow all Vercel subdomains
    "https://*.netlify.app", # Allow all Netlify subdomains
    "https://*.render.com",  # Allow Render domains
    "*"  # For development - remove in production if you want stricter CORS
])

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
UPLOAD_FOLDER = '/tmp/uploads' if os.environ.get('RENDER') else 'temp_uploads'  # Use /tmp for Render
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'flac', 'm4a', 'ogg', 'webm'}

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def calculate_simple_diversity_score(filepath):
    """
    Calculate a simplified biodiversity score from audio file
    This is a demo version - replace with your trained model
    """
    try:
        # For demo purposes, generate a score based on file characteristics
        file_size = os.path.getsize(filepath)
        filename = os.path.basename(filepath).lower()
        
        # Simple scoring based on filename patterns and file size
        base_score = 0.3  # Default moderate score
        
        # Adjust score based on filename hints (for demo)
        if any(word in filename for word in ['forest', 'jungle', 'nature', 'birds', 'wildlife']):
            base_score += 0.3
        elif any(word in filename for word in ['city', 'urban', 'traffic', 'noise']):
            base_score -= 0.2
        elif any(word in filename for word in ['park', 'garden', 'outdoor']):
            base_score += 0.1
        
        # File size factor (larger files might have more diversity)
        size_factor = min(file_size / (1024 * 1024), 10) / 20  # Normalize to 0.5 max
        base_score += size_factor
        
        # Add some randomness for demo variety
        random.seed(hash(filename) % 1000)  # Consistent randomness per filename
        noise = (random.random() - 0.5) * 0.3
        base_score += noise
        
        # Clamp to valid range
        return max(0.0, min(1.0, base_score))
        
    except Exception as e:
        logger.error(f"Error calculating diversity score: {e}")
        return 0.5  # Default middle score

def create_demo_spectrogram(filepath, biodiversity_score):
    """Create a demo spectrogram plot"""
    try:
        # Generate synthetic spectrogram data for demo
        fig, ax = plt.subplots(figsize=(12, 6))
        
        # Create synthetic frequency vs time data
        duration = 60  # seconds
        freq_range = 8000  # Hz
        
        # Generate more complex patterns for higher biodiversity scores
        time = np.linspace(0, duration, 500)
        freqs = np.linspace(0, freq_range, 200)
        
        # Create base spectrogram with noise
        np.random.seed(hash(os.path.basename(filepath)) % 1000)
        spectrogram = np.random.exponential(0.1, (200, 500))
        
        # Add patterns based on biodiversity score
        if biodiversity_score > 0.6:
            # Add bird-like patterns for high biodiversity
            for i in range(int(biodiversity_score * 20)):
                start_time = np.random.randint(0, 400)
                start_freq = np.random.randint(50, 150)
                # Create chirp patterns
                for j in range(20):
                    if start_time + j < 500 and start_freq + j//2 < 200:
                        spectrogram[start_freq + j//2, start_time + j] += np.random.exponential(1)
        
        if biodiversity_score > 0.4:
            # Add insect-like high frequency patterns
            for i in range(int(biodiversity_score * 10)):
                start_time = np.random.randint(0, 450)
                freq_band = np.random.randint(120, 180)
                for j in range(50):
                    if start_time + j < 500:
                        spectrogram[freq_band:freq_band+5, start_time + j] += 0.5
        
        # Create the plot
        im = ax.imshow(spectrogram, aspect='auto', origin='lower', cmap='viridis',
                      extent=[0, duration, 0, freq_range])
        
        plt.colorbar(im, ax=ax, label='Amplitude (dB)')
        ax.set_xlabel('Time (seconds)')
        ax.set_ylabel('Frequency (Hz)')
        ax.set_title(f'Audio Spectrogram - Biodiversity Score: {biodiversity_score:.3f}')
        
        # Save plot to base64
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight', dpi=150)
        plt.close(fig)
        
        buf.seek(0)
        img_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        
        return img_b64
        
    except Exception as e:
        logger.error(f"Error creating spectrogram: {e}")
        return None

def create_gradcam_heatmap(biodiversity_score):
    """Create a mock Grad-CAM heatmap visualization"""
    try:
        fig, ax = plt.subplots(figsize=(8, 5))
        
        # Create base heatmap data
        height, width = 50, 80
        
        # Generate heatmap based on biodiversity score
        np.random.seed(42)  # Consistent results
        
        # Base attention map
        attention_map = np.zeros((height, width))
        
        # Add attention hotspots based on biodiversity score
        n_hotspots = int(biodiversity_score * 15) + 5  # 5-20 hotspots
        
        for i in range(n_hotspots):
            # Random hotspot location
            center_x = np.random.randint(5, width - 5)
            center_y = np.random.randint(5, height - 5)
            
            # Create gaussian-like hotspot
            intensity = biodiversity_score * np.random.uniform(0.5, 1.0)
            radius = np.random.uniform(3, 8)
            
            y, x = np.ogrid[:height, :width]
            mask = (x - center_x)**2 + (y - center_y)**2 <= radius**2
            
            # Apply gaussian decay
            for yi in range(height):
                for xi in range(width):
                    dist = np.sqrt((xi - center_x)**2 + (yi - center_y)**2)
                    if dist <= radius:
                        attention_map[yi, xi] += intensity * np.exp(-dist**2 / (2 * (radius/3)**2))
        
        # Normalize to 0-1
        if attention_map.max() > 0:
            attention_map = attention_map / attention_map.max()
        
        # Create the heatmap
        im = ax.imshow(attention_map, cmap='hot', interpolation='bicubic', aspect='auto')
        
        # Add overlay grid for scientific look
        ax.set_xticks(np.arange(0, width, 10))
        ax.set_yticks(np.arange(0, height, 5))
        ax.grid(True, alpha=0.3, color='cyan', linewidth=0.5)
        
        # Styling
        ax.set_xlabel('Time Frames', color='white', fontsize=10)
        ax.set_ylabel('Frequency Bins', color='white', fontsize=10)
        ax.set_title(f'Grad-CAM Attention Map - Score: {biodiversity_score:.3f}', 
                    color='white', fontsize=12, pad=20)
        
        # Color bar
        cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
        cbar.set_label('Attention Intensity', color='white', fontsize=9)
        cbar.ax.tick_params(colors='white', labelsize=8)
        
        # Set background
        fig.patch.set_facecolor('black')
        ax.set_facecolor('black')
        ax.tick_params(colors='white', labelsize=8)
        
        # Save to base64
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight', dpi=150, 
                   facecolor='black', edgecolor='none')
        plt.close(fig)
        
        buf.seek(0)
        img_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        
        return img_b64
        
    except Exception as e:
        logger.error(f"Error creating Grad-CAM heatmap: {e}")
        return None

def get_benchmark_data():
    """Get benchmark data for comparison"""
    benchmarks = {
        'urban_low': 0.1,
        'urban_park': 0.3,
        'forest_edge': 0.5,
        'primary_forest': 0.8,
        'pristine_ecosystem': 0.95
    }
    return benchmarks
    """Get benchmark data for comparison"""
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
    # Create sample distribution
    np.random.seed(42)  # For consistent results
    
    # Simulate score distribution
    n_samples = 1000
    distribution_scores = []
    
    # Add benchmark concentrations
    for label, score in benchmarks.items():
        samples = np.random.normal(score, 0.05, n_samples // len(benchmarks))
        samples = np.clip(samples, 0, 1)
        distribution_scores.extend(samples)
    
    # Add some random samples
    random_samples = np.random.beta(2, 2, n_samples // 2)
    distribution_scores.extend(random_samples)
    
    distribution_scores = np.array(distribution_scores)
    
    # Create histogram data
    hist_counts, hist_bins = np.histogram(distribution_scores, bins=50)
    bin_centers = (hist_bins[:-1] + hist_bins[1:]) / 2
    
    plot_data = {
        'histogram': {
            'x': [float(x) for x in bin_centers.tolist()],
            'y': [int(y) for y in hist_counts.tolist()],
            'type': 'bar',
            'name': 'Score Distribution',
            'marker': {'color': 'lightblue', 'opacity': 0.7}
        },
        'user_score': {
            'x': [float(user_score), float(user_score)],
            'y': [0, int(max(hist_counts)) if len(hist_counts) > 0 else 100],
            'type': 'scatter',
            'mode': 'lines',
            'name': 'Your Recording',
            'line': {'color': 'red', 'width': 3}
        },
        'benchmarks': [
            {
                'x': [float(score), float(score)],
                'y': [0, int(max(hist_counts) * 0.8) if len(hist_counts) > 0 else 80],
                'type': 'scatter',
                'mode': 'lines',
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
            logger.info(f"Analyzing audio file: {filename}")
            
            # Calculate biodiversity score (simplified version)
            biodiversity_score = calculate_simple_diversity_score(temp_path)
            
            # Create spectrogram plot
            logger.info("Creating spectrogram plot...")
            spectrogram_b64 = create_demo_spectrogram(temp_path, biodiversity_score)
            
            # Create Grad-CAM heatmap
            logger.info("Creating Grad-CAM heatmap...")
            gradcam_b64 = create_gradcam_heatmap(biodiversity_score)
            
            # Get benchmark data
            benchmarks = get_benchmark_data()
            
            # Create distribution plot data
            logger.info("Creating distribution data...")
            distribution_data = create_distribution_data(biodiversity_score, benchmarks)
            
            # Get file info
            file_size = os.path.getsize(temp_path)
            
            # Prepare response - ensure all values are JSON serializable
            response = {
                'biodiversity_score': float(biodiversity_score),
                'adi_score': float(biodiversity_score),  # Same for demo
                'spectrogram_b64': spectrogram_b64,
                'gradcam_b64': gradcam_b64,
                'distribution_data': distribution_data,
                'benchmarks': {k: float(v) for k, v in benchmarks.items()},
                'filename': str(filename),
                'duration': float(60.0),  # Assumed duration for demo
                'sample_rate': int(16000),  # Assumed sample rate for demo
                'file_size_mb': float(round(file_size / (1024 * 1024), 2))
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
    return jsonify({'status': 'healthy', 'message': 'Biodiversity Analysis API is running (Production Mode)'})

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        'message': 'Biodiversity Analysis API - Production Mode',
        'version': '1.0.0',
        'environment': 'render' if os.environ.get('RENDER') else 'development',
        'endpoints': {
            '/analyze': 'POST - Upload audio file for analysis',
            '/health': 'GET - Health check'
        }
    })

# For production deployment
if __name__ == '__main__':
    # Get port from environment variable (Render sets this)
    port = int(os.environ.get('PORT', 5000))
    # Bind to 0.0.0.0 for external access
    app.run(host='0.0.0.0', port=port, debug=False)