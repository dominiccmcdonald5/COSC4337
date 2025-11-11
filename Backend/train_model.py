#!/usr/bin/env python3
"""
Biodiversity Model Training Script
Adapted from ADI_R4_Bioacoustics.ipynb for local training with 110 FLAC files

This script trains a Vision Transformer (ViT) model on audio spectrograms
to predict biodiversity scores using the Acoustic Diversity Index (ADI).
"""

import os
import glob
import numpy as np
import pandas as pd
import librosa
import librosa.display
import matplotlib.pyplot as plt
import soundfile as sf
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from transformers import AutoFeatureExtractor, TFViTModel
from maad import sound, features as maad_features
from tqdm import tqdm
import pickle
import json
from sklearn.model_selection import train_test_split

# Configuration
TRAIN_DIR = "train"
MODEL_SAVE_PATH = "trained_biodiversity_model"
CALIBRATION_SAVE_PATH = "adi_calibration.json"
BATCH_SIZE = 8
EPOCHS = 50
TARGET_SR = 16000
SEGMENT_DURATION = 60  # seconds
IMG_SIZE = 224

class BiodiversityModel(tf.keras.Model):
    def __init__(self, vit_base_model):
        super().__init__()
        self.vit = vit_base_model
        
        self.head_stack = tf.keras.Sequential([
            layers.LayerNormalization(name="head_norm"),
            layers.Dense(256, activation='gelu', name="head_dense_1"),
            layers.Dropout(0.3, name="head_dropout"),
            layers.Dense(1, activation='sigmoid', name='biodiversity_score', bias_initializer='zeros')
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
    """Calculate Acoustic Diversity Index for biodiversity scoring"""
    try:
        # Normalize audio
        peak_amplitude = np.max(np.abs(audio))
        if peak_amplitude > 1e-5:
            audio = audio / peak_amplitude
        
        # Calculate spectrogram
        Sxx, _, freqs, _ = sound.spectrogram(audio, sr, n_fft=n_fft, hop_length=hop_length, window='hann', flim=(0, 8000))
        
        # Calculate ADI in biophony band (2k-8k Hz)
        fmin = 2000.0
        fmax = 8000.0
        bin_step = 100
        n_bands = (fmax - fmin) / bin_step
        
        if n_bands <= 0:
            raise ValueError("fmax must be greater than fmin")
        
        adi_score = maad_features.acoustic_diversity_index(
            Sxx,
            freqs,
            fmin=fmin,
            fmax=fmax,
            bin_step=bin_step,
            dB_threshold=-70.0
        )
        
        # Normalize by log(n_bands) to get 0-1 score
        normalized_adi = adi_score / np.log(n_bands)
        return np.float32(normalized_adi)
        
    except Exception as e:
        print(f"Warning: Could not calculate ADI. Error {e}")
        return np.float32(0.0)

def load_and_process_audio(file_path):
    """Load audio file and convert to spectrogram image"""
    try:
        # Load audio
        audio, sr = librosa.load(file_path, sr=TARGET_SR, duration=SEGMENT_DURATION)
        
        # Ensure consistent length
        target_length = TARGET_SR * SEGMENT_DURATION
        if len(audio) < target_length:
            audio = np.pad(audio, (0, target_length - len(audio)), mode='constant')
        else:
            audio = audio[:target_length]
        
        # Create mel-spectrogram
        mel_spectrogram = librosa.feature.melspectrogram(
            y=audio,
            sr=sr,
            n_mels=IMG_SIZE,
            n_fft=2048,
            hop_length=512,
            fmin=0,
            fmax=8000
        )
        
        # Convert to dB and normalize
        mel_spectrogram_db = librosa.power_to_db(mel_spectrogram, ref=np.max)
        
        # Normalize to 0-1 range
        mel_spectrogram_norm = (mel_spectrogram_db - mel_spectrogram_db.min()) / (mel_spectrogram_db.max() - mel_spectrogram_db.min() + 1e-8)
        
        # Resize to target image size
        mel_spectrogram_resized = tf.image.resize(
            tf.expand_dims(mel_spectrogram_norm, axis=-1),
            [IMG_SIZE, IMG_SIZE]
        )
        
        # Convert to 3-channel image (RGB)
        image = tf.repeat(mel_spectrogram_resized, 3, axis=-1)
        
        # Calculate ADI score
        adi_score = calculate_adi(audio, sr)
        
        return tf.cast(image, tf.float32), tf.cast(adi_score, tf.float32)
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None, None

def create_dataset_from_files(file_paths, calibration_params=None):
    """Create TensorFlow dataset from file paths"""
    features = []
    labels = []
    
    print(f"Processing {len(file_paths)} files...")
    
    for file_path in tqdm(file_paths):
        feature, label = load_and_process_audio(file_path)
        if feature is not None and label is not None:
            features.append(feature)
            labels.append(label)
    
    if len(features) == 0:
        raise ValueError("No valid audio files found")
    
    features = tf.stack(features)
    labels = tf.stack(labels)
    
    # Apply calibration if provided
    if calibration_params:
        min_adi = calibration_params['min_adi']
        max_adi = calibration_params['max_adi']
        labels = (labels - min_adi) / (max_adi - min_adi + 1e-10)
        labels = tf.clip_by_value(labels, 0.0, 1.0)
    
    return tf.data.Dataset.from_tensor_slices((features, labels))

def main():
    print("🎵 Starting Biodiversity Model Training")
    print("=" * 50)
    
    # Check if train directory exists
    if not os.path.exists(TRAIN_DIR):
        raise FileNotFoundError(f"Training directory '{TRAIN_DIR}' not found. Please ensure your FLAC files are in this directory.")
    
    # Get all FLAC files
    flac_files = glob.glob(os.path.join(TRAIN_DIR, "*.flac"))
    print(f"Found {len(flac_files)} FLAC files for training")
    
    if len(flac_files) == 0:
        raise FileNotFoundError(f"No FLAC files found in '{TRAIN_DIR}' directory")
    
    # Split into train/validation
    train_files, val_files = train_test_split(flac_files, test_size=0.2, random_state=42)
    print(f"Training files: {len(train_files)}, Validation files: {len(val_files)}")
    
    # Load pre-trained ViT model
    print("Loading ViT feature extractor and base model...")
    model_checkpoint = "google/vit-base-patch16-224-in21k"
    feature_extractor = AutoFeatureExtractor.from_pretrained(model_checkpoint)
    base_model = TFViTModel.from_pretrained(model_checkpoint, from_pt=True)
    
    # Create custom model
    print("Building biodiversity model...")
    model = BiodiversityModel(base_model)
    model.vit.trainable = False  # Freeze ViT weights initially
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss=tf.keras.losses.MeanAbsoluteError(),
        metrics=[tf.keras.metrics.RootMeanSquaredError(name='rmse')]
    )
    
    # Build model with dummy input
    dummy_input = tf.ones((1, IMG_SIZE, IMG_SIZE, 3))
    _ = model(dummy_input)
    print("Model built successfully!")
    model.summary()
    
    # First pass: Calculate ADI calibration parameters
    print("\\n📊 Calculating ADI calibration parameters...")
    adi_scores = []
    
    for file_path in tqdm(train_files, desc="Calculating ADI scores"):
        try:
            audio, sr = librosa.load(file_path, sr=TARGET_SR, duration=SEGMENT_DURATION)
            adi_score = calculate_adi(audio, sr)
            adi_scores.append(float(adi_score))
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    min_adi = np.min(adi_scores)
    max_adi = np.max(adi_scores)
    
    calibration_params = {
        'min_adi': float(min_adi),
        'max_adi': float(max_adi),
        'mean_adi': float(np.mean(adi_scores)),
        'median_adi': float(np.median(adi_scores)),
        'std_adi': float(np.std(adi_scores))
    }
    
    print(f"ADI Calibration Results:")
    print(f"  Min ADI: {min_adi:.4f}")
    print(f"  Max ADI: {max_adi:.4f}")
    print(f"  Mean ADI: {calibration_params['mean_adi']:.4f}")
    print(f"  Median ADI: {calibration_params['median_adi']:.4f}")
    
    # Save calibration parameters
    with open(CALIBRATION_SAVE_PATH, 'w') as f:
        json.dump(calibration_params, f, indent=2)
    print(f"Saved calibration parameters to {CALIBRATION_SAVE_PATH}")
    
    # Create datasets
    print("\\n🔄 Creating training dataset...")
    train_ds = create_dataset_from_files(train_files, calibration_params)
    train_ds = train_ds.shuffle(1024).batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)
    
    print("Creating validation dataset...")
    val_ds = create_dataset_from_files(val_files, calibration_params)
    val_ds = val_ds.batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)
    
    # Training callbacks
    callbacks = [
        EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-7,
            verbose=1
        ),
        ModelCheckpoint(
            filepath=f"{MODEL_SAVE_PATH}_checkpoint.h5",
            monitor='val_loss',
            save_best_only=True,
            save_weights_only=True,
            verbose=1
        )
    ]
    
    # Train the model
    print(f"\\n🚀 Starting training for {EPOCHS} epochs...")
    
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=callbacks,
        verbose=1
    )
    
    # Save the trained model
    print(f"\\n💾 Saving trained model to {MODEL_SAVE_PATH}")
    model.save_weights(MODEL_SAVE_PATH)
    
    # Save training history
    history_path = f"{MODEL_SAVE_PATH}_history.json"
    with open(history_path, 'w') as f:
        # Convert numpy arrays to lists for JSON serialization
        history_dict = {key: [float(val) for val in values] for key, values in history.history.items()}
        json.dump(history_dict, f, indent=2)
    
    print("\\n✅ Training completed successfully!")
    print(f"Model weights saved to: {MODEL_SAVE_PATH}")
    print(f"Calibration parameters saved to: {CALIBRATION_SAVE_PATH}")
    print(f"Training history saved to: {history_path}")
    
    # Plot training results
    plt.figure(figsize=(12, 4))
    
    plt.subplot(1, 2, 1)
    plt.plot(history.history['loss'], label='Training Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Model Loss')
    plt.ylabel('Loss')
    plt.xlabel('Epoch')
    plt.legend()
    
    plt.subplot(1, 2, 2)
    plt.plot(history.history['rmse'], label='Training RMSE')
    plt.plot(history.history['val_rmse'], label='Validation RMSE')
    plt.title('Model RMSE')
    plt.ylabel('RMSE')
    plt.xlabel('Epoch')
    plt.legend()
    
    plt.tight_layout()
    plt.savefig(f"{MODEL_SAVE_PATH}_training_plots.png", dpi=150, bbox_inches='tight')
    plt.show()
    
    print("\\n📈 Training plots saved as PNG file")

if __name__ == "__main__":
    main()