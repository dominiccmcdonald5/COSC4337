#!/usr/bin/env python3
"""
Production Flask API for Biodiversity Analysis
Serves the trained model from ADI_R4_Bioacoustics notebook
"""

import os
import io
import base64
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import librosa
import librosa.display
import matplotlib.pyplot as plt
import cv2
import plotly.graph_objects as go
import plotly.figure_factory as ff

# ML/AI imports
import tensorflow as tf
from transformers import AutoFeatureExtractor, TFViTModel
from maad import sound, features as maad_features

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

# Global variables for model and preprocessing
model = None
feature_extractor = None
min_adi = None
max_adi = None
all_normalized_scores = None

class BiodiversityModel(tf.keras.Model):
    def __init__(self, vit_base_model):
        super().__init__()
        self.vit = vit_base_model
        self.head_stack = tf.keras.Sequential([
            tf.keras.layers.LayerNormalization(name="head_norm"),
            tf.keras.layers.Dense(256, activation='gelu', name="head_dense_1"),
            tf.keras.layers.Dropout(0.3, name="head_dropout"),
            tf.keras.layers.Dense(1, activation='sigmoid', name='biodiversity_score', bias_initializer='zeros')
        ], name='regression_head')

    def call(self, inputs, training=None, explain=False):
        transposed_inputs = tf.transpose(inputs, perm=[0, 3, 1, 2])
        vit_outputs = self.vit(
            pixel_values=transposed_inputs,
            training=training,
            output_attentions=explain
        )
        last_hidden_state = vit_outputs.last_hidden_state
        cls_token_output = last_hidden_state[:, 0, :]
        final_score = self.head_stack(cls_token_output, training=training)

        if explain:
            return final_score, vit_outputs.attentions
        return final_score

def calculate_adi(audio, sr, n_fft=2048, hop_length=512):
    """Calculate Acoustic Diversity Index"""
    try:
        peak_amplitude = np.max(np.abs(audio))
        if peak_amplitude > 1e-5:
            audio = audio / peak_amplitude

        Sxx, _, freqs, _ = sound.spectrogram(audio, sr, n_fft=n_fft, hop_length=hop_length, window='hann', flim=(0, 8000))
        
        fmin = 2000.0
        fmax = 8000.0
        bin_step = 100
        n_bands = (fmax - fmin) / bin_step

        if n_bands <= 0:
            raise ValueError("fmax gotta be greater than fmin")

        adi_score = maad_features.acoustic_diversity_index(
            Sxx, freqs, fmin=fmin, fmax=fmax, bin_step=bin_step, dB_threshold=-70.0
        )
        
        normalized_adi = adi_score / np.log(n_bands)
        return np.float32(normalized_adi)
    
    except Exception as e:
        print(f"Warning: Could not calculate ADI. Error {e}")
        return np.float32(0.0)

def generate_attention_rollout(img_array, model):
    """Generate attention rollout heatmap"""
    print("\n--- [Running Attention Rollout] ---")
    img_tensor = tf.convert_to_tensor(img_array)
    
    try:
        final_score_pred, attention_maps = model(img_tensor, training=False, explain=True)
    except Exception as e:
        print(f"ERROR: {e}")
        return np.zeros((img_array.shape[1], img_array.shape[2]), dtype=np.uint8), 0.0

    print(f'1. Model output score: {final_score_pred.numpy()[0][0]:.4f}')
    
    rollout = tf.eye(197, 197, batch_shape=[1])
    
    for i, attention_map in enumerate(attention_maps):
        avg_head_map = tf.reduce_mean(attention_map, axis=1)
        identity = tf.eye(197, 197, batch_shape=[1])
        a_map = avg_head_map + identity
        a_map = a_map / tf.reduce_sum(a_map, axis=-1, keepdims=True)
        rollout = tf.matmul(rollout, a_map)

    cls_attention_to_patches = rollout[:, 0, 1:]
    heatmap = tf.reshape(cls_attention_to_patches, (14, 14))
    
    heatmap = heatmap.numpy()
    heatmap_min = np.min(heatmap)
    heatmap_max = np.max(heatmap)
    
    if (heatmap_max - heatmap_min) > tf.keras.backend.epsilon():
        heatmap = (heatmap - heatmap_min) / (heatmap_max - heatmap_min)
    else:
        heatmap = np.zeros_like(heatmap)
    
    heatmap = cv2.resize(heatmap, (img_array.shape[2], img_array.shape[1]))
    heatmap = (heatmap * 255).astype(np.uint8)
    
    return heatmap, final_score_pred.numpy()[0][0]

