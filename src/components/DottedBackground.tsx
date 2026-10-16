/**
 * GamesByVT — DottedBackground Component
 * Full-screen, low-opacity, responsive grid of moving dots and geometric shapes using CSS animations.
 * Designed and Developed by Bodepudi Varun Teja
 */

import React from 'react';

export const DottedBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* 1. Full-screen moving grid of dots using pure CSS background animation */}
      <div className="absolute inset-0 opacity-[0.22] [background-image:radial-gradient(#4169E1_1.2px,transparent_1.2px),radial-gradient(#737780_1px,transparent_1px)] [background-size:36px_36px,72px_72px] [background-position:0_0,36px_36px] animate-[movingDottedGrid_30s_linear_infinite]" />

      {/* 2. Floating Geometric Shape: Dotted Orbit Circle (Top-Left) */}
      <div className="absolute top-[8%] left-[6%] w-64 h-64 sm:w-80 sm:h-80 opacity-[0.28] animate-[shapeFloatOrbit_24s_ease-in-out_infinite]">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full animate-[spin_60s_linear_infinite]"
        >
          {/* Outer circle of dots */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="#4169E1"
            strokeWidth="2.5"
            strokeDasharray="1 14"
            strokeLinecap="round"
          />
          {/* Middle circle of dots */}
          <circle
            cx="100"
            cy="100"
            r="55"
            fill="none"
            stroke="#737780"
            strokeWidth="2"
            strokeDasharray="1 12"
            strokeLinecap="round"
          />
          {/* Inner circle of dots */}
          <circle
            cx="100"
            cy="100"
            r="25"
            fill="none"
            stroke="#4169E1"
            strokeWidth="3"
            strokeDasharray="1 8"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="3" fill="#4169E1" />
        </svg>
      </div>

      {/* 3. Floating Geometric Shape: Dotted Diamond Card Motif (Top-Right) */}
      <div className="absolute top-[12%] right-[8%] w-56 h-56 sm:w-72 sm:h-72 opacity-[0.25] animate-[shapeFloatDiamond_20s_ease-in-out_infinite]">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full animate-[shapePulseScale_12s_ease-in-out_infinite]"
        >
          {/* Outer diamond path with dotted dashes */}
          <polygon
            points="100,15 185,100 100,185 15,100"
            fill="none"
            stroke="#4169E1"
            strokeWidth="2.5"
            strokeDasharray="1 10"
            strokeLinecap="round"
          />
          {/* Inner nested diamond */}
          <polygon
            points="100,45 155,100 100,155 45,100"
            fill="none"
            stroke="#737780"
            strokeWidth="2"
            strokeDasharray="1 8"
            strokeLinecap="round"
          />
          {/* Corner accent dots */}
          <circle cx="100" cy="15" r="3" fill="#4169E1" />
          <circle cx="185" cy="100" r="3" fill="#4169E1" />
          <circle cx="100" cy="185" r="3" fill="#4169E1" />
          <circle cx="15" cy="100" r="3" fill="#4169E1" />
          <circle cx="100" cy="100" r="3.5" fill="#4169E1" />
        </svg>
      </div>

      {/* 4. Floating Geometric Shape: Dotted Hexagon & Cluster (Bottom-Left) */}
      <div className="absolute bottom-[10%] left-[8%] w-60 h-60 sm:w-72 sm:h-72 opacity-[0.24] animate-[shapeFloatHex_26s_ease-in-out_infinite]">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full animate-[spin_80s_linear_infinite_reverse]"
        >
          <polygon
            points="100,15 175,55 175,145 100,185 25,145 25,55"
            fill="none"
            stroke="#737780"
            strokeWidth="2.5"
            strokeDasharray="1 11"
            strokeLinecap="round"
          />
          <polygon
            points="100,45 150,75 150,125 100,155 50,125 50,75"
            fill="none"
            stroke="#4169E1"
            strokeWidth="2"
            strokeDasharray="1 9"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="4" fill="#737780" />
        </svg>
      </div>

      {/* 5. Floating Geometric Shape: 4x4 Dotted Matrix Grid (Bottom-Right) */}
      <div className="absolute bottom-[14%] right-[10%] w-52 h-52 sm:w-64 sm:h-64 opacity-[0.26] animate-[shapeFloatGrid_22s_ease-in-out_infinite]">
        <svg viewBox="0 0 160 160" className="w-full h-full">
          {[20, 60, 100, 140].map((x, i) =>
            [20, 60, 100, 140].map((y, j) => {
              const isAccent = (i + j) % 2 === 0;
              return (
                <circle
                  key={`${i}-${j}`}
                  cx={x}
                  cy={y}
                  r={isAccent ? 3.5 : 2.5}
                  fill={isAccent ? '#4169E1' : '#737780'}
                  className="animate-[pulse_4s_ease-in-out_infinite]"
                  style={{ animationDelay: `${(i + j) * 0.25}s` }}
                />
              );
            })
          )}
        </svg>
      </div>

      {/* 6. Subtle S-Wave of moving dots across the center */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[90vw] max-w-5xl h-24 opacity-[0.18] animate-[shapeFloatWave_18s_ease-in-out_infinite]">
        <svg viewBox="0 0 800 100" preserveAspectRatio="none" className="w-full h-full">
          <path
            d="M0,50 Q200,10 400,50 T800,50"
            fill="none"
            stroke="#4169E1"
            strokeWidth="2.5"
            strokeDasharray="1 16"
            strokeLinecap="round"
          />
          <path
            d="M0,65 Q200,25 400,65 T800,65"
            fill="none"
            stroke="#737780"
            strokeWidth="1.8"
            strokeDasharray="1 20"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* 7. Soft Vignette: Keeps center stage comfortable and ensures flawless contrast */}
      <div className="absolute inset-0 bg-radial-[circle_at_50%_35%] from-transparent via-[#FAFAF8]/35 to-[#FAFAF8]/85 pointer-events-none" />

      {/* Scoped CSS Keyframe animations for hardware-accelerated movement */}
      <style>{`
        @keyframes movingDottedGrid {
          0% {
            background-position: 0 0, 36px 36px;
          }
          100% {
            background-position: 72px 72px, 108px 108px;
          }
        }
        @keyframes shapeFloatOrbit {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(18px, -24px, 0) scale(1.04);
          }
        }
        @keyframes shapeFloatDiamond {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(-20px, 22px, 0) rotate(-6deg);
          }
        }
        @keyframes shapePulseScale {
          0%, 100% {
            transform: scale(0.96);
          }
          50% {
            transform: scale(1.05);
          }
        }
        @keyframes shapeFloatHex {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(24px, -18px, 0) scale(1.06);
          }
        }
        @keyframes shapeFloatGrid {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(-16px, -20px, 0) rotate(5deg);
          }
        }
        @keyframes shapeFloatWave {
          0%, 100% {
            transform: translate3d(-50%, 0, 0);
          }
          50% {
            transform: translate3d(-50%, -14px, 0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[movingDottedGrid_30s_linear_infinite\\],
          .animate-\\[shapeFloatOrbit_24s_ease-in-out_infinite\\],
          .animate-\\[shapeFloatDiamond_20s_ease-in-out_infinite\\],
          .animate-\\[shapePulseScale_12s_ease-in-out_infinite\\],
          .animate-\\[shapeFloatHex_26s_ease-in-out_infinite\\],
          .animate-\\[shapeFloatGrid_22s_ease-in-out_infinite\\],
          .animate-\\[shapeFloatWave_18s_ease-in-out_infinite\\],
          .animate-\\[spin_60s_linear_infinite\\],
          .animate-\\[spin_80s_linear_infinite_reverse\\] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
