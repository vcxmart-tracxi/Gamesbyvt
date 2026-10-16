/**
 * GamesByVT — Footer
 * Designed and Developed by Bodepudi Varun Teja
 */

import React from 'react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-[#E7E7E3] bg-[#FAFAF8] mt-20 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-[#777B83]">
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#202124]">GamesByVT</span>
            <span aria-hidden="true">·</span>
            <span>Three Games. One Room. Play Together.</span>
          </div>
          <p className="text-xs text-[#777B83]">
            Designed and Developed by <strong className="font-medium text-[#202124]">Bodepudi Varun Teja</strong>
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-[#202124] transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('about')}
            className="hover:text-[#202124] transition-colors cursor-pointer"
          >
            About & Architecture
          </button>
          <span>© {new Date().getFullYear()} GamesByVT</span>
        </div>
      </div>
    </footer>
  );
};
