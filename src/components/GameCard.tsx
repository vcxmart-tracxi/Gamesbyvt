/**
 * GamesByVT — Game Selection Card
 * Zero-pill metadata, clean typography, high-design vector art.
 * Designed and Developed by Bodepudi Varun Teja
 */

import React from 'react';
import { ArrowRight, Users, Play } from 'lucide-react';
import { GameType } from '../types/game.js';

interface GameCardProps {
  type: GameType;
  title: string;
  tagline: string;
  description: string;
  playerRange: string;
  onSelect: (type: GameType) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  type,
  title,
  tagline,
  description,
  playerRange,
  onSelect,
}) => {
  const getTaglineColor = () => {
    switch (type) {
      case 'ramudu-seetha':
        return 'text-[#B45309]'; // Warm amber
      case 'housy':
        return 'text-[#3B62D6]'; // Sapphire blue
      case 'show':
        return 'text-[#15803D]'; // Forest sage
      default:
        return 'text-[#3B62D6]';
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-[#E6DFD3] hover:border-[#3B62D6]/40 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 group">
      
      {/* Game Visual Header Illustration with warm cream background */}
      <div className="h-48 bg-[#F7F3EA] relative flex items-center justify-center p-6 border-b border-[#E6DFD3] overflow-hidden select-none">
        {/* Subtle decorative dotted matrix in background of illustration */}
        <div 
          aria-hidden="true" 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#8C857B 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}
        />
        {type === 'ramudu-seetha' && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Minimalist Card Stack Illustration */}
            <div className="absolute w-24 h-32 bg-white rounded-xl border border-[#E6DFD3] shadow-xs rotate-[-6deg] -translate-x-6 flex flex-col items-center justify-between p-2.5">
              <span className="text-[10px] font-mono text-[#8C857B]">1000</span>
              <div className="w-8 h-8 rounded-full bg-[#3B62D6]/10 flex items-center justify-center text-[#3B62D6] font-bold text-xs">
                R
              </div>
              <span className="text-[10px] font-semibold text-[#1C1917]">Ramudu</span>
            </div>

            <div className="absolute w-24 h-32 bg-white rounded-xl border border-[#E6DFD3] shadow-md rotate-[6deg] translate-x-6 flex flex-col items-center justify-between p-2.5">
              <span className="text-[10px] font-mono text-[#8C857B]">1000</span>
              <div className="w-8 h-8 rounded-full bg-[#B45309]/10 flex items-center justify-center text-[#B45309] font-bold text-xs">
                S
              </div>
              <span className="text-[10px] font-semibold text-[#1C1917]">Seetha</span>
            </div>
          </div>
        )}

        {type === 'housy' && (
          <div className="relative w-full h-full flex items-center justify-center gap-3">
            {/* Sleek Tambola Ticket Grid & Wooden Coin */}
            <div className="w-36 h-28 bg-white rounded-xl border border-[#E6DFD3] p-2 flex flex-col justify-between shadow-xs">
              <div className="grid grid-cols-5 gap-1 text-[9px] font-mono text-center">
                <span className="p-1 bg-[#EBF0FC] text-[#3B62D6] rounded font-semibold">07</span>
                <span className="p-1 text-[#8C857B]">--</span>
                <span className="p-1 bg-[#F3EFE6] text-[#57534E] rounded font-semibold">23</span>
                <span className="p-1 text-[#8C857B]">--</span>
                <span className="p-1 bg-[#EBF0FC] text-[#3B62D6] rounded font-semibold">89</span>
              </div>
              <div className="grid grid-cols-5 gap-1 text-[9px] font-mono text-center">
                <span className="p-1 text-[#8C857B]">--</span>
                <span className="p-1 bg-[#F3EFE6] text-[#57534E] rounded font-semibold">14</span>
                <span className="p-1 text-[#8C857B]">--</span>
                <span className="p-1 bg-[#EBF0FC] text-[#3B62D6] rounded font-semibold">45</span>
                <span className="p-1 text-[#8C857B]">--</span>
              </div>
              <div className="grid grid-cols-5 gap-1 text-[9px] font-mono text-center">
                <span className="p-1 bg-[#F3EFE6] text-[#57534E] rounded font-semibold">02</span>
                <span className="p-1 text-[#8C857B]">--</span>
                <span className="p-1 bg-[#EBF0FC] text-[#3B62D6] rounded font-semibold">39</span>
                <span className="p-1 text-[#8C857B]">--</span>
                <span className="p-1 bg-[#F3EFE6] text-[#57534E] rounded font-semibold">77</span>
              </div>
            </div>

            {/* Calling Coin */}
            <div className="w-14 h-14 rounded-full bg-white border-2 border-[#3B62D6] shadow-md flex flex-col items-center justify-center">
              <span className="text-[9px] uppercase tracking-wider text-[#8C857B] font-mono">CALL</span>
              <span className="text-base font-bold text-[#3B62D6] font-mono leading-none">45</span>
            </div>
          </div>
        )}

        {type === 'show' && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* 4 Cards Fanning Circle */}
            {[-18, -6, 6, 18].map((angle, i) => (
              <div
                key={i}
                style={{ transform: `rotate(${angle}deg) translateY(${Math.abs(angle) * 0.4}px)` }}
                className="absolute w-20 h-28 bg-white rounded-xl border border-[#E6DFD3] shadow-xs flex flex-col items-center justify-between p-2"
              >
                <span className="text-[9px] font-mono text-[#8C857B]">#{i + 1}</span>
                <span className="text-xs font-semibold text-[#1C1917]">
                  {['Ferrari', 'Porsche', 'Aston', 'McLaren'][i]}
                </span>
                <span className="text-[8px] text-[#15803D] font-medium">Cars</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content & Metadata */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Zero-Pill Metadata */}
          <div className="flex items-center gap-2 text-xs text-[#8C857B] mb-2 font-medium">
            <span>{playerRange}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#57534E]">Real-time Multiplayer</span>
          </div>

          <h3 className="text-xl font-bold text-[#1C1917] tracking-tight group-hover:text-[#3B62D6] transition-colors">
            {title}
          </h3>
          <p className={`text-xs font-semibold mt-0.5 mb-2 ${getTaglineColor()}`}>
            {tagline}
          </p>
          <p className="text-sm text-[#57534E] leading-relaxed">
            {description}
          </p>
        </div>

        <div className="pt-6">
          <button
            onClick={() => onSelect(type)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#F3EFE6] hover:bg-[#3B62D6] text-[#1C1917] hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer touch-target group-hover:bg-[#3B62D6] group-hover:text-white focus-visible:ring-2 focus-visible:ring-[#3B62D6]"
          >
            <span>Play {title}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
