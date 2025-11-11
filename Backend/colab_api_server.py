# Add this cell to your Colab notebook to create an API server

# Install required packages
!pip install flask flask-cors pyngrok

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import librosa
import json
import base64
import io
from pyngrok import ngrok

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "model": "loaded"})

@app.route('/analyze', methods=['POST'])
def analyze_audio():
    """Analyze audio file and return biodiversity predictions"""
    try:
        # Get uploaded file
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        file = request.files['audio']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Read audio file
        audio_data = file.read()
        
        # Process audio file (adapt this to match your existing processing code)
        # This should use your existing preprocessing function from the Colab
        features, adi_score = process_audio_for_prediction(audio_data, file.filename)
        
        # Get model prediction (adapt this to use your trained model)
        biodiversity_score = model.predict(features).flatten()[0]
        
        # Generate visualizations (adapt to use your existing functions)
        spectrogram_base64 = generate_spectrogram(audio_data, file.filename)
        heatmap_base64 = generate_grad_cam_heatmap(features, model)
        
        # Create distribution data
        distribution_data = create_distribution_plot_data(biodiversity_score)
        
        return jsonify({
            "biodiversity_score": float(biodiversity_score),
            "filename": file.filename,
            "spectrogram": spectrogram_base64,
            "distribution_data": distribution_data,
            "heatmap": heatmap_base64,
            "raw_adi": float(adi_score) if adi_score else None
        })
        
    except Exception as e:
        print(f"Error processing audio: {e}")
        return jsonify({"error": str(e)}), 500

def process_audio_for_prediction(audio_data, filename):
    """
    Process audio data for model prediction
    Adapt this function to match your existing Colab preprocessing
    """
    # Convert bytes to audio array
    audio, sr = librosa.load(io.BytesIO(audio_data), sr=16000, duration=60)
    
    # Your existing audio processing code here...
    # This should match exactly what you do in your Colab for preprocessing
    
    # Calculate ADI score
    adi_score = calculate_adi(audio, sr)  # Use your existing ADI function
    
    # Create spectrogram features for model
    features = create_spectrogram_features(audio, sr)  # Use your existing function
    
    return features, adi_score

def generate_spectrogram(audio_data, filename):
    """Generate spectrogram image as base64 string"""
    # Use your existing spectrogram generation code
    # Return as base64 encoded image
    pass

def generate_grad_cam_heatmap(features, model):
    """Generate Grad-CAM heatmap as base64 string"""
    # Use your existing Grad-CAM code
    # Return as base64 encoded image
    pass

def create_distribution_plot_data(score):
    """Create distribution plot data"""
    # Use your existing distribution plot code
    # Return plot data for frontend
    pass

# Start the server with ngrok tunnel
if __name__ == '__main__':
    # Create ngrok tunnel
    public_url = ngrok.connect(5000)
    print(f"🌐 Public URL: {public_url}")
    print(f"📱 Send this URL to your frontend!")
    
    # Start Flask app
    app.run(host='0.0.0.0', port=5000)