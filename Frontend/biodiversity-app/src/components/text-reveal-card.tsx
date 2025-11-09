"use client";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export const TextRevealCard = ({
  text,
  revealText,
  children,
  className,
}: {
  text: string;
  revealText: string;
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "bg-[#1d1c20] border border-white/[0.2] w-[40rem] h-[15rem] rounded-lg p-8 relative overflow-hidden",
        className
      )}
    >
      <p className="text-sm font-medium text-white/50 mb-4">Hover to reveal</p>
      <div className="h-40 relative flex items-center justify-center">
        <motion.div
          initial={{
            width: "100%",
          }}
          whileHover={{
            width: 0,
          }}
          transition={{
            duration: 0.3,
          }}
          className="absolute bg-[#1d1c20] h-full w-full z-20"
        ></motion.div>
        <div className="bg-[#323238]  h-40  absolute inset-0 z-10  flex items-center justify-center text-white font-mono font-bold text-4xl">
          <span>{text}</span>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-300  h-40 absolute inset-0  z-0  flex items-center justify-center text-white font-mono font-bold text-4xl">
          <span>{revealText}</span>
        </div>
      </div>
      {children}
    </div>
  );
};