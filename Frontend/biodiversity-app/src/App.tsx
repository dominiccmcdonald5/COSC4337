import { useState } from 'react';
import { motion } from 'framer-motion';

// Import Aceternity UI components
import { BackgroundBeams } from './components/background-gradient';
import { FileUpload } from './components/file-upload';
import { Spotlight } from './components/spotlight';
import { FloatingNav } from './components/floating-nav';
import { GridBackground } from './components/grid-background';
import { EnhancedLoading } from './components/enhanced-loading';
import { WavyBackground } from './components/wavy-background';



interface MockAnalysisResult {
  biodiversity_score: number;
  adi_score: number;
  spectrogram_image: string;
  distribution_data: any;
  gradcam_image: string;
  filename: string;
  duration: number;
  sample_rate: number;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<MockAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      
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

    // Mock analysis - simulate processing time
    setTimeout(() => {
      // Generate mock results
      const mockResult: MockAnalysisResult = {
        biodiversity_score: Math.random() * 0.8 + 0.2, // Random score between 0.2-1.0
        adi_score: Math.random() * 0.8 + 0.2,
        spectrogram_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // Placeholder
        gradcam_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // Placeholder
        distribution_data: {
          x: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
          y: [10, 15, 25, 30, 20, 15, 10, 8, 5],
          user_score: Math.random() * 0.8 + 0.2
        },
        filename: selectedFile.name,
        duration: 60.0,
        sample_rate: 16000
      };
      
      setAnalysisResult(mockResult);
      setLoading(false);
    }, 3000); // 3 second delay to simulate analysis
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setError('');
  };



  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return '[ HIGH BIODIVERSITY DETECTED ]';
    if (score >= 0.6) return '[ MODERATE BIODIVERSITY DETECTED ]';
    if (score >= 0.4) return '[ LOW BIODIVERSITY DETECTED ]';
    if (score >= 0.2) return '[ MINIMAL BIODIVERSITY DETECTED ]';
    return '[ CRITICAL ECOSYSTEM STATE ]';
  };



  return (
    <WavyBackground 
      className="text-white w-full"
      containerClassName="w-full min-h-screen relative"
      style={{ backgroundColor: '#000000', minHeight: '100vh' }}
    >
      <FloatingNav />
      
      {/* Neon Green Border Glow - More Prominent */}
      <div 
        className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
        style={{ 
          height: '2px', 
          backgroundColor: '#10B981',
          boxShadow: '0 0 10px #10B981'
        }}
      ></div>
      <div 
        className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
        style={{ 
          height: '2px', 
          backgroundColor: '#10B981',
          boxShadow: '0 0 10px #10B981'
        }}
      ></div>
      <div 
        className="absolute top-0 bottom-0 left-0 z-20 pointer-events-none"
        style={{ 
          width: '2px', 
          backgroundColor: '#10B981',
          boxShadow: '0 0 10px #10B981'
        }}
      ></div>
      <div 
        className="absolute top-0 bottom-0 right-0 z-20 pointer-events-none"
        style={{ 
          width: '2px', 
          backgroundColor: '#10B981',
          boxShadow: '0 0 10px #10B981'
        }}
      ></div>

      {/* Corner Accents */}

      
      <BackgroundBeams />
      <GridBackground />
      
      {/* Spotlight Effects */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="#10B981"
      />
      <Spotlight
        className="top-10 left-full h-[80vh] w-[50vw]"
        fill="#059669"
      />
      <Spotlight
        className="top-28 left-80 h-[80vh] w-[50vw]"
        fill="#34D399"
      />
      
      <div 
        className="relative z-50 mx-auto px-8 w-full"
        style={{ 
          maxWidth: '1400px',
          position: 'relative',
          zIndex: 50,
          paddingTop: '4rem',
          paddingBottom: '3rem'
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center relative z-50"
          style={{ 
            marginBottom: '4rem',
            padding: '2rem 0',
            marginTop: '2rem'
          }}
        >
          <h1 
            className="font-bold"
            style={{
              fontSize: '4rem',
              marginBottom: '2rem',
              lineHeight: '1.1'
            }}
          >
            <span style={{
              background: 'linear-gradient(90deg, #10B981, #34D399, #10B981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              BIOACOUSTICS
            </span>
            <br />
            <span style={{ color: 'white' }}>ANALYZER</span>
            <div 
              style={{
                color: '#10B981',
                fontSize: '1.5rem',
                marginTop: '1rem',
                fontFamily: 'monospace'
              }}
            >
              [ MACHINE-LEARNING ECOSYSTEM ANALYSIS ]
            </div>
          </h1>
          <p 
            style={{
              fontSize: '1.2rem',
              color: '#D1D5DB',
              maxWidth: '800px',
              margin: '2rem auto 0',
              lineHeight: '1.6'
            }}
          >
            Use advanced machine learning algorithms to analyze an ecosystem's audio recordings to quantify the biodiversity patterns and acoustic signatures.
          </p>
        </motion.div>



        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ 
            marginBottom: '4rem',
            padding: '2rem 0'
          }}
        >
            <div 
              style={{
                maxWidth: '900px',
                margin: '0 auto',
                padding: '2px',
                background: 'linear-gradient(90deg, #10B981, #34D399, #10B981)',
                borderRadius: '24px',
                boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)'
              }}
            >
            <div 
              style={{
                borderRadius: '22px',
                backgroundColor: '#000000',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                padding: '3rem',
                boxShadow: '0 25px 50px rgba(16, 185, 129, 0.2)'
              }}
            >
              <h2 
                style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  marginBottom: '2rem',
                  textAlign: 'center',
                  color: '#10B981',
                  fontFamily: 'monospace'
                }}
              >
                &gt; AUDIO INPUT
              </h2>
              
              <FileUpload onChange={handleFileSelect} />

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg"
                >
                  <p className="text-red-400 text-center font-mono">{error}</p>
                </motion.div>
              )}

              <div className="mt-6 flex gap-3 justify-center flex-wrap">
                {/* Spotify-Style Analyze Button - Icon Sized */}
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || loading}
                  className={`rounded-full font-normal text-white tracking-normal uppercase transform transition-colors duration-200 flex items-center justify-center space-x-2 text-sm ${
                    !selectedFile || loading 
                      ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                      : 'bg-[#10B981] hover:scale-105 hover:bg-[#34D399]'
                  }`}
                  style={{
                    paddingLeft: '32px',
                    paddingRight: '32px',
                    paddingTop: '16px',
                    paddingBottom: '16px'
                  }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="text-sm font-normal">ANALYZING ECOSYSTEM</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-sm font-normal">ANALYZE ECOSYSTEM</span>
                    </>
                  )}
                </button>
                
                {/* Spotify-Style Reset Button - Icon Sized */}
                {(selectedFile || analysisResult) && (
                  <button 
                    onClick={handleReset} 
                    className="rounded-full bg-gray-600 font-normal text-white tracking-normal uppercase transform hover:scale-105 hover:bg-gray-500 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                    style={{
                      paddingLeft: '40px',
                      paddingRight: '40px',
                      paddingTop: '16px',
                      paddingBottom: '16px'
                    }}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm font-normal">RESET</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Enhanced Loading Overlay */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200]"
            >
              <EnhancedLoading text="AI ANALYZING ECOSYSTEM..." />
            </motion.div>
          )}
        </motion.div>

        {/* Results Section - 4 Main Outputs */}
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-16 space-y-8"
          >
            {/* 1. Biodiversity Score (Number) */}
            <div className="max-w-6xl mx-auto p-0.5 bg-gradient-to-r from-green-400 via-green-500 to-green-400 rounded-[22px] shadow-lg shadow-green-400/40">
              <div className="bg-black rounded-[20px] p-8 border border-green-400/50 shadow-inner">
                <h2 className="text-3xl font-bold mb-8 text-center text-green-400 font-mono">
                  // OUTPUT 1: BIODIVERSITY SCORE
                </h2>
                
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
                    className="relative inline-block"
                  >
                    <div className="text-9xl font-bold text-green-400 font-mono relative">
                      {(analysisResult.biodiversity_score * 100).toFixed(1)}
                      <span className="text-6xl">%</span>
                      {/* Neon glow effect */}
                      <div className="absolute inset-0 text-9xl font-bold text-green-400 blur-lg opacity-50 font-mono">
                        {(analysisResult.biodiversity_score * 100).toFixed(1)}
                        <span className="text-6xl">%</span>
                      </div>
                    </div>
                  </motion.div>
                  <p className="text-2xl font-semibold text-white mt-4 font-mono">
                    ADI SCORE: <span className="text-green-400">{analysisResult.adi_score.toFixed(3)}</span>
                  </p>
                  <p className="text-lg text-gray-300 mt-2 font-mono">
                    {getScoreLabel(analysisResult.biodiversity_score)}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Mel Spectrogram (Matplotlib Image) */}
            <div className="max-w-6xl mx-auto p-0.5 bg-gradient-to-r from-green-400 via-green-500 to-green-400 rounded-[22px] shadow-lg shadow-green-400/40">
              <div className="bg-black rounded-[20px] p-8 border border-green-400/50 shadow-inner">
                <h3 className="text-2xl font-bold mb-6 text-center text-green-400 font-mono">
                  // OUTPUT 2: MEL AUDIO SPECTROGRAM
                </h3>
                  <div className="text-center">
                  <div className="bg-gray-900 p-4 rounded-lg border-2 border-green-400/60 shadow-lg shadow-green-400/30 inline-block">
                    <div className="w-96 h-64 bg-gradient-to-r from-black via-green-900 to-black rounded border border-green-400/40 flex items-center justify-center text-green-400 font-mono">
                      [SPECTROGRAM VISUALIZATION]<br />
                      Frequency vs Time Analysis<br />
                      {analysisResult.filename}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-4 text-center font-mono">
                  Mel-frequency spectrogram showing acoustic patterns and frequency distributions
                </p>
              </div>
            </div>

            {/* 3. Distribution Plot (Plotly Interactive) */}
            <div className="max-w-6xl mx-auto p-0.5 bg-gradient-to-r from-green-400 via-green-500 to-green-400 rounded-[22px] shadow-lg shadow-green-400/40">
              <div className="bg-black rounded-[20px] p-8 border border-green-400/50 shadow-inner">
                <h3 className="text-2xl font-bold mb-6 text-center text-green-400 font-mono">
                  // OUTPUT 3: SCORE DISTRIBUTION
                </h3>
                <div className="text-center">
                  <div className="bg-gray-900 p-6 rounded-lg border-2 border-green-400/60 shadow-lg shadow-green-400/30">
                    <div className="w-full h-80 bg-gradient-to-b from-green-900/30 to-black rounded border border-green-400/40 flex flex-col items-center justify-center text-green-400 font-mono">
                      <div className="text-lg mb-4">[INTERACTIVE PLOTLY CHART]</div>
                      <div className="grid grid-cols-5 gap-2 mb-4">
                        {[0.1, 0.3, 0.5, 0.8, 0.95].map((val, i) => (
                          <div key={i} className="text-xs text-center">
                            <div className={`h-16 w-8 ${val === Math.round(analysisResult.biodiversity_score * 10) / 10 ? 'bg-green-400' : 'bg-green-800'} rounded mb-1`}></div>
                            {val}
                          </div>
                        ))}
                      </div>
                      <div className="text-sm">
                        Your Score: <span className="text-green-400 font-bold">{analysisResult.biodiversity_score.toFixed(2)}</span>
                      </div>
                      <div className="text-xs mt-2 text-gray-400">Hover for ecosystem benchmarks</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-4 text-center font-mono">
                  Interactive distribution with ecosystem benchmarks and hover data
                </p>
              </div>
            </div>

            {/* 4. Grad-CAM Heatmap (Matplotlib Image) */}
            <div className="max-w-6xl mx-auto p-0.5 bg-gradient-to-r from-green-400 via-green-500 to-green-400 rounded-[22px] shadow-lg shadow-green-400/40">
              <div className="bg-black rounded-[20px] p-8 border border-green-400/50 shadow-inner">
                <h3 className="text-2xl font-bold mb-6 text-center text-green-400 font-mono">
                  // OUTPUT 4: GRAD-CAM HEATMAP
                </h3>
                <div className="text-center">
                  <div className="bg-gray-900 p-4 rounded-lg border-2 border-green-400/60 shadow-lg shadow-green-400/30 inline-block">
                    <div className="w-96 h-64 bg-gradient-to-r from-black via-green-900 to-black rounded border border-green-400/40 flex items-center justify-center text-green-400 font-mono relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 via-yellow-500/20 to-green-500/30 opacity-60"></div>
                      <div className="relative z-10 text-center">
                        [GRAD-CAM VISUALIZATION]<br />
                        AI Attention Heatmap<br />
                        Feature Importance
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-4 text-center font-mono">
                  Gradient-weighted Class Activation Mapping showing AI model focus areas
                </p>
              </div>
            </div>

            {/* System Info */}
            <div className="max-w-4xl mx-auto p-0.5 bg-gradient-to-r from-green-400 via-green-500 to-green-400 rounded-[22px] shadow-lg shadow-green-400/40">
              <div className="bg-black rounded-[20px] p-6 border border-green-400/50 shadow-inner">
                <h3 className="text-xl font-bold mb-4 text-center text-green-400 font-mono">
                  // SYSTEM OUTPUT
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                  <div className="text-gray-300">
                    <span className="text-green-400">FILE:</span> {analysisResult.filename}
                  </div>
                  <div className="text-gray-300">
                    <span className="text-green-400">DURATION:</span> {analysisResult.duration.toFixed(1)}s
                  </div>
                  <div className="text-gray-300">
                    <span className="text-green-400">SAMPLE_RATE:</span> {analysisResult.sample_rate}Hz
                  </div>
                  <div className="text-gray-300">
                    <span className="text-green-400">STATUS:</span> ANALYSIS_COMPLETE
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </WavyBackground>
  );
}

export default App;
