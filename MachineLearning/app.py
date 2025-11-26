import os
import io
import base64
import torch
import torch.nn as nn
import numpy as np

import torchaudio
import torchaudio.transforms as T

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import ASTConfig, ASTForAudioClassification, ASTFeatureExtractor

# initialize flask app
app = Flask(__name__)
CORS(app) # enable CORS for frontend communication

# === 1. CONFIGURATION ===
# docker container wont have GPU usually, defaulting to cpu is safe
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
CHECKPOINT_PATH = "checkpoints/best_ast_model.pth"
PRETRAINED_MODEL = "MIT/ast-finetuned-audioset-10-10-0.4593"
SAMPLE_RATE = 16000
DURATION = 10.24
TARGET_LEN = int(SAMPLE_RATE * DURATION)

import sys

def log(msg):
  print(msg)
  sys.stdout.flush()

print(f"--> Starting Backend on {DEVICE}")

# === 2. MODEL DEFINITION ===
class BioAcousticAST(nn.Module):
  def __init__(self, pretrained_model_name):
    super(BioAcousticAST, self).__init__()

    # pretrained body
    self.ast = ASTForAudioClassification.from_pretrained(
        pretrained_model_name,
        ignore_mismatched_sizes=True
    )

    # custom regression head
    hidden_size = self.ast.config.hidden_size
    self.classifier = nn.Sequential(
        nn.LayerNorm(hidden_size),
        nn.Linear(hidden_size, 256),
        nn.GELU(),
        nn.Dropout(0.35),
        nn.Linear(256, 1),
        nn.Sigmoid()
    )

  def forward(self, input_values):
    outputs = self.ast.base_model(input_values)
    last_hidden_state = outputs.last_hidden_state
    cls_token = last_hidden_state[:, 0, :]
    prediction = self.classifier(cls_token)
    return prediction

# === 3. MODEL LOADING ===
def load_model():
  print("Loading Feature Extractor . . .")
  feature_extractor = ASTFeatureExtractor.from_pretrained(PRETRAINED_MODEL)

  # load model architecture
  print("Loading Model Architecture . . .")
  model = BioAcousticAST(PRETRAINED_MODEL)

  # load weights
  if os.path.exists(CHECKPOINT_PATH):
    print(f"Loading Weights from {CHECKPOINT_PATH}")
    state_dict = torch.load(CHECKPOINT_PATH, map_location=DEVICE)
    model.load_state_dict(state_dict)
  else:
    print("WARNING: Checkpoint not found! This is a problem. Using random weights . . . ")

  model.to(DEVICE)
  model.eval()
  return model, feature_extractor

model, feature_extractor = load_model()

# === TORCHAUDIO REPLACEMENT FOR PLOTS ===
def generate_plots(audio_np, sr):
  plots = {}
  plt.style.use('ggplot')

  fig, ax = plt.subplots(figsize=(10, 3))

  time_axis = np.linspace(0, len(audio_np) / sr, num=len(audio_np))
  ax.plot(time_axis, audio_np, color='blue', alpha=0.6)
  ax.set_title("Waveform")
  ax.set_xlabel("Time (s)")
  ax.set_ylabel("Amplitude")

  buf = io.BytesIO()
  plt.tight_layout()
  plt.savefig(buf, format='png')
  buf.seek(0)
  plots['waveform'] = base64.b64encode(buf.read()).decode('utf-8')
  plt.close(fig)

  plots['spectrogram'] = ""
  return plots

# === 4. HELPER: PLOT GENERATION ===
# def generate_plots(audio, sr):
#   plots = {}

#   plt.style.use('ggplot')

#   # plot 1: waveform
#   fig, ax = plt.subplots(figsize=(10, 3))
#   librosa.display.waveshow(audio, sr=sr, ax=ax, color='blue', alpha=0.6)
#   ax.set_title('Waveform')
#   ax.set_xlabel("Time (s)")
#   ax.set_ylabel("Amplitude")

#   # save to buffer
#   buf = io.BytesIO()
#   plt.tight_layout()
#   plt.savefig(buf, format='png')
#   buf.seek(0)
#   plots['waveform'] = base64.b64encode(buf.read()).decode('utf-8')
#   plt.close(fig)

