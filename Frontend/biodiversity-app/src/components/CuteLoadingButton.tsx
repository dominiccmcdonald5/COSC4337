import React from 'react';
import { motion } from 'framer-motion';

interface CuteLoadingButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const CuteLoadingButton: React.FC<CuteLoadingButtonProps> = ({
  onClick,
  disabled,
  loading,
  loadingText = "ANALYZING...",
  children,
  className,
  style
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={style}
      whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      animate={loading ? { 
        scale: [1, 1.05, 1],
      } : {}}
      transition={loading ? {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      } : {}}
    >
      <div className="flex items-center justify-center space-x-2">
        {loading ? (
          <>
            {/* Cute animated ecosystem icons */}
            <div className="flex items-center space-x-1">
              {/* Tree icon with wave animation */}
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM4 14a1 1 0 100 2h12a1 1 0 100-2H4z" clipRule="evenodd" />
                </svg>
              </motion.div>

              {/* Spinning gear/analysis icon */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </motion.div>

              {/* Bird icon with wave animation (delayed) */}
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3
                }}
              >
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                </svg>
              </motion.div>

              {/* Sound waves icon */}
              <motion.div 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.343 6.343a9 9 0 1012.728 12.728" />
                </svg>
              </motion.div>
            </div>

            {/* Loading dots */}
            <div className="flex space-x-1 items-center">
              {[0, 1, 2].map((dot) => (
                <motion.div
                  key={dot}
                  className="w-1 h-1 bg-white rounded-full"
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: dot * 0.2
                  }}
                />
              ))}
            </div>

            <span className="text-sm font-normal">{loadingText}</span>
          </>
        ) : (
          children
        )}
      </div>
    </motion.button>
  );
};

export default CuteLoadingButton;