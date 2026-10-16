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
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-[#E7E7E3] hover:border-[#4169E1]/40 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 group">
      
      {/* Game Visual Header Illustration with subtle background dots */}
      <div className="h-48 bg-[#F5F5F1] relative flex items-center justify-center p-6 border-b border-[#E7E7E3] overflow-hidden select-none">
        {/* Subtle decorative dotted matrix in background of illustration */}
        <div 
          aria-hidden="true" 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#777B83 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}
        />
        {type === 'ramudu-seetha' && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Minimalist Card Stack Illustration */}
            <div className="absolute w-24 h-32 bg-white rounded-xl border border-[#E7E7E3] shadow-xs rotate-[-6deg] -translate-x-6 flex flex-col items-center justify-between p-2.5">
              <span className="text-[10px] font-mono text-[#777B83]">1000</span>
              <div className="w-8 h-8 rounded-full bg-[#4169E1]/10 flex items-center justify-center text-[#4169E1] font-bold text-xs">
                R
              </div>
              <span className="text-[10px] font-semibold text-[#202124]">Ramudu</span>
            </div>

            <div className="absolute w-24 h-32 bg-white rounded-xl border border-[#E7E7E3] shadow-md rotate-[6deg] translate-x-6 flex flex-col items-center justify-between p-2.5">
              <span className="text-[10px] font-mono text-[#777B83]">1000</span>
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-700 font-bold text-xs">
                S
              </div>
              <span className="text-[10px] font-semibold text-[#202124]">Seetha</span>
            </div>
          </div>
        )}

        {type === 'housy' && (
          <div className="relative w-full h-full flex items-center justify-center gap-3">
            {/* Sleek Tambola Ticket Grid & Wooden Coin */}
            <div className="w-36 h-28 bg-white rounded-xl border border-[#E7E7E3] p-2 flex flex-col justify-between shadow-xs">
              <div className="grid grid-cols-5 gap-1 text-[9px] font-mono text-center">
                <span className="p-1 bg-[#EEF2FD] text-[#4169E1] rounded font-semibold">07</span>
                <span className="p-1 text-[#777B83]">--</span>
                <span className="p-1 bg-[#F5F5F1] rounded font-semibold">23</span>
                <span className="p-1 text-[#777B83]">--</span>
                <span className="p-1 bg-[#EEF2FD] text-[#4169E1] rounded font-semibold">89</span>
              </div>
              <div className="grid grid-cols-5 gap-1 text-[9px] font-mono text-center">
                <span className="p-1 text-[#777B83]">--</span>
                <span className="p-1 bg-[#F5F5F1] rounded font-semibold">14</span>
                <span className="p-1 text-[#777B83]">--</span>
                <span className="p-1 bg-[#EEF2FD] text-[#4169E1] rounded font-semibold">45</span>
                <span className="p-1 text-[#777B83]">--</span>
              </div>
              <div className="grid grid-cols-5 gap-1 text-[9px] font-mono text-center">
                <span className="p-1 bg-[#F5F5F1] rounded font-semibold">02</span>
                <span className="p-1 text-[#777B83]">--</span>
                <span className="p-1 bg-[#EEF2FD] text-[#4169E1] rounded font-semibold">39</span>
                <span className="p-1 text-[#777B83]">--</span>
                <span className="p-1 bg-[#F5F5F1] rounded font-semibold">77</span>
              </div>
            </div>

            {/* Calling Coin */}
            <div className="w-14 h-14 rounded-full bg-white border-2 border-[#4169E1] shadow-md flex flex-col items-center justify-center">
              <span className="text-[9px] uppercase tracking-wider text-[#777B83] font-mono">CALL</span>
              <span className="text-base font-bold text-[#4169E1] font-mono leading-none">45</span>
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
                className="absolute w-20 h-28 bg-white rounded-xl border border-[#E7E7E3] shadow-xs flex flex-col items-center justify-between p-2"
              >
                <span className="text-[9px] font-mono text-[#777B83]">#{i + 1}</span>
                <span className="text-xs font-semibold text-[#202124]">
                  {['Ferrari', 'Porsche', 'Aston', 'McLaren'][i]}
                </span>
                <span className="text-[8px] text-[#4169E1] font-medium">Cars</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content & Metadata */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Zero-Pill Metadata */}
          <div className="flex items-center gap-2 text-xs text-[#777B83] mb-2 font-medium">
            <span>{playerRange}</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Multiplayer</span>
          </div>

          <h3 className="text-xl font-bold text-[#202124] tracking-tight group-hover:text-[#4169E1] transition-colors">
            {title}
          </h3>
          <p className="text-xs font-semibold text-[#4169E1] mt-0.5 mb-2">
            {tagline}
          </p>
          <p className="text-sm text-[#777B83] leading-relaxed">
            {description}
          </p>
        </div>

        <div className="pt-6">
          <button
            onClick={() => onSelect(type)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#F5F5F1] hover:bg-[#4169E1] text-[#202124] hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer touch-target group-hover:bg-[#4169E1] group-hover:text-white focus-visible:ring-2 focus-visible:ring-[#4169E1]"
          >
            <span>Play {title}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
