/**
 * GamesByVT — Main Application Shell & Responsive Router
 * Developer: Bodepudi Varun Teja
 * Product: GamesByVT
 * Tagline: Three Games. One Room. Play Together.
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { DottedBackground } from './components/DottedBackground.js';
import { HomePage } from './pages/HomePage.js';
import { AboutPage } from './pages/AboutPage.js';
import { RoomPage } from './pages/RoomPage.js';
import { JoinCreateModal } from './components/JoinCreateModal.js';
import { apiCreateRoom, apiJoinRoom, clearStoredSession } from './services/api.js';
import { getGuestIdentity } from './services/guestAuth.js';
import { GameType } from './types/game.js';

export default function App() {
  // Simple, resilient path + hash router
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('/')) return hash;
    return window.location.pathname || '/';
  });

  const [guest, setGuest] = useState(() => getGuestIdentity());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'join'>('create');
  const [targetGameForCreate, setTargetGameForCreate] = useState<GameType | null>(null);

  // Sync routing on popstate / hashchange
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.replace('#', '');
      const path = hash.startsWith('/') ? hash : window.location.pathname || '/';
      setCurrentPath(path);
      setGuest(getGuestIdentity());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = (path: string) => {
    if (path.startsWith('/')) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
    } else if (path === 'home') {
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
    } else if (path === 'about') {
      window.history.pushState({}, '', '/about');
      setCurrentPath('/about');
    }
    setGuest(getGuestIdentity());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCreate = (preselectedGame?: GameType) => {
    setModalMode('create');
    if (preselectedGame) {
      setTargetGameForCreate(preselectedGame);
    }
    setIsModalOpen(true);
  };

  const handleOpenJoin = () => {
    setModalMode('join');
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (name: string) => {
    const currentGuest = getGuestIdentity();
    const res = await apiCreateRoom(name, currentGuest.uid, currentGuest.shortUid);
    setGuest(getGuestIdentity());

    // If a game card was specifically selected, we set it on room
    if (targetGameForCreate && targetGameForCreate !== 'housy') {
      try {
        await fetch(`/api/rooms/${res.roomCode}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: res.player.id,
            reconnectToken: res.reconnectToken,
            action: 'selectGame',
            payload: { game: targetGameForCreate },
          }),
        });
      } catch {}
    }
    setIsModalOpen(false);
    navigate(`/room/${res.roomCode}`);
  };

  const handleJoinSubmit = async (code: string, name: string) => {
    const currentGuest = getGuestIdentity();
    const res = await apiJoinRoom(code, name, currentGuest.uid, currentGuest.shortUid);
    setGuest(getGuestIdentity());
    setIsModalOpen(false);
    navigate(`/room/${res.roomCode}`);
  };

  const handleLeaveRoom = () => {
    clearStoredSession();
    navigate('home');
  };

  // Route matching:
  // /room/:code or /
  const roomMatch = currentPath.match(/^\/room\/([a-zA-Z0-9_-]+)/);
  const activeRoomCode = roomMatch ? roomMatch[1].toUpperCase() : undefined;
  const isAboutRoute = currentPath === '/about';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#1C1917] relative overflow-x-hidden selection:bg-[#3B62D6]/15 selection:text-[#1C1917]">
      
      {/* Ambient Moving Dotted Shapes Background */}
      <DottedBackground />

      {/* Universal Navigation Header */}
      <div className="relative z-10">
        <Header
          currentRoute={activeRoomCode ? 'room' : isAboutRoute ? 'about' : 'home'}
          onNavigate={navigate}
          onOpenCreate={() => handleOpenCreate()}
          activeRoomCode={activeRoomCode}
          guestUid={guest.uid}
          guestShortUid={guest.shortUid}
          onLeaveRoom={activeRoomCode ? handleLeaveRoom : undefined}
        />
      </div>

      {/* Main View Area */}
      <main className="flex-1 relative z-10">
        {activeRoomCode ? (
          <RoomPage
            roomCode={activeRoomCode}
            onNavigate={navigate}
          />
        ) : isAboutRoute ? (
          <AboutPage onNavigate={navigate} />
        ) : (
          <HomePage
            onOpenCreate={() => handleOpenCreate()}
            onOpenJoin={handleOpenJoin}
            onSelectGameCard={(game) => handleOpenCreate(game)}
            onNavigate={navigate}
          />
        )}
      </main>

      {/* Discreet Footer with Bodepudi Varun Teja attribution */}
      <div className="relative z-10">
        <Footer onNavigate={navigate} />
      </div>

      {/* Reusable Join & Create Room Modal */}
      <JoinCreateModal
        isOpen={isModalOpen}
        initialMode={modalMode}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateSubmit}
        onJoin={handleJoinSubmit}
      />

    </div>
  );
}
