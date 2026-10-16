/**
 * GamesByVT — Top Navigation Bar
 * Follows the 3-Zone Top Bar Contract
 * Designed and Developed by Bodepudi Varun Teja
 */

import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, LogOut } from 'lucide-react';
import { isSoundMuted, setSoundMuted } from '../utils/audio.js';
import { copyUidToClipboard } from '../services/guestAuth.js';

interface HeaderProps {
  currentRoute?: string;
  onNavigate: (route: string) => void;
  onOpenCreate?: () => void;
  activeRoomCode?: string;
  isConnected?: boolean;
  guestUid?: string;
  guestShortUid?: string;
  onLeaveRoom?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute = 'home',
  onNavigate,
  onOpenCreate,
  activeRoomCode,
  isConnected = true,
  guestUid,
  guestShortUid,
  onLeaveRoom,
}) => {
  const [muted, setMuted] = React.useState(isSoundMuted());
  const [copiedUid, setCopiedUid] = useState(false);

  const toggleSound = () => {
    const next = !muted;
    setSoundMuted(next);
    setMuted(next);
  };

  const handleCopyUid = async () => {
    if (!guestUid) return;
    const ok = await copyUidToClipboard(guestUid);
    if (ok) {
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 1800);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#E7E7E3]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => onNavigate('home')}
          className="text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1] rounded-md shrink-0"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg sm:text-xl tracking-tight text-[#202124] group-hover:text-[#4169E1] transition-colors whitespace-nowrap">
              GamesByVT
            </span>
            <span className="text-xs text-[#737780] hidden md:inline-block font-normal">
              · Bodepudi Varun Teja
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#737780]">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors cursor-pointer hover:text-[#202124] whitespace-nowrap ${
              currentRoute === 'home' ? 'text-[#202124] font-semibold' : ''
            }`}
          >
            Games
          </button>
          <button
            onClick={() => onNavigate('about')}
            className={`transition-colors cursor-pointer hover:text-[#202124] whitespace-nowrap ${
              currentRoute === 'about' ? 'text-[#202124] font-semibold' : ''
            }`}
          >
            About & Architecture
          </button>
        </nav>

        {/* Zone 3: Actions, Guest UID, and Room Info */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Guest UID Pill / Details */}
          {guestShortUid && (
            <button
              onClick={handleCopyUid}
              title={`Full Guest UID: ${guestUid} (Click to copy)`}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#E7E7E3] hover:border-[#4169E1]/50 rounded-lg text-xs font-mono text-[#737780] hover:text-[#202124] transition-colors cursor-pointer"
            >
              <span className="text-[10px] text-[#737780] font-sans">UID:</span>
              <span className="font-semibold text-[#202124]">{guestShortUid}</span>
              {copiedUid ? (
                <Check className="w-3 h-3 text-[#238636]" />
              ) : (
                <Copy className="w-3 h-3 text-[#737780]" />
              )}
            </button>
          )}

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleSound}
            aria-label={muted ? 'Unmute game sounds' : 'Mute game sounds'}
            title={muted ? 'Unmute sounds' : 'Mute sounds'}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-[#E7E7E3] text-[#737780] hover:text-[#202124] hover:bg-[#F5F5F1] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#4169E1]"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {activeRoomCode ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E7E7E3] bg-white text-xs font-mono text-[#202124]">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#238636]' : 'bg-amber-500'}`} />
                <span className="font-semibold">{activeRoomCode}</span>
              </div>

              {onLeaveRoom && (
                <button
                  onClick={onLeaveRoom}
                  aria-label="Leave game room"
                  title="Leave Room"
                  className="px-2.5 py-1.5 rounded-lg border border-red-200 text-[#D93025] hover:bg-red-50 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Leave</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenCreate}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#4169E1] hover:bg-[#3154C4] rounded-lg transition-colors whitespace-nowrap shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4169E1]"
            >
              Play Together
            </button>
          )}
        </div>

      </div>

      {/* Sub-Header Minimalist Tagline Bar */}
      <div className="border-t border-[#E7E7E3]/60 bg-[#FAFAF8]/90 px-4 py-1.5 text-center overflow-hidden">
        <p className="text-[11px] sm:text-xs text-[#737780] font-normal tracking-tight truncate max-w-5xl mx-auto">
          Three classic games. One shared room. Bring your friends. Real-time multiplayer synchronization across mobile, tablet, and desktop.
        </p>
      </div>
    </header>
  );
};
