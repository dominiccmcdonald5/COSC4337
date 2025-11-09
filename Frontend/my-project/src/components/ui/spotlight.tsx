"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type SpotlightProps = {
  className?: string;
  fill?: string;
};

export const Spotlight = ({ className, fill }: SpotlightProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <svg
      className={cn(
        "animate-pulse opacity-50 transition duration-300",
        className
      )}
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient
          id="spotlight"
          cx={`${(mousePosition.x / window.innerWidth) * 100}%`}
          cy={`${(mousePosition.y / window.innerHeight) * 100}%`}
          r="20%"
        >
          <stop offset="0%" stopColor={fill || "white"} stopOpacity="0.6" />
          <stop offset="100%" stopColor={fill || "white"} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#spotlight)" />
    </svg>
  );
};