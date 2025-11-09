# Biodiversity Analysis Web Application

This project analyzes ecosystem biodiversity from audio recordings using AI-powered acoustic analysis.

## Project Structure:

```
COSC4337/
├── Backend/
│   ├── app.py                    # Flask API server
│   ├── requirements.txt          # Python dependencies
│   └── ADI_R3_Bioacoustics.ipynb # Original analysis notebook
└── Frontend/
    └── animal-audio-app/         # Next.js React application
```

## Features

- **Audio Upload**: Support for WAV, MP3, FLAC, M4A, OGG, WebM formats (up to 50MB)
- **Biodiversity Analysis**: Calculates Acoustic Diversity Index (ADI) scores
- **Spectrogram Visualization**: Matplotlib-generated frequency analysis plots
- **Interactive Distribution**: Plotly charts comparing scores to ecosystem benchmarks
- **Real-time Processing**: Fast analysis with progress indicators

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd Backend
```

2. Create a Python virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

4. Install Python dependencies:
```bash
pip install -r requirements.txt
```

5. Start the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd Frontend/animal-audio-app
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. Start both backend and frontend servers
2. Open `http://localhost:3000` in your browser
3. Upload an audio file of an ecosystem recording
4. Click "Analyze Biodiversity" to process the audio
5. View results including:
   - Biodiversity score (0-100%)
   - Audio spectrogram visualization
   - Score distribution compared to benchmarks
   - Ecosystem type classification

## API Endpoints

### POST /analyze
Upload and analyze audio file
- **Input**: Multipart form data with 'audio' file
- **Output**: JSON with biodiversity_score, spectrogram_b64, distribution_data, etc.

### GET /health
Health check endpoint

### GET /
API information and available endpoints

## Benchmarks

The system compares recordings against these ecosystem types:
- **Urban Low** (10%): City centers, heavy traffic
- **Urban Park** (30%): Parks with some wildlife
- **Forest Edge** (50%): Transition zones between habitats
- **Primary Forest** (80%): Established forest ecosystems
- **Pristine Ecosystem** (95%): Untouched natural habitats

## Technical Details

### Backend
- **Flask**: Web framework for API endpoints
- **Librosa**: Audio processing and feature extraction
- **Matplotlib**: Spectrogram visualization
- **NumPy/SciPy**: Numerical computations
- **scikit-maad**: Acoustic diversity calculations

### Frontend
- **Next.js**: React framework with TypeScript
- **Tailwind CSS**: Styling and responsive design
- **Plotly.js**: Interactive data visualization
- **Axios**: HTTP client for API communication

## Future Enhancements

- Integration of the full ViT model from the notebook
- Real-time audio recording from microphone
- Batch processing of multiple files
- Export analysis results to PDF/CSV
- Species identification from audio signatures
- Temporal analysis showing biodiversity changes over time

## Development Notes

The current implementation uses a simplified ADI calculation for demonstration. To integrate the full machine learning model from `ADI_R3_Bioacoustics.ipynb`:

1. Load the trained ViT model in `app.py`
2. Replace the `calculate_adi()` function with the notebook's `get_prediction_and_heatmap()`
3. Add proper model file paths and calibration data
4. Include Grad-CAM visualization for explainable AI results