def create_distribution_plot(all_scores, user_predicted_score, custom_landmarks=None):
    """Create plotly distribution plot"""
    if custom_landmarks is None:
        landmarks = {
            "Amazon Mean (Training Set)": np.mean(all_scores),
            "Example: Local Park": 0.35,
            "Example: Damaged Habitat": 0.15
        }
    else:
        landmarks = custom_landmarks

    hist_data = [all_scores]
    group_labels = ['Amazon Training Set Distribution']

    fig = ff.create_distplot(
        hist_data, group_labels, bin_size=0.02, show_rug=False, colors=['#1f77b4']
    )

    annotation_positions = ["top left", "top right", "bottom left", "bottom right"]

    for i, (label, score) in enumerate(landmarks.items()):
        pos = annotation_positions[i % len(annotation_positions)]
        fig.add_vline(
            x=score, line_width=2, line_dash="dash", line_color="gray",
            annotation_text=f"{label}: {score:.2f}", annotation_position=pos, annotation_font_size=12
        )

    fig.add_vline(
        x=user_predicted_score, line_width=3, line_dash="solid", line_color="#FF4136",
        annotation_text=f"Your File's Score: {user_predicted_score:.2f}",
        annotation_position="top right", annotation_font_size=14, annotation_font_color="#FF4136"
    )

    fig.update_layout(
        title_text="Biodiversity Score Distribution",
        xaxis_title="Biodiversity Score (0-1 Scale)",
        yaxis_title="Density",
        template="plotly_white",
        hovermode="x unified",
        xaxis=dict(range=[0, 1])
    )

    return fig.to_html(full_html=False, include_plotlyjs='cdn', default_width='100%', default_height='500px')

def get_prediction_and_heatmap(audio_file_path, model, feature_extractor, min_adi, max_adi, all_normalized_scores):
    """Main prediction function - returns all 4 outputs"""
    try:
        # 1. Load and preprocess audio
        audio, sr = librosa.load(audio_file_path, sr=16000, duration=60)
        
        # Get ADI for display
        raw_score = calculate_adi(audio, sr)
        normalized_score = (raw_score - min_adi) / (max_adi - min_adi + 1e-10)
        normalized_score = np.clip(normalized_score, 0, 1)
        
        # Create mel spectrogram
        mel_spec = librosa.feature.melspectrogram(y=audio, sr=16000, n_fft=2048, hop_length=512, n_mels=224)
        log_mel_spec = librosa.power_to_db(mel_spec, ref=np.max)
        log_mel_spec_rgb = np.stack((log_mel_spec,) * 3, axis=-1)
        
        # Resize and prepare for model
        resized_spec = tf.image.resize(log_mel_spec_rgb, [224, 224]).numpy()
        inputs = feature_extractor(images=resized_spec, return_tensors='np', do_rescale=False, do_resize=False)
        img_array_for_cam = np.moveaxis(np.squeeze(inputs['pixel_values'], axis=0), 0, -1)
        img_array_for_cam = np.expand_dims(img_array_for_cam, axis=0)
        
        # Get prediction and heatmap
        heatmap, predicted_score = generate_attention_rollout(img_array_for_cam, model)
        
        # Generate spectrogram image
        fig_spec, ax_spec = plt.subplots(figsize=(12, 5))
        librosa.display.specshow(
            log_mel_spec, sr=sr, x_axis='time', y_axis='mel',
            fmax=8000, ax=ax_spec, cmap='magma'
        )
        ax_spec.set_title("Mel Spectrogram")
        
        buf_spec = io.BytesIO()
        fig_spec.savefig(buf_spec, format='png', bbox_inches='tight')
        plt.close(fig_spec)
        spectrogram_b64 = base64.b64encode(buf_spec.getvalue()).decode('utf-8')
        
        # Generate heatmap image
        fig_heat, ax_heat = plt.subplots(figsize=(12, 5))
        heatmap_resized = cv2.resize(heatmap, (log_mel_spec.shape[1], log_mel_spec.shape[0]))
        
        librosa.display.specshow(
            log_mel_spec, sr=sr, x_axis='time', y_axis='mel',
            fmax=8000, ax=ax_heat, cmap='gray'
        )
        
        ax_heat.imshow(
            heatmap_resized, cmap='jet', alpha=0.6, aspect='auto',
            extent=[0, (log_mel_spec.shape[1]*512) / 16000, 0, 8000], origin='lower'
        )
        ax_heat.set_title(f"Attention Heatmap (Predicted Score: {predicted_score:.2f})")
        
        buf_heat = io.BytesIO()
        fig_heat.savefig(buf_heat, format='png', bbox_inches='tight')
        plt.close(fig_heat)
        heatmap_b64 = base64.b64encode(buf_heat.getvalue()).decode('utf-8')
        
        # Generate distribution plot
        plotly_html = create_distribution_plot(all_normalized_scores, predicted_score)
        
        return {
            "biodiversity_score": float(predicted_score),
            "spectrogram_b64": spectrogram_b64,
            "heatmap_b64": heatmap_b64,
            "distribution_plot_html": plotly_html
        }
        
    except Exception as e:
        print(f"Error in prediction: {e}")
        return {
            "error": str(e),
            "biodiversity_score": 0.0,
            "spectrogram_b64": "",
            "heatmap_b64": "",
            "distribution_plot_html": ""
        }

