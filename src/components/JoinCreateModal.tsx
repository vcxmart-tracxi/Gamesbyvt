/**
 * GamesByVT — Join & Create Room Modal
 * Accessible, responsive with >=44px touch targets.
 * Designed and Developed by Bodepudi Varun Teja
 */

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, PlusCircle, Users, Copy, Check } from 'lucide-react';
import { getGuestIdentity, setGuestDisplayName, copyUidToClipboard } from '../services/guestAuth.js';

interface JoinCreateModalProps {
  isOpen: boolean;
  initialMode?: 'create' | 'join';
  initialRoomCode?: string;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  onJoin: (code: string, name: string) => Promise<void>;
}

export const JoinCreateModal: React.FC<JoinCreateModalProps> = ({
  isOpen,
  initialMode = 'create',
  initialRoomCode = '',
  onClose,
  onCreate,
  onJoin,
}) => {
  const [mode, setMode] = useState<'create' | 'join'>(initialMode);
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guest, setGuest] = useState(() => getGuestIdentity());
  const [copiedUid, setCopiedUid] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    if (initialRoomCode) {
      setRoomCode(initialRoomCode);
    }
    const currentGuest = getGuestIdentity();
    setGuest(currentGuest);
    if (currentGuest.displayName) {
      setName(currentGuest.displayName);
    }
  }, [initialMode, initialRoomCode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your player display name.');
      return;
    }
    if (trimmedName.length > 20) {
      setError('Display name must be 20 characters or fewer.');
      return;
    }

    setLoading(true);
    try {
      setGuestDisplayName(trimmedName);
      if (mode === 'create') {
        await onCreate(trimmedName);
      } else {
        const cleanCode = roomCode.trim().toUpperCase();
        if (!cleanCode) {
          setError('Please enter the 6-character room code.');
          setLoading(false);
          return;
        }
        await onJoin(cleanCode, trimmedName);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUid = async () => {
    if (!guest.uid) return;
    const ok = await copyUidToClipboard(guest.uid);
    if (ok) {
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 1800);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl border border-[#E7E7E3] shadow-xl p-6 sm:p-8 my-auto relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-lg text-[#777B83] hover:text-[#202124] hover:bg-[#F5F5F1] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mode Selector Tabs (Functional segmented control) */}
        <div className="flex items-center gap-1 p-1 bg-[#F5F5F1] rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('create');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              mode === 'create'
                ? 'bg-white text-[#202124] shadow-xs'
                : 'text-[#777B83] hover:text-[#202124]'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Create Room
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('join');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              mode === 'join'
                ? 'bg-white text-[#202124] shadow-xs'
                : 'text-[#777B83] hover:text-[#202124]'
            }`}
          >
            <Users className="w-4 h-4" />
            Join Room
          </button>
        </div>

        <div>
          <h2 id="modal-title" className="text-xl font-bold text-[#202124]">
            {mode === 'create' ? 'Host a Multiplayer Room' : 'Join an Existing Room'}
          </h2>
          <p className="text-xs text-[#737780] mt-1 mb-4">
            {mode === 'create'
              ? 'Start a private room and invite your friends with a 6-character room code.'
              : 'Enter the room code shared by your friend to join immediately.'}
          </p>

          {/* Guest Identity Card */}
          <div className="mb-5 p-3 rounded-xl bg-[#FAFAF8] border border-[#E7E7E3] flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-[#737780] font-mono block">
                AUTHENTICATED GUEST IDENTITY
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-bold text-[#202124] text-sm">
                  {guest.shortUid}
                </span>
                <span className="text-[10px] text-[#238636] font-medium bg-[#EDF7EE] px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyUid}
              className="px-2.5 py-1.5 rounded-lg border border-[#E7E7E3] hover:bg-white text-xs font-mono text-[#737780] hover:text-[#202124] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              title="Copy Full Firebase Guest UID"
            >
              {copiedUid ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#238636]" />
                  <span className="text-[#238636]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy UID</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="player-name" className="block text-xs font-medium text-[#202124] mb-1.5">
              Your Display Name
            </label>
            <input
              id="player-name"
              type="text"
              required
              maxLength={20}
              placeholder="e.g. Varun, Arjun, Priya"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E7E7E3] rounded-xl text-sm text-[#202124] placeholder:text-[#777B83]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1] transition-all touch-target"
            />
          </div>

          {mode === 'join' && (
            <div>
              <label htmlFor="room-code-input" className="block text-xs font-medium text-[#202124] mb-1.5">
                6-Character Room Code
              </label>
              <input
                id="room-code-input"
                type="text"
                required
                maxLength={6}
                placeholder="e.g. K9B47X"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E7E7E3] rounded-xl text-base font-mono uppercase tracking-wider text-[#202124] placeholder:text-[#777B83]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1] transition-all touch-target"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#4169E1] hover:bg-[#3154C4] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4169E1] touch-target"
            >
              {loading ? (
                <span>Connecting...</span>
              ) : (
                <>
                  <span>{mode === 'create' ? 'Create and Enter Room' : 'Join Game Room'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
