/**
 * GamesByVT — Room Lobby Component
 * Responsive Lobby with participant presence, copy room code, and host controls.
 * Designed and Developed by Bodepudi Varun Teja
 */

import React, { useState } from 'react';
import { Copy, Check, Crown, Play, Share2, LogOut, Users, Sparkles } from 'lucide-react';
import { GameType, Player, RoomState } from '../types/game.js';
import { getAvatarColorForUid } from '../services/guestAuth.js';

interface LobbyViewProps {
  room: RoomState;
  currentPlayer: Player;
  onSendAction: (action: string, payload?: any) => Promise<any>;
  onLeaveRoom?: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  room,
  currentPlayer,
  onSendAction,
  onLeaveRoom,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [starting, setStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const players = Object.values(room.players);
  const isHost = currentPlayer.isHost;
  const selectedGame = room.selectedGame;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShareInvite = async () => {
    const inviteUrl = `${window.location.origin}/room/${room.code}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my GamesByVT room!',
          text: `Play multiplayer games with me on GamesByVT. Room code: ${room.code}`,
          url: inviteUrl,
        });
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Share API failed, falling back to copy', err);
        }
      }
    }

    // Fallback: copy invite link
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
    } catch {}
  };

  const handleToggleReady = async () => {
    try {
      await onSendAction('setReady', { isReady: !currentPlayer.isReady });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSelectGame = async (game: GameType) => {
    if (!isHost) return;
    try {
      await onSendAction('selectGame', { game });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to select game');
    }
  };

  const handleStartGame = async () => {
    if (!isHost || starting) return;
    setErrorMsg(null);

    const activeCount = players.filter(p => p.isConnected).length;
    if (selectedGame === 'show' && activeCount < 2) {
      setErrorMsg('Show requires at least 2 active players to pass cards.');
      return;
    }

    setStarting(true);
    try {
      await onSendAction('startGame');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start game');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Lobby Header Card with Room Code & Share Invite */}
      <div className="bg-white rounded-2xl border border-[#E7E7E3] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#737780] mb-1 font-medium">
            <span>Room Lobby</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{players.length} / {room.maxPlayers} Guests</span>
          </div>
          <h1 className="text-2xl font-bold text-[#202124] tracking-tight">
            Shared Game Room
          </h1>
          <p className="text-xs text-[#737780] mt-0.5">
            Share this code with your friends.
          </p>
        </div>

        {/* Room Code Display & Share Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-[#FAFAF8] border border-[#E7E7E3] rounded-xl font-mono">
            <span className="text-xs text-[#737780]">CODE:</span>
            <span className="text-xl font-bold text-[#202124] tracking-widest">
              {room.code}
            </span>
          </div>

          <button
            onClick={handleCopyCode}
            aria-label="Copy room code to clipboard"
            className="px-3.5 py-2.5 bg-[#F5F5F1] hover:bg-[#E7E7E3] text-[#202124] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer touch-target focus-visible:ring-2 focus-visible:ring-[#4169E1]"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#238636]" />
                <span className="text-[#238636]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#737780]" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            onClick={handleShareInvite}
            aria-label="Share room invite link"
            className="px-3.5 py-2.5 bg-[#EEF2FD] hover:bg-[#4169E1]/15 text-[#4169E1] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer touch-target focus-visible:ring-2 focus-visible:ring-[#4169E1]"
          >
            {copiedInvite ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#238636]" />
                <span className="text-[#238636]">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Invite</span>
              </>
            )}
          </button>

          {onLeaveRoom && (
            <button
              onClick={onLeaveRoom}
              aria-label="Leave room"
              className="px-3 py-2.5 text-xs font-medium text-[#D93025] hover:bg-red-50 rounded-xl flex items-center gap-1 transition-colors cursor-pointer touch-target"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave</span>
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Main Grid: Game Selection (Left) & Participant Roster (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Game Selection & Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl border border-[#E7E7E3] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#202124]">
                Choose Game
              </h2>
              {!isHost && (
                <span className="text-xs text-[#777B83]">
                  Host selects the game
                </span>
              )}
            </div>

            {/* Game Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'housy' as GameType,
                  title: 'Housy (Tambola)',
                  desc: 'Live number calling with 5 winning patterns',
                },
                {
                  id: 'show' as GameType,
                  title: 'Show',
                  desc: 'Keep 3 cards. Pass 1. Repeat.',
                },
                {
                  id: 'ramudu-seetha' as GameType,
                  title: 'Ramudu–Seetha',
                  desc: 'Character scoring engine & rules',
                },
              ].map((game) => {
                const isSelected = selectedGame === game.id;
                return (
                  <button
                    key={game.id}
                    disabled={!isHost}
                    onClick={() => handleSelectGame(game.id)}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all touch-target ${
                      isSelected
                        ? 'border-2 border-[#4169E1] bg-[#EEF2FD]/40 shadow-xs'
                        : 'border-[#E7E7E3] bg-[#FAFAF8] hover:bg-white'
                    } ${!isHost ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div>
                      <span className={`text-xs font-bold block ${isSelected ? 'text-[#4169E1]' : 'text-[#202124]'}`}>
                        {game.title}
                      </span>
                      <p className="text-[11px] text-[#777B83] mt-1 leading-snug">
                        {game.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#E7E7E3]/60 flex items-center justify-between text-[10px] text-[#777B83]">
                      <span>{isSelected ? '● Selected' : 'Available'}</span>
                      {isHost && isSelected && <span className="text-[#4169E1] font-semibold">Active</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Game Preview & Rules summary box */}
            <div className="mt-6 p-4 rounded-xl bg-[#FAFAF8] border border-[#E7E7E3] text-xs text-[#777B83] space-y-1.5">
              <div className="font-semibold text-[#202124]">
                {selectedGame === 'housy' && 'About Housy / Tambola'}
                {selectedGame === 'show' && 'About Show (Passing Card Game)'}
                {selectedGame === 'ramudu-seetha' && 'About Ramudu–Seetha'}
              </div>
              <p className="leading-relaxed">
                {selectedGame === 'housy' &&
                  'Every player receives a 3x9 ticket with 15 unique numbers. The host draws numbers 1–90 live. Players can claim Early Five, Top Line, Middle Line, Bottom Line, and Full House. All claims are verified on the server.'}
                {selectedGame === 'show' &&
                  'Players receive 4 cards from the selected category. In each round, every player secretly selects 1 card to pass clockwise. Once all players submit, cards rotate simultaneously and everyone returns to 4 cards.'}
                {selectedGame === 'ramudu-seetha' &&
                  'Features the confirmed character roster: Ramudu (1000 conditional), Seetha (1000 conditional), Lakshman (900), Hanumal (750), and Vaali (500). Discovery mechanics are awaiting creator confirmation.'}
              </p>
            </div>
          </div>

          {/* Action Row: Ready Status or Start Game */}
          <div className="bg-white rounded-2xl border border-[#E7E7E3] p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[#202124] block">
                {isHost ? 'You are the Room Host' : 'Player Status'}
              </span>
              <p className="text-xs text-[#777B83]">
                {isHost
                  ? 'When players are ready, start the game to distribute tickets/cards.'
                  : 'Toggle ready so the host knows you are prepared.'}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!isHost && (
                <button
                  onClick={handleToggleReady}
                  className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer touch-target ${
                    currentPlayer.isReady
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-[#F5F5F1] text-[#202124] hover:bg-[#E7E7E3]'
                  }`}
                >
                  {currentPlayer.isReady ? '✓ Ready' : 'Mark as Ready'}
                </button>
              )}

              {isHost && (
                <button
                  onClick={handleStartGame}
                  disabled={starting}
                  className="w-full sm:w-auto px-6 py-3 bg-[#4169E1] hover:bg-[#3154C4] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 touch-target focus-visible:ring-2 focus-visible:ring-[#4169E1]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{starting ? 'Starting Game...' : 'Start Game'}</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Participant Roster (1 Col) */}
        <div className="bg-white rounded-2xl border border-[#E7E7E3] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#202124]">
                Guests in Room
              </h2>
              <span className="text-xs font-mono text-[#737780] tabular-nums">
                {players.length} Active
              </span>
            </div>

            {/* Empty State when only host is present */}
            {players.length === 1 && (
              <div className="p-4 mb-3 rounded-xl bg-[#FAFAF8] border border-[#E7E7E3] text-center text-xs text-[#737780]">
                <p className="font-medium text-[#202124]">Your room is ready.</p>
                <p className="mt-0.5">Invite friends to join using the code above.</p>
              </div>
            )}

            <div className="space-y-2.5">
              {players.map((p) => {
                const isMe = p.id === currentPlayer.id;
                const avatarBg = p.avatarColor || getAvatarColorForUid(p.uid || p.id);
                const initial = (p.name || 'G').charAt(0).toUpperCase();

                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-[#E7E7E3] bg-[#FAFAF8] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* CSS-only Initial Avatar */}
                      <div
                        style={{ backgroundColor: avatarBg }}
                        className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs select-none"
                      >
                        {initial}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#202124] truncate">
                            {p.name} {isMe && '(You)'}
                          </span>
                          {p.isHost && (
                            <span title="Host">
                              <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-[#737780] font-mono">
                          <span>{p.shortUid || 'G-00000000'}</span>
                          <span aria-hidden="true">·</span>
                          <span className={`inline-flex items-center gap-1 ${p.isConnected ? 'text-[#238636]' : 'text-amber-600'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.isConnected ? 'bg-[#238636]' : 'bg-amber-500'}`} />
                            {p.isConnected ? 'Online' : 'Reconnecting'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {p.isHost ? (
                        <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                          Host
                        </span>
                      ) : p.isReady ? (
                        <span className="text-[10px] text-[#238636] font-semibold bg-[#EDF7EE] px-2 py-0.5 rounded-md border border-emerald-200/50">
                          Ready
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#737780] bg-[#F5F5F1] px-2 py-0.5 rounded-md">
                          Waiting
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E7E7E3] text-[11px] text-[#737780]">
            Automatic guest session restoration enabled. If a player reloads, their hand and status are preserved.
          </div>
        </div>

      </div>

    </div>
  );
};
