'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';

// Dynamically import Plot to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface AnalysisResult {
  biodiversity_score: number;
  adi_score: number;
  spectrogram_b64: string;
  distribution_data: any;
  benchmarks: { [key: string]: number };
  filename: string;
  duration: number;
  sample_rate: number;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/flac', 'audio/m4a', 'audio/ogg', 'audio/webm', 'video/webm'];
      if (!allowedTypes.some(type => file.type.includes(type.split('/')[1]))) {
        setError('Please select a valid audio file (WAV, MP3, FLAC, M4A, OGG, WebM)');
        return;
      }
      
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      
      setSelectedFile(file);
      setError('');
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an audio file first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('audio', selectedFile);

      const response = await axios.post<AnalysisResult>(
        'http://localhost:5000/analyze',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 second timeout
        }
      );

      setAnalysisResult(response.data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      if (err.code === 'ECONNREFUSED') {
        setError('Cannot connect to analysis server. Please make sure the backend is running on port 5000.');
      } else if (err.response?.data?.error) {
        setError(`Analysis failed: ${err.response.data.error}`);
      } else {
        setError('Analysis failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    if (score >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent Biodiversity';
    if (score >= 0.6) return 'Good Biodiversity';
    if (score >= 0.4) return 'Moderate Biodiversity';
    if (score >= 0.2) return 'Low Biodiversity';
    return 'Very Low Biodiversity';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎵 Ecosystem Biodiversity Analyzer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload an audio recording of an ecosystem to analyze its biodiversity using AI-powered acoustic analysis
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Upload Audio File</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav,.mp3,.flac,.m4a,.ogg,.webm"
              onChange={handleFileSelect}
              className="hidden"
              id="audio-upload"
            />
            
            <label htmlFor="audio-upload" className="cursor-pointer">
              <div className="text-4xl mb-4">🎤</div>
              <p className="text-lg mb-2">
                {selectedFile ? selectedFile.name : 'Click to select an audio file'}
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: WAV, MP3, FLAC, M4A, OGG, WebM (max 50MB)
              </p>
            </label>
          </div>

          {selectedFile && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p><strong>File:</strong> {selectedFile.name}</p>
              <p><strong>Size:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              <p><strong>Type:</strong> {selectedFile.type}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-6 flex gap-4 justify-center">
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  🔬 Analyze Biodiversity
                </>
              )}
            </button>
            
            {(selectedFile || analysisResult) && (
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        {analysisResult && (
          <div className="space-y-6">
            {/* Biodiversity Score */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Biodiversity Analysis Results</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">
                    <span className={getScoreColor(analysisResult.biodiversity_score)}>
                      {(analysisResult.biodiversity_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">
                    Biodiversity Score
                  </p>
                  <p className={`text-lg font-medium ${getScoreColor(analysisResult.biodiversity_score)}`}>
                    {getScoreLabel(analysisResult.biodiversity_score)}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold">ADI Score:</span> {analysisResult.adi_score.toFixed(3)}
                  </div>
                  <div>
                    <span className="font-semibold">Duration:</span> {analysisResult.duration.toFixed(1)} seconds
                  </div>
                  <div>
                    <span className="font-semibold">Sample Rate:</span> {analysisResult.sample_rate} Hz
                  </div>
                  <div>
                    <span className="font-semibold">File:</span> {analysisResult.filename}
                  </div>
                </div>
              </div>
            </div>

            {/* Spectrogram */}
            {analysisResult.spectrogram_b64 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Audio Spectrogram</h3>
                <div className="text-center">
                  <img 
                    src={`data:image/png;base64,${analysisResult.spectrogram_b64}`}
                    alt="Audio Spectrogram"
                    className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Frequency analysis showing acoustic patterns in your recording
                </p>
              </div>
            )}

            {/* Distribution Plot */}
            {analysisResult.distribution_data && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Score Distribution & Benchmarks</h3>
                <div className="h-96">
                  <Plot
                    data={[
                      analysisResult.distribution_data.histogram,
                      analysisResult.distribution_data.user_score,
                      ...analysisResult.distribution_data.benchmarks
                    ]}
                    layout={{
                      title: 'Biodiversity Score Distribution',
                      xaxis: { title: 'Biodiversity Score' },
                      yaxis: { title: 'Frequency' },
                      showlegend: true,
                      height: 350
                    }}
                    config={{ 
                      displayModeBar: true,
                      displaylogo: false,
                      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
                    }}
                    className="w-full h-full"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Your recording's biodiversity score compared to various ecosystem benchmarks
                </p>
              </div>
            )}

            {/* Benchmarks Legend */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Ecosystem Benchmarks</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analysisResult.benchmarks).map(([label, score]) => (
                  <div key={label} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{label.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <span className={`font-semibold ${getScoreColor(score)}`}>
                      {(score * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
