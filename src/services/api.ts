/**
 * GamesByVT — Client API & Realtime SSE Service
 * Designed and Developed by Bodepudi Varun Teja
 */

import { Player, RoomState, PrivatePlayerData } from '../types/game.js';

const STORAGE_KEY_AUTH = 'gamesbyvt_player_auth';

export interface StoredSession {
  roomCode: string;
  playerId: string;
  guestUid: string;
  shortUid: string;
  playerName: string;
  reconnectToken: string;
  isHost: boolean;
}

export function saveSession(session: StoredSession) {
  try {
    sessionStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(session));
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(session));
  } catch {}
}

export function getStoredSession(roomCode?: string): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_AUTH) || localStorage.getItem(STORAGE_KEY_AUTH);
    if (!raw) return null;
    const session = JSON.parse(raw) as StoredSession;
    if (roomCode && session.roomCode.toUpperCase() !== roomCode.toUpperCase()) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearStoredSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEY_AUTH);
    localStorage.removeItem(STORAGE_KEY_AUTH);
  } catch {}
}

export async function apiCreateRoom(
  hostName: string,
  guestUid: string,
  guestShortUid: string
): Promise<{
  roomCode: string;
  player: Player;
  reconnectToken: string;
  room: RoomState;
}> {
  const res = await fetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostName, guestUid, guestShortUid }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to create room' }));
    throw new Error(err.error || 'Failed to create room');
  }

  const data = await res.json();
  saveSession({
    roomCode: data.roomCode,
    playerId: data.player.id,
    guestUid: data.player.uid,
    shortUid: data.player.shortUid,
    playerName: data.player.name,
    reconnectToken: data.reconnectToken,
    isHost: true,
  });
  return data;
}

export async function apiJoinRoom(
  roomCode: string,
  playerName: string,
  guestUid: string,
  guestShortUid: string,
  reconnectToken?: string
): Promise<{
  roomCode: string;
  player: Player;
  reconnectToken: string;
  room: RoomState;
  privateData?: PrivatePlayerData;
  reconnected?: boolean;
}> {
  const res = await fetch('/api/rooms/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, playerName, guestUid, guestShortUid, reconnectToken }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to join room' }));
    throw new Error(err.error || 'Failed to join room');
  }

  const data = await res.json();
  saveSession({
    roomCode: data.roomCode,
    playerId: data.player.id,
    guestUid: data.player.uid,
    shortUid: data.player.shortUid,
    playerName: data.player.name,
    reconnectToken: data.reconnectToken,
    isHost: data.player.isHost,
  });
  return data;
}

export async function apiSendAction(
  roomCode: string,
  playerId: string,
  reconnectToken: string,
  action: string,
  payload?: any
): Promise<{ success: boolean; room?: RoomState; result?: any }> {
  const res = await fetch(`/api/rooms/${encodeURIComponent(roomCode)}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, reconnectToken, action, payload }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Action failed' }));
    throw new Error(err.error || 'Action failed');
  }

  return res.json();
}

export function subscribeToRoomEvents(
  roomCode: string,
  playerId: string,
  reconnectToken: string,
  onUpdate: (data: { room: RoomState; privateData: PrivatePlayerData | null }) => void,
  onClosed: (reason: string) => void,
  onError: (err: any) => void
): () => void {
  const url = `/api/rooms/${encodeURIComponent(roomCode)}/events?playerId=${encodeURIComponent(
    playerId
  )}&token=${encodeURIComponent(reconnectToken)}`;

  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'ROOM_UPDATE') {
        onUpdate({ room: data.room, privateData: data.privateData });
      } else if (data.type === 'ROOM_CLOSED') {
        onClosed(data.reason || 'Room closed');
      }
    } catch (e) {
      console.error('Failed to parse SSE event data', e);
    }
  };

  eventSource.onerror = (err) => {
    onError(err);
  };

  return () => {
    eventSource.close();
  };
}
