"use client";
import { cn } from "../lib/utils";
import React, { useEffect, useRef } from "react";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors = ["#10B981", "#34D399", "#059669"],
  waveWidth,
  backgroundFill = "#000000",
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  [key: string]: any;
}) => {
  const noise = useNoise();

  return (
    <div
      className={cn(
        "min-h-screen w-full relative overflow-hidden",
        containerClassName
      )}
      style={{ backgroundColor: backgroundFill }}
    >
      <canvas
        ref={noise}
        className="absolute inset-0 z-0"
        style={{
          ...(props.style || {}),
        }}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};

const useNoise = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawWave = (
      ctx: CanvasRenderingContext2D,
      time: number,
      amplitude: number,
      frequency: number,
      offset: number
    ) => {
      const { width, height } = ctx.canvas;
      ctx.beginPath();
      
      // Create merged wave cluster in center of screen
      const centerY = height * (0.4 + offset * 0.02); // Cluster waves close together
      
      for (let x = 0; x <= width; x += 2) {
        const y = centerY + 
          amplitude * Math.sin((x * frequency) + time) +
          amplitude * 0.5 * Math.sin((x * frequency * 2) + time * 1.5) +
          amplitude * 0.3 * Math.sin((x * frequency * 0.7) + time * 0.8);
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
    };

    const animate = (time: number) => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create fewer waves that appear merged
      const waveConfigs = [
        { amplitude: 40, frequency: 0.005, speed: 0.002, offset: 0 },
        { amplitude: 35, frequency: 0.007, speed: 0.0025, offset: 1 },
        { amplitude: 30, frequency: 0.004, speed: 0.0015, offset: 2 },
        { amplitude: 38, frequency: 0.006, speed: 0.002, offset: 3 }
      ];

      waveConfigs.forEach((config, index) => {
        const opacity = 0.55 + index * 0.12;  // Much higher base opacity from 0.35 to 0.55
        const hue = 158 + index * 3;
        const saturation = 95 - index * 2;     // Increased saturation to 95% with minimal decrease
        const lightness = 65 + index * 12;    // Much brighter base lightness from 55 to 65
        
        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
        ctx.lineWidth = 2.5 + index * 0.5;    // Slightly thicker lines for more visibility
        ctx.filter = "blur(8px)";              // Further reduced blur for maximum brightness
        
        drawWave(
          ctx,
          time * config.speed,
          config.amplitude,
          config.frequency,
          config.offset
        );
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    // Start animation with slight delay
    setTimeout(() => {
      animate(0);
    }, 100);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return canvasRef;
};