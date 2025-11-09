import { motion } from "framer-motion";
import { WavyBackground } from "./wavy-background";
import { Spotlight } from "./spotlight";
import { FloatingNav } from "./floating-nav";

const BackgroundBeams = () => {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, transparent, black)' }}></div>
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            background: 'linear-gradient(to bottom, rgba(52, 211, 153, 0.2), transparent)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 2 + 0.5}px`,
            height: `${Math.random() * 200 + 100}px`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

const GridBackground = () => {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <div 
        style={{
          width: '100%',
          height: '100%',
          opacity: 0.2,
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
};

export const AboutBioacoustics = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'black', color: 'white', position: 'relative', overflow: 'hidden' }}>
      <WavyBackground 
        className=""
        containerClassName=""
        colors={["#10B981", "#059669", "#047857", "#065F46", "#064E3B"]}
        waveWidth={50}
        backgroundFill="black"
        blur={10}
        speed="fast"
        waveOpacity={0.5}
      >
        <FloatingNav />
        
        <Spotlight
          className=""
          fill="#10B981"
        />

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '0 16px'
          }}
        >
          <div style={{ maxWidth: '896px', margin: '0 auto', textAlign: 'center' }}>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                fontSize: 'clamp(48px, 7vw, 96px)',
                fontWeight: 'bold',
                background: 'linear-gradient(to bottom, white, #10B981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '32px'
              }}
            >
              About Bioacoustics
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{ fontSize: 'clamp(18px, 2vw, 24px)', color: '#D1D5DB', lineHeight: '1.6' }}
            >
              <p>
                Bioacoustics is the study of sound production, dispersion, and reception in animals and plants. 
                Our project harnesses the power of artificial intelligence to analyze audio recordings from 
                natural environments to assess biodiversity levels.
              </p>

              <p>
                Through advanced machine learning algorithms, we can identify and classify various species 
                based on their unique acoustic signatures. This non-invasive method allows researchers and 
                conservationists to monitor ecosystem health and biodiversity without disturbing wildlife habitats.
              </p>

              <p>
                Our Acoustic Diversity Index (ADI) provides a quantitative measure of biodiversity by analyzing 
                the complexity and richness of soundscapes. The system generates four key outputs:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '32px' }}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.2), rgba(0, 0, 0, 0.4))',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#10B981', marginBottom: '12px' }}>ADI Score</h3>
                  <p style={{ color: '#D1D5DB' }}>
                    A numerical biodiversity index that quantifies the acoustic diversity of the environment.
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.2), rgba(0, 0, 0, 0.4))',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#10B981', marginBottom: '12px' }}>Mel Spectrogram</h3>
                  <p style={{ color: '#D1D5DB' }}>
                    Visual representation of audio frequencies over time, revealing patterns in the soundscape.
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.2), rgba(0, 0, 0, 0.4))',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#10B981', marginBottom: '12px' }}>Score Distribution</h3>
                  <p style={{ color: '#D1D5DB' }}>
                    Interactive visualization showing the distribution of biodiversity scores across the recording.
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.2), rgba(0, 0, 0, 0.4))',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#10B981', marginBottom: '12px' }}>Grad-CAM Heatmap</h3>
                  <p style={{ color: '#D1D5DB' }}>
                    Heat map visualization highlighting the most important acoustic features for biodiversity assessment.
                  </p>
                </motion.div>
              </div>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                style={{ fontSize: '20px', color: '#10B981', fontWeight: '600', marginTop: '32px' }}
              >
                Join us in revolutionizing biodiversity monitoring through the power of sound and AI.
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      </WavyBackground>

      <BackgroundBeams />
      <GridBackground />
    </div>
  );
};