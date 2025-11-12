import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Import Aceternity UI components
import { BackgroundBeams } from './components/background-gradient';
import { FileUpload } from './components/file-upload';
import { Spotlight } from './components/spotlight';
import { FloatingNav } from './components/floating-nav';
import { GridBackground } from './components/grid-background';
import { EnhancedLoading } from './components/enhanced-loading';
import { WavyBackground } from './components/wavy-background';
import PlotlyDistributionChart from './components/PlotlyDistributionChart';
import GradCAMHeatmap from './components/GradCAMHeatmap';
import ColabConnector from './components/ColabConnector';
import CuteLoadingButton from './components/CuteLoadingButton';

// Import API service
import { biodiversityApi } from './services/api';
import type { BiodiversityAnalysisResult } from './services/api';

interface AnalysisResult extends BiodiversityAnalysisResult {
  spectrogram_image?: string; // For backward compatibility with existing components
  gradcam_image?: string; // For backward compatibility with existing components
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Check backend connection on component mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const isAvailable = await biodiversityApi.isBackendAvailable();
        setIsBackendConnected(isAvailable);
        if (isAvailable) {
          console.log('✅ Backend connected successfully');
        }
      } catch (error) {
        console.warn('⚠️ Backend connection failed:', error);
        setIsBackendConnected(false);
      }
    };
    checkBackend();
  }, []);

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
    setLoadingMessage('Uploading and processing audio file...');

    try {
      // Check if backend is connected
      if (!isBackendConnected) {
        setLoadingMessage('Checking backend connection...');
        const isAvailable = await biodiversityApi.isBackendAvailable();
        if (!isAvailable) {
          throw new Error('Backend server is not available. Please make sure the Flask API is running on http://127.0.0.1:5000');
        }
        setIsBackendConnected(true);
      }

      setLoadingMessage('AI analyzing ecosystem patterns...');
      console.log('📤 Sending file to backend:', selectedFile.name);

      // Call the real API
      const result = await biodiversityApi.analyzeAudio(selectedFile);
      
      console.log('🔍 Raw API result:', result);
      console.log('🔍 Spectrogram B64 exists:', !!result.spectrogram_b64);
      console.log('🔍 Distribution data exists:', !!result.distribution_data);
      
      // Transform the result to match our component expectations
      const analysisResult: AnalysisResult = {
        ...result,
        // Map the base64 spectrogram to the expected property name
        spectrogram_image: result.spectrogram_b64 ? `data:image/png;base64,${result.spectrogram_b64}` : '',
        // Map the base64 gradcam to the expected property name  
        gradcam_image: result.gradcam_b64 ? `data:image/png;base64,${result.gradcam_b64}` : ''
      };

      console.log('✅ Analysis complete:', analysisResult);
      console.log('🔍 Final spectrogram_image length:', analysisResult.spectrogram_image?.length || 0);
      console.log('🔍 Final distribution_data:', analysisResult.distribution_data);
      
      setAnalysisResult(analysisResult);
      setLoadingMessage('');

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed. Please try again.');
      setLoadingMessage('');
    } finally {
      setLoading(false);
    }
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
          <div 
            style={{
              position: 'fixed',
              top: '1rem',
              right: '1rem',
              zIndex: 100,
              background: isBackendConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${isBackendConnected ? '#10B981' : '#EF4444'}`,
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              color: isBackendConnected ? '#10B981' : '#EF4444'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isBackendConnected ? '#10B981' : '#EF4444',
                animation: isBackendConnected ? 'none' : 'blink 1s infinite'
              }}></div>
              {isBackendConnected ? 'API CONNECTED' : 'API OFFLINE'}
            </div>
          </div>
          
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
        style={{ 
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          position: 'relative',
          zIndex: 50,
          paddingTop: '4rem',
          paddingBottom: '3rem',
          paddingLeft: '1rem',
          paddingRight: '1rem'
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ 
            marginBottom: '4rem',
            padding: '2rem 1rem',
            marginTop: '2rem',
            textAlign: 'center',
            width: '100%',
            maxWidth: '1200px'
          }}
        >
          <h1 
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              marginBottom: '2rem',
              lineHeight: '1.1',
              fontWeight: 'bold',
              textAlign: 'center'
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
                fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                marginTop: '1rem',
                fontFamily: 'monospace',
                textAlign: 'center'
              }}
            >
              [ MACHINE-LEARNING ECOSYSTEM ANALYSIS ]
            </div>
          </h1>
          <p 
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: '#D1D5DB',
              maxWidth: '800px',
              margin: '2rem auto 0',
              lineHeight: '1.6',
              textAlign: 'center',
              padding: '0 1rem'
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
            padding: '2rem 1rem',
            width: '100%',
            maxWidth: '1000px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
            <div 
              style={{
                width: '100%',
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
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  fontWeight: 'bold',
                  marginBottom: '2rem',
                  textAlign: 'center',
                  color: '#10B981',
                  fontFamily: 'monospace'
                }}
              >
                &gt; AUDIO INPUT
              </h2>
              
              {/* Add Colab Connector */}
              <div style={{ marginBottom: '2rem' }}>
                <ColabConnector 
                  onConnectionChange={(connected, isColab) => {
                    setIsBackendConnected(connected);
                    if (connected && isColab) {
                      console.log('🧪 Connected to Colab model - real ML predictions enabled');
                    } else if (connected) {
                      console.log('🏢 Connected to Render backend - demo mode');
                    }
                  }}
                />
              </div>
              
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

              <div style={{ 
                marginTop: '1.5rem', 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'center', 
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                {/* Cute Loading Analyze Button */}
                <CuteLoadingButton
                  onClick={handleAnalyze}
                  disabled={!selectedFile || loading}
                  loading={loading}
                  loadingText="ANALYZING ECOSYSTEM"
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
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-sm font-normal">ANALYZE ECOSYSTEM</span>
                </CuteLoadingButton>
                
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
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <EnhancedLoading text={loadingMessage || "AI ANALYZING ECOSYSTEM..."} />
            </motion.div>
          )}
        </motion.div>

        {/* Results Section - 4 Main Outputs */}
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ 
              marginTop: '4rem', 
              width: '100%',
              maxWidth: '1200px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
              alignItems: 'center'
            }}
          >
            {/* 1. Biodiversity Score (Number) */}
            <div style={{
              width: '100%',
              maxWidth: '1000px',
              padding: '2px',
              background: 'linear-gradient(90deg, #10B981, #34D399, #10B981)',
              borderRadius: '22px',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
            }}>
              <div style={{
                background: 'black',
                borderRadius: '20px',
                padding: '2rem',
                border: '1px solid rgba(16, 185, 129, 0.5)'
              }}>
                <h2 style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                  fontWeight: 'bold',
                  marginBottom: '2rem',
                  textAlign: 'center',
                  color: '#10B981',
                  fontFamily: 'monospace'
                }}>
                  // OUTPUT 1: BIODIVERSITY SCORE
                </h2>
                
                <div style={{ textAlign: 'center' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
                    style={{ position: 'relative', display: 'inline-block' }}
                  >
                    <div style={{
                      fontSize: 'clamp(4rem, 12vw, 8rem)',
                      fontWeight: 'bold',
                      color: '#10B981',
                      fontFamily: 'monospace',
                      position: 'relative'
                    }}>
                      {(analysisResult.biodiversity_score * 100).toFixed(1)}
                      <span style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}>%</span>
                      {/* Neon glow effect */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        fontSize: 'clamp(4rem, 12vw, 8rem)',
                        fontWeight: 'bold',
                        color: '#10B981',
                        filter: 'blur(8px)',
                        opacity: 0.5,
                        fontFamily: 'monospace'
                      }}>
                        {(analysisResult.biodiversity_score * 100).toFixed(1)}
                        <span style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}>%</span>
                      </div>
                    </div>
                  </motion.div>
                  <p style={{
                    fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
                    fontWeight: '600',
                    color: 'white',
                    marginTop: '1rem',
                    fontFamily: 'monospace'
                  }}>
                    ADI SCORE: <span style={{ color: '#10B981' }}>{analysisResult.adi_score.toFixed(3)}</span>
                  </p>
                  <p style={{
                    fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                    color: '#D1D5DB',
                    marginTop: '0.5rem',
                    fontFamily: 'monospace'
                  }}>
                    {getScoreLabel(analysisResult.biodiversity_score)}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Mel Spectrogram (Matplotlib Image) */}
            <div style={{
              width: '100%',
              maxWidth: '1000px',
              padding: '2px',
              background: 'linear-gradient(90deg, #10B981, #34D399, #10B981)',
              borderRadius: '22px',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
            }}>
              <div style={{
                background: 'black',
                borderRadius: '20px',
                padding: '2rem',
                border: '1px solid rgba(16, 185, 129, 0.5)'
              }}>
                <h3 style={{
                  fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  color: '#10B981',
                  fontFamily: 'monospace'
                }}>
                  // OUTPUT 2: MEL AUDIO SPECTROGRAM
                </h3>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    background: '#1F2937',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '2px solid rgba(16, 185, 129, 0.6)',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                    display: 'inline-block',
                    maxWidth: '100%'
                  }}>
                    {analysisResult.spectrogram_image ? (
                      <img 
                        src={analysisResult.spectrogram_image}
                        alt="Audio Spectrogram"
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          borderRadius: '4px',
                          border: '1px solid rgba(16, 185, 129, 0.4)'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 'clamp(300px, 80vw, 400px)',
                        height: 'clamp(200px, 50vw, 250px)',
                        background: 'linear-gradient(90deg, black, #064E3B, black)',
                        borderRadius: '4px',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10B981',
                        fontFamily: 'monospace',
                        textAlign: 'center',
                        fontSize: 'clamp(0.8rem, 2vw, 1rem)'
                      }}>
                        [SPECTROGRAM LOADING...]<br />
                        Frequency vs Time Analysis<br />
                        {analysisResult.filename}
                      </div>
                    )}
                  </div>
                </div>
                <p style={{
                  fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
                  color: '#9CA3AF',
                  marginTop: '1rem',
                  textAlign: 'center',
                  fontFamily: 'monospace'
                }}>
                  Mel-frequency spectrogram showing acoustic patterns and frequency distributions
                </p>
              </div>
            </div>

            {/* 3. Distribution Plot (Plotly Interactive) */}
            <div style={{
              width: '100%',
              maxWidth: '1000px',
              padding: '2px',
              background: 'linear-gradient(90deg, #10B981, #34D399, #10B981)',
              borderRadius: '22px',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
            }}>
              <div style={{
                background: 'black',
                borderRadius: '20px',
                padding: '2rem',
                border: '1px solid rgba(16, 185, 129, 0.5)'
              }}>
                <h3 style={{
                  fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  color: '#10B981',
                  fontFamily: 'monospace'
                }}>
                  // OUTPUT 3: SCORE DISTRIBUTION
                </h3>
                <div style={{ textAlign: 'center' }}>
                  {analysisResult.distribution_data ? (
                    <PlotlyDistributionChart 
                      distributionData={analysisResult.distribution_data}
                      userScore={analysisResult.biodiversity_score}
                      className="w-full"
                    />
                  ) : (
                    <div style={{
                      background: '#1F2937',
                      padding: '1.5rem',
                      borderRadius: '8px',
                      border: '2px solid rgba(16, 185, 129, 0.6)',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                      maxWidth: '100%',
                      margin: '0 auto'
                    }}>
                      <div style={{
                        width: '100%',
                        height: 'clamp(250px, 60vw, 320px)',
                        background: 'linear-gradient(to bottom, rgba(6, 78, 59, 0.3), black)',
                        borderRadius: '4px',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10B981',
                        fontFamily: 'monospace'
                      }}>
                        <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', marginBottom: '1rem' }}>[LOADING DISTRIBUTION...]</div>
                        <div style={{ fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)', marginTop: '0.5rem', color: '#9CA3AF' }}>Processing chart data</div>
                      </div>
                    </div>
                  )}
                </div>
                <p style={{
                  fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
                  color: '#9CA3AF',
                  marginTop: '1rem',
                  textAlign: 'center',
                  fontFamily: 'monospace'
                }}>
                  Interactive distribution with ecosystem benchmarks and hover data
                </p>
              </div>
            </div>

            {/* 4. Grad-CAM Heatmap (Matplotlib Image) */}
            <div style={{
              width: '100%',
              maxWidth: '1000px',
              padding: '2px',
              background: 'linear-gradient(90deg, #10B981, #34D399, #10B981)',
              borderRadius: '22px',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
            }}>
              <div style={{
                background: 'black',
                borderRadius: '20px',
                padding: '2rem',
                border: '1px solid rgba(16, 185, 129, 0.5)'
              }}>
                <h3 style={{
                  fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  color: '#10B981',
                  fontFamily: 'monospace'
                }}>
                  // OUTPUT 4: GRAD-CAM HEATMAP
                </h3>
                <div style={{ textAlign: 'center' }}>
                  <GradCAMHeatmap 
                    heatmapImage={analysisResult.gradcam_image}
                    biodiversityScore={analysisResult.biodiversity_score}
                  />
                </div>
              </div>
            </div>

            {/* System Info */}
            <div style={{
              width: '100%',
              maxWidth: '800px',
              padding: '2px',
              background: 'linear-gradient(90deg, #10B981, #34D399, #10B981)',
              borderRadius: '22px',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
            }}>
              <div style={{
                background: 'black',
                borderRadius: '20px',
                padding: '1.5rem',
                border: '1px solid rgba(16, 185, 129, 0.5)'
              }}>
                <h3 style={{
                  fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  textAlign: 'center',
                  color: '#10B981',
                  fontFamily: 'monospace'
                }}>
                  // SYSTEM OUTPUT
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                  fontFamily: 'monospace'
                }}>
                  <div style={{ color: '#D1D5DB' }}>
                    <span style={{ color: '#10B981' }}>SIZE:</span> {analysisResult.file_size_mb || 'N/A'}MB
                  </div>
                  <div style={{ color: '#D1D5DB' }}>
                    <span style={{ color: '#10B981' }}>DURATION:</span> {analysisResult.duration ? analysisResult.duration.toFixed(1) : 'N/A'}s
                  </div>
                  <div style={{ color: '#D1D5DB' }}>
                    <span style={{ color: '#10B981' }}>SAMPLE_RATE:</span> {analysisResult.sample_rate || 'N/A'}Hz
                  </div>
                  <div style={{ color: '#D1D5DB' }}>
                    <span style={{ color: '#10B981' }}>STATUS:</span> ANALYSIS_COMPLETE
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
