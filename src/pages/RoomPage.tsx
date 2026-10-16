/**
 * GamesByVT — Room & Gameplay Controller Page
 * Designed and Developed by Bodepudi Varun Teja
 */

import React, { useState, useEffect, useRef } from 'react';
import { Player, PrivatePlayerData, RoomState } from '../types/game.js';
import {
  apiJoinRoom,
  apiSendAction,
  getStoredSession,
  subscribeToRoomEvents,
  clearStoredSession,
} from '../services/api.js';
import { getGuestIdentity } from '../services/guestAuth.js';
import { LobbyView } from '../components/LobbyView.js';
import { RamuduSeethaGame } from '../games/ramudu-seetha/RamuduSeethaGame.js';
import { HousyGame } from '../games/housy/HousyGame.js';
import { ShowGame } from '../games/show/ShowGame.js';
import { ScorecardModal } from '../components/ScorecardModal.js';
import { JoinCreateModal } from '../components/JoinCreateModal.js';
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';

interface RoomPageProps {
  roomCode: string;
  onNavigate: (route: string) => void;
}

export const RoomPage: React.FC<RoomPageProps> = ({ roomCode, onNavigate }) => {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [privateData, setPrivateData] = useState<PrivatePlayerData | null>(null);
  const [reconnectToken, setReconnectToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal for joining if no valid session exists
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // Announcement toast
  const [announcement, setAnnouncement] = useState<{ text: string; type: 'info' | 'success' | 'warning' } | null>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Initial connect / reconnect
  useEffect(() => {
    let isMounted = true;

    async function initializeRoom() {
      setLoading(true);
      setError(null);

      const guest = getGuestIdentity();
      const session = getStoredSession(roomCode);

      if (session && session.reconnectToken) {
        try {
          const res = await apiJoinRoom(
            roomCode,
            session.playerName,
            guest.uid,
            guest.shortUid,
            session.reconnectToken
          );
          if (!isMounted) return;

          setRoom(res.room);
          setCurrentPlayer(res.player);
          setReconnectToken(res.reconnectToken);
          if (res.privateData) {
            setPrivateData(res.privateData);
          }
          setLoading(false);
          startSSE(res.roomCode, res.player.id, res.reconnectToken);
          return;
        } catch (err: any) {
          console.warn('Reconnect failed, opening join modal', err);
          clearStoredSession();
        }
      }

      // If no valid session, prompt user with join modal
      if (isMounted) {
        setLoading(false);
        setIsJoinModalOpen(true);
      }
    }

    initializeRoom();

    return () => {
      isMounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [roomCode]);

  function startSSE(code: string, playerId: string, token: string) {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const unsub = subscribeToRoomEvents(
      code,
      playerId,
      token,
      (data) => {
        setIsConnected(true);
        setRoom(data.room);
        if (data.privateData) {
          setPrivateData(data.privateData);
        }
        if (data.room.players[playerId]) {
          setCurrentPlayer(data.room.players[playerId]);
        }
        if (data.room.announcement) {
          setAnnouncement({
            text: data.room.announcement.text,
            type: data.room.announcement.type,
          });
        }
      },
      (reason) => {
        setIsConnected(false);
        setError(`Connection closed: ${reason}`);
      },
      (err) => {
        setIsConnected(false);
      }
    );

    unsubscribeRef.current = unsub;
  }

  const handleJoinSubmit = async (code: string, name: string) => {
    const guest = getGuestIdentity();
    const res = await apiJoinRoom(code, name, guest.uid, guest.shortUid);
    setRoom(res.room);
    setCurrentPlayer(res.player);
    setReconnectToken(res.reconnectToken);
    if (res.privateData) setPrivateData(res.privateData);
    setIsJoinModalOpen(false);
    startSSE(res.roomCode, res.player.id, res.reconnectToken);
  };

  const handleSendAction = async (action: string, payload?: any) => {
    if (!room || !currentPlayer || !reconnectToken) return;
    return apiSendAction(room.code, currentPlayer.id, reconnectToken, action, payload);
  };

  const handleLeaveRoom = async () => {
    try {
      if (room && currentPlayer && reconnectToken) {
        await apiSendAction(room.code, currentPlayer.id, reconnectToken, 'leaveRoom');
      }
    } catch {}
    clearStoredSession();
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    onNavigate('home');
  };

  const handlePlayAgain = async () => {
    await handleSendAction('playAgain');
  };

  const handleReturnToLobby = async () => {
    await handleSendAction('returnToLobby');
  };

  const handleDismissScorecard = async () => {
    await handleSendAction('dismissScorecard');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-[#4169E1] animate-spin mb-3" />
        <p className="text-sm font-semibold text-[#202124]">Entering Room {roomCode}...</p>
        <p className="text-xs text-[#777B83] mt-1">Connecting to authoritative game server</p>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-[#E7E7E3] text-center shadow-xs">
        <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[#202124]">Unable to Enter Room</h2>
        <p className="text-xs text-[#777B83] mt-2 mb-6">{error}</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-5 py-2.5 bg-[#4169E1] text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Toast Announcement Banner */}
      {announcement && (
        <div
          role="status"
          className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all shadow-xs ${
            announcement.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : announcement.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-[#EEF2FD] border-[#4169E1]/20 text-[#202124]'
          }`}
        >
          <div className="flex items-center gap-2">
            {announcement.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : announcement.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-[#4169E1] shrink-0" />
            )}
            <span className="font-medium">{announcement.text}</span>
          </div>
          <button
            onClick={() => setAnnouncement(null)}
            className="text-[10px] text-[#777B83] hover:text-[#202124] px-1.5 py-0.5 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Disconnection Warning Banner if SSE dropped */}
      {!isConnected && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Connection interrupted. Reconnecting automatically...</span>
          </div>
        </div>
      )}

      {/* Active Screen Rendering: Lobby vs In-Game */}
      {room && currentPlayer && (
        <>
          {room.status === 'lobby' ? (
            <LobbyView
              room={room}
              currentPlayer={currentPlayer}
              onSendAction={handleSendAction}
              onLeaveRoom={handleLeaveRoom}
            />
          ) : room.selectedGame === 'ramudu-seetha' ? (
            <RamuduSeethaGame
              room={room}
              currentPlayer={currentPlayer}
              onSendAction={handleSendAction}
            />
          ) : room.selectedGame === 'housy' ? (
            <HousyGame
              room={room}
              currentPlayer={currentPlayer}
              privateData={privateData}
              onSendAction={handleSendAction}
            />
          ) : room.selectedGame === 'show' ? (
            <ShowGame
              room={room}
              currentPlayer={currentPlayer}
              privateData={privateData}
              onSendAction={handleSendAction}
            />
          ) : null}

          {/* Reusable Scorecard & Results Modal */}
          {room.latestScorecard && (
            <ScorecardModal
              scorecard={room.latestScorecard}
              currentPlayer={currentPlayer}
              isHost={currentPlayer.isHost}
              onPlayAgain={handlePlayAgain}
              onReturnToLobby={handleReturnToLobby}
              onLeaveRoom={handleLeaveRoom}
              onDismiss={handleDismissScorecard}
            />
          )}
        </>
      )}

      {/* Join Modal fallback */}
      <JoinCreateModal
        isOpen={isJoinModalOpen}
        initialMode="join"
        initialRoomCode={roomCode}
        onClose={() => onNavigate('home')}
        onCreate={async () => {}}
        onJoin={handleJoinSubmit}
      />

    </div>
  );
};