#   # plot 2. mel spectrogram
#   fig, ax = plt.subplots(figsize=(10, 3))
#   S = librosa.feature.melspectrogram(y=audio, sr=sr, n_mels=128, fmax=8000)
#   S_dB = librosa.power_to_db(S, ref=np.max)
#   img = librosa.display.specshow(S_dB, x_axis='time', y_axis='mel', sr=sr, fmax=8000, ax=ax)
#   ax.set_title("Mel Spectrogram")
#   fig.colorbar(img, ax=ax, format='%+2.0f dB')

#   # save to buffer
#   buf = io.BytesIO()
#   plt.tight_layout()
#   plt.savefig(buf, format='png')
#   buf.seek(0)
#   plots['spectrogram'] = base64.b64encode(buf.read()).decode('utf-8')
#   plt.close(fig)

#   return plots

# === 5. API ROUTES ===
@app.route('/health', methods=['GET'])
def health_check():
  return jsonify({"status": "healthy", "device": str(DEVICE)}), 200

import subprocess
import tempfile

@app.route('/predict', methods=['POST'])
def predict():
  # if 'file' not in request.files:
  #   return jsonify({"error": "No file uploaded"}), 400

  # file = request.files['file']

  # if file.filename == '':
  #   return jsonify({"error": "No file selected"}), 400

  if 'file' not in request.files: return jsonify({"error": "No file"}), 400
  file = request.files['file']
  if file.filename == '': return jsonify({"error": "No filename"}), 400

  with tempfile.NamedTemporaryFile(suffix=".flac", delete=False) as temp_in:
    file.save(temp_in.name)
    input_path = temp_in.name
  
  output_path = input_path + "_converted.wav"

  try:
    # 1. Load Audio
    #audio, sr = librosa.load(file, sr=SAMPLE_RATE, duration=DURATION)

    log(f"--> Recieved file: {file.filename}")

    command = [
      "ffmpeg", "-y",
      "-i", input_path,
      "-ar", "16000",
      "-ac", "1",
      "-t", "11",
      output_path
    ]

    log("--> Running FFmpeg conversion . . .")
    subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    audio_tensor, sr = torchaudio.load(output_path)
    audio = audio_tensor.squeeze().numpy()

    log(f"--> Loaded converted audio. Shape: {audio.shape}")

    # if audio_tensor.shape[0] > 1:
    #   audio_tensor = torch.mean(audio_tensor, dim=0, keepdim=True)
    #   log("   Mixed to Mono")

    # seconds_needed = DURATION + 1.0
    # samples_needed = int(seconds_needed * sr)

    # if audio_tensor.shape[1] > samples_needed:
    #   log(f"    Cropping {audio_tensor.shape[1]} -> {samples_needed} samples")
    #   audio_tensor = audio_tensor[:, :samples_needed]

    # if sr != SAMPLE_RATE:
    #   log(f"Resampling from {sr} to {SAMPLE_RATE}")
    #   resampler = T.Resample(sr, SAMPLE_RATE)
    #   audio_tensor = resampler(audio_tensor)

    # audio = audio_tensor.squeeze().numpy()

    # if audio_tensor.shape[0] > 1:
    #   audio_tensor = torch.mean(audio_tensor, dim=0, keepdim=True)
    
    # audio = audio_tensor.squeeze().numpy()

    # 2. pad/trim to 10.24s
    if len(audio) < TARGET_LEN:
      audio = np.pad(audio, (0, int(TARGET_LEN - len(audio))))
    else:
      audio = audio[:TARGET_LEN]

    log("--> Feature Extraction . . .")

    # 3. feature extraction
    inputs = feature_extractor(
        audio,
        sampling_rate=SAMPLE_RATE,
        return_tensors="pt"
    )

    log("--> Inference . . .")

    # 4. Inference
    with torch.no_grad():
      score = model(inputs['input_values'].to(DEVICE)).item()

    log(f"--> Score: {score}")

    # 5. Generate Plots
    plots = generate_plots(audio, SAMPLE_RATE)
    #plots = None #generate_plots(audio, sr)

    os.remove(input_path)
    os.remove(output_path)

    return jsonify({
        "filename": file.filename,
        "biodiversity_score": float(f"{score:.4f}"),
        "plots": plots
    })

  except Exception as e:
    print(f"Error processing file: {e}")
    return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
  app.run(host='0.0.0.0', port=5000, threaded=True)