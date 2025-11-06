"use client";

import { motion } from "framer-motion";

export const BackgroundBeams = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
      <svg
        className="absolute inset-0 h-full w-full -z-10 pointer-events-none"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_17_60)">
          <g filter="url(#filter0_f_17_60)">
            <path d="M128.6 0H0V322.2L332.5 211.5L128.6 0Z" fill="#10B981" fillOpacity="0.1"/>
            <path d="M0 322.2V400H240H320L332.5 211.5L0 322.2Z" fill="#059669" fillOpacity="0.1"/>
            <path d="M320 400H400V78.75L332.5 211.5L320 400Z" fill="#10B981" fillOpacity="0.1"/>
            <path d="M400 0H128.6L332.5 211.5L400 78.75V0Z" fill="#059669" fillOpacity="0.1"/>
          </g>
        </g>
        <defs>
          <filter
            id="filter0_f_17_60"
            x="-50"
            y="-50"
            width="500"
            height="500"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="50"
              result="effect1_foregroundBlur_17_60"
            />
          </filter>
          <clipPath id="clip0_17_60">
            <rect width="400" height="400" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};

export const BackgroundGradient = ({
  children,
  className = "",
  containerClassName = "",
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };
  return (
    <div className={containerClassName}>
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={
          "relative p-[4px] group transition duration-500 " + className
        }
      >
        <motion.div
          initial={{ backgroundPosition: "0 50%" }}
          animate={{
            backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            backgroundSize: "400% 400%",
          }}
          className="absolute inset-0 rounded-3xl z-[1] opacity-60 group-hover:opacity-100 blur-xl transition duration-500 bg-[radial-gradient(circle_farthest-side_at_0_100%,#10B981,transparent),radial-gradient(circle_farthest-side_at_100%_0,#059669,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#34D399,transparent),radial-gradient(circle_farthest-side_at_0_0,#10B981,#000000)]"
        ></motion.div>
        <motion.div
          initial={{ backgroundPosition: "0 50%" }}
          animate={{
            backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            backgroundSize: "400% 400%",
          }}
          className="absolute inset-0 rounded-3xl z-[1] bg-[radial-gradient(circle_farthest-side_at_0_100%,#10B981,transparent),radial-gradient(circle_farthest-side_at_100%_0,#059669,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#34D399,transparent),radial-gradient(circle_farthest-side_at_0_0,#10B981,#000000)]"
        ></motion.div>

        <div className="relative z-10">{children}</div>
      </motion.div>
    </div>
  );
};