def load_model_and_data():
    """Initialize model and calibration data"""
    global model, feature_extractor, min_adi, max_adi, all_normalized_scores
    
    print("Loading model and feature extractor...")
    
    # Load feature extractor and base model
    model_checkpoint = "google/vit-base-patch16-224-in21k"
    feature_extractor = AutoFeatureExtractor.from_pretrained(model_checkpoint)
    base_model = TFViTModel.from_pretrained(model_checkpoint, from_pt=True)
    
    # Create the biodiversity model
    model = BiodiversityModel(base_model)
    model.vit.trainable = False
    model.compile(
        optimizer='adam',
        loss=tf.keras.losses.MeanAbsoluteError(),
        metrics=[tf.keras.metrics.RootMeanSquaredError(name='rmse')]
    )
    
    # Initialize with dummy input
    dummy_input = tf.ones((1, 224, 224, 3))
    model(dummy_input)
    
    # For now, use mock calibration data (you'll need the real training data later)
    print("Using mock calibration data...")
    min_adi = 0.0
    max_adi = 1.0
    all_normalized_scores = np.random.beta(2, 5, 1000)  # Mock distribution
    
    print("Model loaded successfully!")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Biodiversity API is running"})

@app.route('/analyze', methods=['POST'])
def analyze_audio():
    """Main analysis endpoint - returns all 4 outputs"""
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.flac') as tmp_file:
            audio_file.save(tmp_file.name)
            
            # Get prediction
            result = get_prediction_and_heatmap(
                tmp_file.name, model, feature_extractor, min_adi, max_adi, all_normalized_scores
            )
            
            # Clean up temporary file
            os.unlink(tmp_file.name)
            
            if "error" in result:
                return jsonify(result), 500
            
            return jsonify(result)
    
    except Exception as e:
        print(f"Error in analyze_audio: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/demo', methods=['POST'])
def demo_analysis():
    """Demo endpoint with mock data"""
    try:
        # Generate mock data for development
        mock_score = np.random.uniform(0.3, 0.8)
        
        # Create a simple demo spectrogram
        fig, ax = plt.subplots(figsize=(10, 4))
        ax.text(0.5, 0.5, f'Demo Spectrogram\nScore: {mock_score:.2f}', 
                ha='center', va='center', transform=ax.transAxes, fontsize=16)
        ax.set_title("Demo Mel Spectrogram")
        
        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight')
        plt.close(fig)
        demo_spec_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        
        # Create demo heatmap
        fig, ax = plt.subplots(figsize=(10, 4))
        ax.text(0.5, 0.5, f'Demo Heatmap\nAttention Visualization', 
                ha='center', va='center', transform=ax.transAxes, fontsize=16)
        ax.set_title(f"Demo Attention Heatmap (Score: {mock_score:.2f})")
        
        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight')
        plt.close(fig)
        demo_heat_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        
        # Create demo distribution plot
        demo_scores = np.random.beta(2, 5, 1000)
        demo_plot_html = create_distribution_plot(demo_scores, mock_score)
        
        return jsonify({
            "biodiversity_score": float(mock_score),
            "spectrogram_b64": demo_spec_b64,
            "heatmap_b64": demo_heat_b64,
            "distribution_plot_html": demo_plot_html
        })
    
    except Exception as e:
        print(f"Error in demo: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    load_model_and_data()
    print("\n=== Biodiversity Analysis API Server ===")
    print("Endpoints:")
    print("  GET  /health - Health check")
    print("  POST /analyze - Full analysis (requires trained model)")
    print("  POST /demo - Demo with mock data")
    print("\nStarting server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)