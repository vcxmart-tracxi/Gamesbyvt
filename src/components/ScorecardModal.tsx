/**
 * GamesByVT — Reusable Minimalist Scorecard & Results Component
 * Shared across Ramudu–Seetha, Housy, and Show.
 * Developer: Bodepudi Varun Teja
 */

import React, { useEffect, useState } from 'react';
import { Trophy, CheckCircle2, XCircle, RotateCcw, Home, LogOut, X, Sparkles } from 'lucide-react';
import { GameResultScorecard, Player } from '../types/game.js';

interface ScorecardModalProps {
  scorecard: GameResultScorecard | null;
  currentPlayer: Player;
  isHost: boolean;
  onPlayAgain: () => Promise<void>;
  onReturnToLobby: () => Promise<void>;
  onLeaveRoom: () => void;
  onDismiss: () => void;
}

export const ScorecardModal: React.FC<ScorecardModalProps> = ({
  scorecard,
  currentPlayer,
  isHost,
  onPlayAgain,
  onReturnToLobby,
  onLeaveRoom,
  onDismiss,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  if (!scorecard) return null;

  const myEntry = scorecard.entries.find(e => e.playerId === currentPlayer.id);
  const isWinner = myEntry?.outcome === 'win';
  const isLoss = myEntry?.outcome === 'loss';

  // Trigger brief CSS confetti on win if not reduced motion
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isWinner && !prefersReduced) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 900);
      return () => clearTimeout(timer);
    }
  }, [isWinner]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scorecard-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs overflow-y-auto"
      onClick={onDismiss}
    >
      {/* CSS-only confetti burst (lightweight, zero external libraries) */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => {
            const left = 35 + (i % 8) * 4 + (Math.random() * 6 - 3);
            const delay = (i * 25) % 300;
            const colors = ['#4169E1', '#238636', '#D97706', '#7C3AED'];
            const bg = colors[i % colors.length];
            return (
              <span
                key={i}
                className="confetti-piece"
                style={{
                  left: `${left}%`,
                  top: '30%',
                  backgroundColor: bg,
                  animationDelay: `${delay}ms`,
                }}
              />
            );
          })}
        </div>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg bg-white rounded-2xl border border-[#E7E7E3] shadow-xl p-6 sm:p-8 my-auto relative ${
          isWinner ? 'animate-win-card' : isLoss ? 'animate-loss-card' : ''
        }`}
      >
        {/* Dismiss X button */}
        <button
          onClick={onDismiss}
          aria-label="Dismiss scorecard"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-[#737780] hover:text-[#202124] hover:bg-[#F5F5F1] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center pb-5 border-b border-[#E7E7E3]">
          <span className="text-[11px] font-mono text-[#4169E1] uppercase tracking-wider block font-semibold mb-1">
            {scorecard.gameTitle} · Official Results
          </span>
          <h2 id="scorecard-title" className="text-xl sm:text-2xl font-bold text-[#202124]">
            {scorecard.winningCondition}
          </h2>

          {/* Personal outcome banner */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold">
            {isWinner ? (
              <span className="inline-flex items-center gap-1.5 text-[#238636] bg-[#EDF7EE] px-3 py-1 rounded-full animate-win-glow-green">
                <CheckCircle2 className="w-3.5 h-3.5 animate-checkmark" />
                <span>You Won this Match!</span>
              </span>
            ) : isLoss ? (
              <span className="inline-flex items-center gap-1.5 text-[#D93025] bg-[#FCE8E6] px-3 py-1 rounded-full">
                <XCircle className="w-3.5 h-3.5" />
                <span>Match Completed · Runner-up</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[#737780] bg-[#F5F5F1] px-3 py-1 rounded-full">
                <span>Completed</span>
              </span>
            )}
          </div>
        </div>

        {/* Table of Participant Standings */}
        <div className="my-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7E7E3] text-[#737780]">
                <th className="py-2 px-2 font-medium">Player</th>
                <th className="py-2 px-2 font-medium">UID</th>
                <th className="py-2 px-2 font-medium">Role / Hand</th>
                <th className="py-2 px-2 font-medium text-right">Result / Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E7E3]">
              {scorecard.entries.map((entry) => {
                const isMe = entry.playerId === currentPlayer.id;
                const isEntryWinner = entry.outcome === 'win';

                return (
                  <tr
                    key={entry.playerId}
                    className={`${isMe ? 'bg-[#EEF2FD]/40 font-medium' : 'hover:bg-[#F5F5F1]/50'}`}
                  >
                    <td className="py-2.5 px-2 text-[#202124]">
                      <span className="font-semibold">{entry.playerName}</span>
                      {isMe && <span className="text-[10px] text-[#4169E1] ml-1">(You)</span>}
                    </td>
                    <td className="py-2.5 px-2 font-mono text-[11px] text-[#737780]">
                      {entry.shortUid}
                    </td>
                    <td className="py-2.5 px-2 text-[#737780]">
                      {entry.roleOrPattern || '—'}
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      {entry.score !== undefined ? (
                        <span className={`font-mono font-bold tabular-nums text-sm ${isEntryWinner ? 'text-[#238636]' : 'text-[#202124]'}`}>
                          {entry.score.toLocaleString()} pts
                        </span>
                      ) : (
                        <span className={`font-semibold text-xs ${isEntryWinner ? 'text-[#238636]' : 'text-[#737780]'}`}>
                          {isEntryWinner ? 'Winner' : 'Participant'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Minimal Action Buttons: Play Again, Return to Lobby, Leave Room */}
        <div className="pt-4 border-t border-[#E7E7E3] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isHost ? (
              <button
                onClick={onPlayAgain}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#4169E1] hover:bg-[#3154C4] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs touch-target focus-visible:ring-2 focus-visible:ring-[#4169E1]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Play Again</span>
              </button>
            ) : null}

            <button
              onClick={onReturnToLobby}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-[#F5F5F1] hover:bg-[#E7E7E3] text-[#202124] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer touch-target"
            >
              <Home className="w-3.5 h-3.5 text-[#737780]" />
              <span>Lobby</span>
            </button>
          </div>

          <button
            onClick={onLeaveRoom}
            className="w-full sm:w-auto px-3.5 py-2.5 text-xs font-medium text-[#D93025] hover:bg-red-50 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer touch-target"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave Room</span>
          </button>
        </div>

      </div>
    </div>
  );
};
