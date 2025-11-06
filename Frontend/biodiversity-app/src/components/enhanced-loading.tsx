"use client";
import { motion } from "framer-motion";

export const EnhancedLoading = ({ text = "ANALYZING..." }: { text?: string }) => {
  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Pulsing Circles */}
      <div className="relative flex items-center justify-center">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-20 h-20 border-2 border-green-400 rounded-full"
            animate={{
              scale: [1, 2, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}
        <div className="w-6 h-6 bg-green-400 rounded-full" />
      </div>

      {/* Loading Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-green-400 font-mono text-lg font-bold"
      >
        {text.split("").map((char, i) => (
          <motion.span
            key={i}
            animate={{
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.div>

      {/* Progress Bars */}
      <div className="w-64 space-y-2">
        {["Neural Network", "Feature Extraction", "Classification"].map((process, i) => (
          <div key={process} className="space-y-1">
            <div className="text-xs text-green-300 font-mono">{process}</div>
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-green-300"
                animate={{
                  width: ["0%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};