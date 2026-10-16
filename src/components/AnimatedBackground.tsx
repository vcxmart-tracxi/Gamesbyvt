/**
 * GamesByVT — Animated Dotted & Geometric Background Design
 * Floating dotted shapes, orbital rings, and dynamic grid movement.
 * Designed and Developed by Bodepudi Varun Teja
 */

import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* 1. Underlying Base Dotted Grid */}
      <div 
        className="absolute inset-0 opacity-[0.45] transition-opacity duration-1000"
        style={{
          backgroundImage: `radial-gradient(circle, #D5D5CF 1.2px, transparent 1.2px)`,
          backgroundSize: '28px 28px',
          backgroundPosition: '0 0',
        }}
      />

      {/* 2. Floating Animated Geometric Shapes with Dotted Outlines */}
      
      {/* Shape A: Dotted Orbiting Circle (Top Right) */}
      <div className="absolute -top-12 -right-12 sm:top-12 sm:right-16 w-72 h-72 sm:w-96 sm:h-96 opacity-60 animate-orbit-slow">
        <svg viewBox="0 0 400 400" className="w-full h-full fill-none">
          {/* Outer dotted circle */}
          <circle
            cx="200"
            cy="200"
            r="160"
            stroke="#4169E1"
            strokeWidth="1.5"
            strokeDasharray="4 8"
            className="opacity-40"
          />
          {/* Inner dotted orbit */}
          <circle
            cx="200"
            cy="200"
            r="110"
            stroke="#737780"
            strokeWidth="1.2"
            strokeDasharray="3 6"
            className="opacity-30"
          />
          {/* Small orbiting accent dot */}
          <circle cx="360" cy="200" r="4" fill="#4169E1" className="opacity-70" />
          <circle cx="90" cy="200" r="3" fill="#238636" className="opacity-60" />
        </svg>
      </div>

      {/* Shape B: Floating Dotted Diamond / Card Wireframe (Mid-Left) */}
      <div className="absolute top-1/3 -left-16 sm:left-12 w-64 h-64 sm:w-80 sm:h-80 opacity-50 animate-float-reverse">
        <svg viewBox="0 0 300 300" className="w-full h-full fill-none">
          {/* Rotated dotted square */}
          <rect
            x="75"
            y="75"
            width="150"
            height="150"
            rx="24"
            transform="rotate(45 150 150)"
            stroke="#4169E1"
            strokeWidth="1.5"
            strokeDasharray="5 9"
            className="opacity-35"
          />
          {/* Concentric diamond dots */}
          <rect
            x="100"
            y="100"
            width="100"
            height="100"
            rx="16"
            transform="rotate(45 150 150)"
            stroke="#737780"
            strokeWidth="1.2"
            strokeDasharray="3 7"
            className="opacity-25"
          />
          {/* Vertex dots */}
          <circle cx="150" cy="44" r="3.5" fill="#4169E1" className="opacity-60" />
          <circle cx="256" cy="150" r="3.5" fill="#4169E1" className="opacity-60" />
          <circle cx="150" cy="256" r="3.5" fill="#4169E1" className="opacity-60" />
          <circle cx="44" cy="150" r="3.5" fill="#4169E1" className="opacity-60" />
        </svg>
      </div>

      {/* Shape C: Moving Dotted Constellation / Hexagon Matrix (Bottom Right) */}
      <div className="absolute bottom-10 right-4 sm:right-28 w-80 h-80 opacity-55 animate-float-slow">
        <svg viewBox="0 0 350 350" className="w-full h-full fill-none">
          {/* Dotted rounded polygon */}
          <polygon
            points="175,30 300,105 300,245 175,320 50,245 50,105"
            stroke="#737780"
            strokeWidth="1.2"
            strokeDasharray="4 8"
            className="opacity-30"
          />
          <polygon
            points="175,70 260,120 260,225 175,275 90,225 90,120"
            stroke="#4169E1"
            strokeWidth="1.2"
            strokeDasharray="3 6"
            className="opacity-25"
          />
          {/* Connecting node dots */}
          <circle cx="175" cy="30" r="4" fill="#4169E1" className="opacity-50" />
          <circle cx="300" cy="105" r="3" fill="#737780" className="opacity-50" />
          <circle cx="300" cy="245" r="3" fill="#737780" className="opacity-50" />
          <circle cx="175" cy="320" r="4" fill="#238636" className="opacity-50" />
          <circle cx="50" cy="245" r="3" fill="#737780" className="opacity-50" />
          <circle cx="50" cy="105" r="3" fill="#737780" className="opacity-50" />
        </svg>
      </div>

      {/* Shape D: Subtle Drifting Wave of Floating Dotted Clusters */}
      <div className="absolute top-2/3 left-1/4 w-96 h-48 opacity-40 animate-drift-horizontal hidden md:block">
        <svg viewBox="0 0 400 120" className="w-full h-full fill-none">
          <path
            d="M 10,60 Q 100,10 200,60 T 390,60"
            stroke="#4169E1"
            strokeWidth="1.5"
            strokeDasharray="4 10"
            className="opacity-30"
          />
          <path
            d="M 10,80 Q 100,30 200,80 T 390,80"
            stroke="#737780"
            strokeWidth="1.2"
            strokeDasharray="3 8"
            className="opacity-20"
          />
        </svg>
      </div>

      {/* Gentle radial gradient to keep content area perfectly readable */}
      <div 
        className="absolute inset-0 bg-radial from-transparent via-[#FAFAF8]/50 to-[#FAFAF8]/90" 
      />
    </div>
  );
};
