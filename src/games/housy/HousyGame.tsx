/**
 * GamesByVT — Housy / Tambola Game Component
 * Live Number Calling, 3x9 Ticket, Touch-friendly cells & Server-side Claims
 * Designed and Developed by Bodepudi Varun Teja
 */

import React, { useState } from 'react';
import { Volume2, Trophy, AlertCircle, Check, ArrowRight, Grid, Play, Pause, RotateCcw } from 'lucide-react';
import { Player, PrivatePlayerData, RoomState, TambolaPattern } from '../../types/game.js';
import { PATTERN_LABELS, PATTERN_DESCRIPTIONS } from './rules.js';
import { playNumberChime, playSuccessFanfare } from '../../utils/audio.js';

interface HousyGameProps {
  room: RoomState;
  currentPlayer: Player;
  privateData: PrivatePlayerData | null;
  onSendAction: (action: string, payload?: any) => Promise<any>;
}

export const HousyGame: React.FC<HousyGameProps> = ({
  room,
  currentPlayer,
  privateData,
  onSendAction,
}) => {
  const [showFullBoard, setShowFullBoard] = useState(false);
  const [claimingPattern, setClaimingPattern] = useState<TambolaPattern | null>(null);
  const [callingNumber, setCallingNumber] = useState(false);
  const [manualMarks, setManualMarks] = useState<number[]>([]);

  const tambolaState = room.tambolaState;
  const currentNumber = tambolaState?.currentNumber;
  const calledNumbers = tambolaState?.calledNumbers || [];
  const calledSet = new Set(calledNumbers);
  const verifiedWinners = tambolaState?.verifiedWinners || [];
  const recentClaims = tambolaState?.recentClaims || [];

  const ticket = privateData?.tambola?.ticket;
  const serverMarks = privateData?.tambola?.markedNumbers || [];

  // Play audio when a new number arrives
  const prevNumberRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (currentNumber !== null && currentNumber !== undefined && currentNumber !== prevNumberRef.current) {
      prevNumberRef.current = currentNumber;
      playNumberChime(currentNumber);
    }
  }, [currentNumber]);

  // Play audio when a winner is announced
  const prevWinnerCountRef = React.useRef(verifiedWinners.length);
  React.useEffect(() => {
    if (verifiedWinners.length > prevWinnerCountRef.current) {
      prevWinnerCountRef.current = verifiedWinners.length;
      playSuccessFanfare();
    }
  }, [verifiedWinners.length]);

  const handleCallNext = async () => {
    if (callingNumber) return;
    setCallingNumber(true);
    try {
      await onSendAction('housyCallNextNumber');
    } catch (err) {
      console.error(err);
    } finally {
      setCallingNumber(false);
    }
  };

  const handleClaim = async (pattern: TambolaPattern) => {
    setClaimingPattern(pattern);
    try {
      await onSendAction('housyClaimPattern', { pattern });
    } catch (err) {
      console.error(err);
    } finally {
      setClaimingPattern(null);
    }
  };

  const toggleManualMark = (num: number) => {
    setManualMarks(prev => 
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
    );
  };

  const isMarked = (num: number | null): boolean => {
    if (num === null) return false;
    return serverMarks.includes(num) || manualMarks.includes(num) || calledSet.has(num);
  };

  const patterns: TambolaPattern[] = ['earlyFive', 'topLine', 'middleLine', 'bottomLine', 'fullHouse'];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Bar: Room info & Return */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E3]">
        <div className="flex items-center gap-2 text-xs text-[#777B83]">
          <span className="font-semibold text-[#202124]">Housy / Tambola</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{calledNumbers.length} / 90 Numbers Called</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFullBoard(!showFullBoard)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#202124] bg-white border border-[#E7E7E3] hover:bg-[#F5F5F1] rounded-lg transition-colors cursor-pointer"
          >
            <Grid className="w-3.5 h-3.5 text-[#777B83]" />
            <span>{showFullBoard ? 'Hide 1-90 Board' : 'View 1-90 Board'}</span>
          </button>
          
          {currentPlayer.isHost && (
            <button
              onClick={() => onSendAction('returnToLobby')}
              className="text-xs font-medium text-[#777B83] hover:text-[#202124] px-3 py-1.5 rounded-lg border border-[#E7E7E3] hover:bg-[#F5F5F1] transition-colors cursor-pointer"
            >
              Return to Lobby
            </button>
          )}
        </div>
      </div>

      {/* Hero Caller Section */}
      <div className="bg-white rounded-2xl border border-[#E7E7E3] p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Prominent Number Coin Display */}
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#FAFAF8] border-3 border-[#4169E1] shadow-md flex flex-col items-center justify-center shrink-0">
            <span className="text-[10px] tracking-widest text-[#777B83] font-semibold uppercase">
              CURRENT
            </span>
            <span className="text-4xl sm:text-5xl font-black font-mono text-[#4169E1] tabular-nums leading-none mt-0.5">
              {currentNumber !== null && currentNumber !== undefined ? currentNumber : '--'}
            </span>
          </div>

          <div>
            <span className="text-xs text-[#777B83] font-medium block">
              Live Tambola Board
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#202124]">
              {currentNumber ? `Number ${currentNumber} Called!` : 'Awaiting First Number'}
            </h2>
            <p className="text-xs text-[#777B83] mt-1 max-w-sm">
              Numbers are drawn authoritatively on the server and verified across all connected devices.
            </p>
          </div>
        </div>

        {/* Host Call Control */}
        {currentPlayer.isHost && (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleCallNext}
              disabled={callingNumber || calledNumbers.length >= 90}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#4169E1] hover:bg-[#3154C4] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 touch-target focus-visible:ring-2 focus-visible:ring-[#4169E1]"
            >
              <span>Call Next Number</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* Recent Numbers Strip */}
      {calledNumbers.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E7E7E3] p-3.5 shadow-xs">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 text-xs">
            <span className="font-semibold text-[#202124] shrink-0 text-xs">
              Recent:
            </span>
            {calledNumbers.slice(0, 15).map((num, i) => (
              <span
                key={num}
                className={`font-mono tabular-nums px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 ${
                  i === 0
                    ? 'bg-[#4169E1] text-white'
                    : 'bg-[#F5F5F1] text-[#202124]'
                }`}
              >
                {num}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Full 1-90 Master Board Collapsible */}
      {showFullBoard && (
        <div className="bg-white rounded-2xl border border-[#E7E7E3] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
              1–90 Authoritative Master Board
            </h4>
            <span className="text-xs text-[#777B83]">
              Highlighted numbers have been called
            </span>
          </div>
          <div className="grid grid-cols-10 gap-1 sm:gap-1.5 text-center">
            {Array.from({ length: 90 }, (_, i) => i + 1).map((n) => {
              const isCalled = calledSet.has(n);
              const isCurrent = n === currentNumber;
              return (
                <div
                  key={n}
                  className={`h-8 sm:h-9 flex items-center justify-center rounded-md font-mono text-xs font-medium tabular-nums ${
                    isCurrent
                      ? 'bg-[#4169E1] text-white font-bold ring-2 ring-[#4169E1]/30'
                      : isCalled
                      ? 'bg-[#EEF2FD] text-[#4169E1] font-semibold'
                      : 'bg-[#FAFAF8] text-[#777B83]/60'
                  }`}
                >
                  {n}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Player's Authoritative Ticket */}
      <div className="bg-white rounded-2xl border border-[#E7E7E3] p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-[#202124]">
              Your Official Tambola Ticket
            </h3>
            <p className="text-xs text-[#777B83]">
              Unique 3×9 standard Tambola ticket generated by server. Numbers mark automatically when called.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#777B83]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Called numbers marked</span>
          </div>
        </div>

        {ticket ? (
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[540px] border border-[#E7E7E3] rounded-xl overflow-hidden divide-y divide-[#E7E7E3] bg-[#FAFAF8]">
              {ticket.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-9 divide-x divide-[#E7E7E3]">
                  {row.map((cellNum, cIdx) => {
                    const marked = isMarked(cellNum);
                    const isJustCalled = cellNum === currentNumber;
                    return (
                      <div
                        key={cIdx}
                        onClick={() => cellNum && toggleManualMark(cellNum)}
                        className={`h-14 sm:h-16 flex flex-col items-center justify-center p-1 transition-colors select-none ${
                          cellNum === null
                            ? 'bg-[#FAFAF8]'
                            : marked
                            ? 'bg-emerald-50/80 cursor-pointer'
                            : 'bg-white cursor-pointer hover:bg-[#F5F5F1]'
                        }`}
                      >
                        {cellNum !== null ? (
                          <div className="flex flex-col items-center">
                            <span
                              className={`font-mono text-base sm:text-lg font-bold tabular-nums ${
                                marked
                                  ? 'text-emerald-700 line-through decoration-2'
                                  : 'text-[#202124]'
                              }`}
                            >
                              {cellNum}
                            </span>
                            {marked && (
                              <span className="text-[9px] font-semibold text-emerald-600 mt-0.5">
                                MARKED
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E7E7E3]/60" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#777B83]">
            No ticket available. Please wait for host to start the game.
          </div>
        )}
      </div>

      {/* Pattern Claims Panel */}
      <div className="bg-white rounded-2xl border border-[#E7E7E3] p-5 sm:p-6 shadow-xs">
        <div className="mb-4">
          <h3 className="text-base font-bold text-[#202124]">
            Claim Winning Patterns
          </h3>
          <p className="text-xs text-[#777B83]">
            Claims are verified authoritatively against your ticket numbers and server call history.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {patterns.map((pat) => {
            const winner = verifiedWinners.find(w => w.pattern === pat);
            const isWon = Boolean(winner);
            const isClaiming = claimingPattern === pat;

            return (
              <button
                key={pat}
                onClick={() => handleClaim(pat)}
                disabled={isWon || isClaiming}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all touch-target cursor-pointer ${
                  isWon
                    ? 'bg-emerald-50 border-emerald-200 cursor-not-allowed opacity-90'
                    : 'bg-white border-[#E7E7E3] hover:border-[#4169E1] hover:bg-[#F5F5F1]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#202124]">
                      {PATTERN_LABELS[pat]}
                    </span>
                    {isWon && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <p className="text-[11px] text-[#777B83]">
                    {PATTERN_DESCRIPTIONS[pat]}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#E7E7E3]/60 flex items-center justify-between text-xs font-semibold">
                  {isWon ? (
                    <span className="text-emerald-700 font-medium truncate">
                      Won by {winner?.playerName}
                    </span>
                  ) : (
                    <span className="text-[#4169E1] flex items-center gap-1">
                      {isClaiming ? 'Verifying...' : 'Claim Pattern'}
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Claim History / Feed */}
      {recentClaims.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E7E7E3] p-5 shadow-xs">
          <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider mb-3">
            Recent Claim Activity
          </h4>
          <div className="space-y-2 text-xs">
            {recentClaims.map((claim) => (
              <div
                key={claim.id}
                className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  claim.verified
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {claim.verified ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold">{claim.playerName}</span> claimed{' '}
                    <span className="font-semibold">{PATTERN_LABELS[claim.pattern]}</span>:{' '}
                    {claim.verified ? 'Verified!' : claim.invalidReason}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
