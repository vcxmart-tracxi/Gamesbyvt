/**
 * GamesByVT — Authoritative Full-Stack Express Server
 * Developer: Bodepudi Varun Teja
 * Product: GamesByVT
 * Tagline: Three Games. One Room. Play Together.
 */

import express, { Request, Response } from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import {
  GameType,
  RoomState,
  Player,
  PrivatePlayerData,
  TambolaPattern,
  ShowCard,
} from './src/types/game.js';
import {
  DEFAULT_CHARACTERS,
  RAMUDU_SEETHA_PENDING_RULES_NOTE,
  validateCustomCharacter,
  calculateRamuduSeethaScores,
} from './src/games/ramudu-seetha/rules.js';
import {
  generateAuthoritativeTambolaTicket,
  validateTambolaClaim,
} from './src/games/housy/rules.js';
import {
  generateShowDeck,
  distributeShowCards,
  resolveShowPassingRound,
  checkFourOfAKind,
} from './src/games/show/rules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// -----------------------------------------------------------------
// In-Memory Authoritative Store with Reconnect Tokens & SSE Streams
// -----------------------------------------------------------------
const rooms = new Map<string, RoomState>();
const privatePlayerStore = new Map<string, PrivatePlayerData>(); // key: `${roomCode}:${playerId}`
const sseConnections = new Map<string, Set<{ playerId: string; res: Response }>>(); // key: roomCode
const housyTimers = new Map<string, NodeJS.Timeout>();
const housyPools = new Map<string, number[]>(); // remaining uncalled numbers per room

function getPrivateStoreKey(roomCode: string, playerId: string) {
  return `${roomCode.toUpperCase()}:${playerId}`;
}

function generateRandomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude ambiguous characters like 0/O, 1/I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

// -----------------------------------------------------------------
// Realtime SSE Broadcast Engine
// -----------------------------------------------------------------
function broadcastRoomUpdate(roomCode: string) {
  const code = roomCode.toUpperCase();
  const room = rooms.get(code);
  const connections = sseConnections.get(code);
  if (!room || !connections) return;

  room.updatedAt = Date.now();

  connections.forEach(({ playerId, res }) => {
    try {
      const privateData = privatePlayerStore.get(getPrivateStoreKey(code, playerId));
      const payload = {
        type: 'ROOM_UPDATE',
        room,
        privateData: privateData || null,
      };
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch {
      // Connection may have broken; handled in 'close'
    }
  });
}

// -----------------------------------------------------------------
// Room Lifecycle & Abandoned-Room Cleanup (Every 60s)
// -----------------------------------------------------------------
const CLEANUP_INTERVAL_MS = 60 * 1000;
const ROOM_IDLE_TIMEOUT_MS = 45 * 60 * 1000; // 45 minutes idle
const ROOM_MAX_LIFETIME_MS = 4 * 60 * 60 * 1000; // 4 hours max

setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    const isIdle = now - room.updatedAt > ROOM_IDLE_TIMEOUT_MS;
    const isExpired = now - room.createdAt > ROOM_MAX_LIFETIME_MS;
    const hasActiveSSE = sseConnections.get(code)?.size ?? 0;

    if ((isIdle && hasActiveSSE === 0) || isExpired) {
      console.log(`[CLEANUP] Removing abandoned/expired room: ${code}`);
      const timer = housyTimers.get(code);
      if (timer) clearInterval(timer);
      housyTimers.delete(code);
      housyPools.delete(code);

      // Close open SSE connections
      const conns = sseConnections.get(code);
      if (conns) {
        conns.forEach(({ res }) => {
          try {
            res.write(`data: ${JSON.stringify({ type: 'ROOM_CLOSED', reason: 'Room expired.' })}\n\n`);
            res.end();
          } catch {}
        });
      }
      sseConnections.delete(code);

      // Remove private stores
      for (const pId of Object.keys(room.players)) {
        privatePlayerStore.delete(getPrivateStoreKey(code, pId));
      }
      rooms.delete(code);
    }
  }
}, CLEANUP_INTERVAL_MS);

// -----------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------

// 1. Create Room
app.post('/api/rooms', (req: Request, res: Response) => {
  const { hostName, guestUid, guestShortUid } = req.body;
  const trimmedName = (hostName || '').trim();

  if (!trimmedName || trimmedName.length < 1 || trimmedName.length > 20) {
    res.status(400).json({ error: 'Player name must be between 1 and 20 characters.' });
    return;
  }

  // Find unique code
  let code = generateRandomCode();
  while (rooms.has(code)) {
    code = generateRandomCode();
  }

  const hostId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const effectiveUid = guestUid || hostId;
  const effectiveShortUid = guestShortUid || `G-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const reconnectToken = generateToken();

  const avatarColors = ['#4169E1', '#238636', '#C2410C', '#7C3AED', '#0891B2', '#D97706'];
  const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

  const hostPlayer: Player = {
    id: hostId,
    uid: effectiveUid,
    shortUid: effectiveShortUid,
    name: trimmedName,
    avatarColor,
    isHost: true,
    isReady: true,
    isConnected: true,
    lastActive: Date.now(),
  };

  const newRoom: RoomState = {
    code,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: 'lobby',
    selectedGame: 'housy',
    hostId,
    players: {
      [hostId]: hostPlayer,
    },
    maxPlayers: 12,
    ramuduSeethaConfig: {
      characters: [...DEFAULT_CHARACTERS],
      statusNote: RAMUDU_SEETHA_PENDING_RULES_NOTE,
    },
    tambolaConfig: {
      supportedPatterns: ['earlyFive', 'topLine', 'middleLine', 'bottomLine', 'fullHouse'],
      autoCallIntervalSeconds: 0,
    },
    showConfig: {
      category: 'Cars',
      passingDirection: 'clockwise',
      cardsPerPlayer: 4,
    },
    latestScorecard: null,
    announcement: {
      id: generateToken(),
      text: `${trimmedName} (${effectiveShortUid}) created room ${code}.`,
      type: 'info',
      timestamp: Date.now(),
    },
  };

  rooms.set(code, newRoom);

  const hostPrivateData: PrivatePlayerData = {
    playerId: hostId,
    roomCode: code,
    reconnectToken,
  };
  privatePlayerStore.set(getPrivateStoreKey(code, hostId), hostPrivateData);

  res.json({
    roomCode: code,
    player: hostPlayer,
    reconnectToken,
    room: newRoom,
  });
});

// 2. Join Room (or Reconnect)
app.post('/api/rooms/join', (req: Request, res: Response) => {
  const { roomCode, playerName, guestUid, guestShortUid, reconnectToken } = req.body;
  const code = (roomCode || '').trim().toUpperCase();

  const room = rooms.get(code);
  if (!room) {
    res.status(404).json({ error: `Room "${code}" not found or has expired.` });
    return;
  }

  // Check if player is reconnecting with an existing token or matching UID
  if (reconnectToken) {
    for (const [pId, p] of Object.entries(room.players)) {
      const storedPrivate = privatePlayerStore.get(getPrivateStoreKey(code, pId));
      if (storedPrivate && storedPrivate.reconnectToken === reconnectToken) {
        // Reconnect authenticated!
        p.isConnected = true;
        p.lastActive = Date.now();
        broadcastRoomUpdate(code);

        res.json({
          roomCode: code,
          player: p,
          reconnectToken,
          room,
          privateData: storedPrivate,
          reconnected: true,
        });
        return;
      }
    }
  }

  // If a player with the same guestUid already exists in this room, restore their session
  if (guestUid) {
    for (const [pId, p] of Object.entries(room.players)) {
      if (p.uid === guestUid) {
        const storedPrivate = privatePlayerStore.get(getPrivateStoreKey(code, pId));
        if (storedPrivate) {
          p.isConnected = true;
          p.lastActive = Date.now();
          if (playerName && playerName.trim()) {
            p.name = playerName.trim();
          }
          broadcastRoomUpdate(code);

          res.json({
            roomCode: code,
            player: p,
            reconnectToken: storedPrivate.reconnectToken,
            room,
            privateData: storedPrivate,
            reconnected: true,
          });
          return;
        }
      }
    }
  }

  // New player joining
  const trimmedName = (playerName || '').trim();
  if (!trimmedName || trimmedName.length < 1 || trimmedName.length > 20) {
    res.status(400).json({ error: 'Player name must be between 1 and 20 characters.' });
    return;
  }

  if (Object.keys(room.players).length >= room.maxPlayers) {
    res.status(400).json({ error: `Room is full (max ${room.maxPlayers} players).` });
    return;
  }

  const playerId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const effectiveUid = guestUid || playerId;
  const effectiveShortUid = guestShortUid || `G-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const newReconnectToken = generateToken();

  const avatarColors = ['#4169E1', '#238636', '#C2410C', '#7C3AED', '#0891B2', '#D97706'];
  const avatarColor = avatarColors[Object.keys(room.players).length % avatarColors.length];

  const newPlayer: Player = {
    id: playerId,
    uid: effectiveUid,
    shortUid: effectiveShortUid,
    name: trimmedName,
    avatarColor,
    isHost: false,
    isReady: false,
    isConnected: true,
    lastActive: Date.now(),
  };

  room.players[playerId] = newPlayer;
  room.announcement = {
    id: generateToken(),
    text: `${trimmedName} (${effectiveShortUid}) joined the room.`,
    type: 'info',
    timestamp: Date.now(),
  };

  const newPrivateData: PrivatePlayerData = {
    playerId,
    roomCode: code,
    reconnectToken: newReconnectToken,
  };
  privatePlayerStore.set(getPrivateStoreKey(code, playerId), newPrivateData);

  broadcastRoomUpdate(code);

  res.json({
    roomCode: code,
    player: newPlayer,
    reconnectToken: newReconnectToken,
    room,
    privateData: newPrivateData,
    reconnected: false,
  });
});

// 3. Realtime SSE Stream for Room & Private State
app.get('/api/rooms/:roomCode/events', (req: Request, res: Response) => {
  const code = (req.params.roomCode || '').toUpperCase();
  const playerId = req.query.playerId as string;
  const reconnectToken = req.query.token as string;

  const room = rooms.get(code);
  if (!room) {
    res.status(404).send('Room not found');
    return;
  }

  const storedPrivate = privatePlayerStore.get(getPrivateStoreKey(code, playerId));
  if (!storedPrivate || storedPrivate.reconnectToken !== reconnectToken) {
    res.status(401).send('Unauthorized token');
    return;
  }

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write('\n');

  if (!sseConnections.has(code)) {
    sseConnections.set(code, new Set());
  }
  const conns = sseConnections.get(code)!;
  const clientEntry = { playerId, res };
  conns.add(clientEntry);

  // Mark player connected
  if (room.players[playerId]) {
    room.players[playerId].isConnected = true;
    room.players[playerId].lastActive = Date.now();
  }

  // Send immediate initial sync
  const initialPayload = {
    type: 'ROOM_UPDATE',
    room,
    privateData: storedPrivate,
  };
  res.write(`data: ${JSON.stringify(initialPayload)}\n\n`);
  broadcastRoomUpdate(code);

  // Heartbeat ping every 15s to keep connection open through proxies
  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {}
  }, 15000);

  // Cleanup on client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    conns.delete(clientEntry);

    if (room.players[playerId]) {
      room.players[playerId].isConnected = false;
      room.players[playerId].lastActive = Date.now();

      // If host disconnected, transfer host to next connected player
      if (room.players[playerId].isHost) {
        const remainingPlayers = Object.values(room.players).filter(p => p.id !== playerId && p.isConnected);
        if (remainingPlayers.length > 0) {
          const nextHost = remainingPlayers[0];
          room.players[playerId].isHost = false;
          nextHost.isHost = true;
          room.hostId = nextHost.id;
          room.announcement = {
            id: generateToken(),
            text: `Host left. Host privileges transferred to ${nextHost.name}.`,
            type: 'warning',
            timestamp: Date.now(),
          };
        }
      }

      broadcastRoomUpdate(code);
    }
  });
});

// 4. Authoritative Game Actions Dispatcher
app.post('/api/rooms/:roomCode/action', (req: Request, res: Response) => {
  const code = (req.params.roomCode || '').toUpperCase();
  const { playerId, reconnectToken, action, payload } = req.body;

  const room = rooms.get(code);
  if (!room) {
    res.status(404).json({ error: 'Room not found.' });
    return;
  }

  const storedPrivate = privatePlayerStore.get(getPrivateStoreKey(code, playerId));
  if (!storedPrivate || storedPrivate.reconnectToken !== reconnectToken) {
    res.status(401).json({ error: 'Unauthorized: invalid player credential.' });
    return;
  }

  const player = room.players[playerId];
  if (!player) {
    res.status(404).json({ error: 'Player does not exist in this room.' });
    return;
  }

  player.lastActive = Date.now();

  try {
    switch (action) {
      // ----------------------------------------------------
      // LOBBY & COMMON ACTIONS
      // ----------------------------------------------------
      case 'setReady': {
        player.isReady = Boolean(payload?.isReady);
        break;
      }

      case 'selectGame': {
        if (!player.isHost) {
          res.status(403).json({ error: 'Only the room host can select the game.' });
          return;
        }
        const game = payload?.game as GameType;
        if (!['ramudu-seetha', 'housy', 'show'].includes(game)) {
          res.status(400).json({ error: 'Invalid game selection.' });
          return;
        }
        room.selectedGame = game;
        room.announcement = {
          id: generateToken(),
          text: `Selected game changed to ${game === 'ramudu-seetha' ? 'Ramudu–Seetha' : game === 'housy' ? 'Housy (Tambola)' : 'Show'}.`,
          type: 'info',
          timestamp: Date.now(),
        };
        break;
      }

      case 'leaveRoom': {
        delete room.players[playerId];
        privatePlayerStore.delete(getPrivateStoreKey(code, playerId));

        const remainingActive = Object.values(room.players).filter(p => p.isConnected);
        if (remainingActive.length === 0) {
          // No players remain
          rooms.delete(code);
          res.json({ success: true, left: true, roomClosed: true });
          return;
        }

        if (player.isHost) {
          const nextHost = remainingActive[0];
          nextHost.isHost = true;
          room.hostId = nextHost.id;
          room.announcement = {
            id: generateToken(),
            text: `${player.name} left. Host transferred to ${nextHost.name} (${nextHost.shortUid}).`,
            type: 'warning',
            timestamp: Date.now(),
          };
        } else {
          room.announcement = {
            id: generateToken(),
            text: `${player.name} (${player.shortUid}) left the room.`,
            type: 'info',
            timestamp: Date.now(),
          };
        }
        break;
      }

      case 'dismissScorecard': {
        room.latestScorecard = null;
        break;
      }

      case 'playAgain': {
        room.latestScorecard = null;
        room.status = 'lobby';
        Object.values(room.players).forEach(p => {
          p.isReady = p.isHost;
        });
        room.announcement = {
          id: generateToken(),
          text: 'Game ended. Returned to lobby for a new match.',
          type: 'info',
          timestamp: Date.now(),
        };
        break;
      }

      case 'returnToLobby': {
        if (!player.isHost) {
          res.status(403).json({ error: 'Only host can reset to lobby.' });
          return;
        }
        // Stop any running caller timers
        const timer = housyTimers.get(code);
        if (timer) clearInterval(timer);
        housyTimers.delete(code);
        housyPools.delete(code);

        room.status = 'lobby';
        room.latestScorecard = null;
        // Reset readiness
        Object.values(room.players).forEach(p => {
          p.isReady = p.isHost;
        });
        break;
      }

      case 'startGame': {
        if (!player.isHost) {
          res.status(403).json({ error: 'Only the host can start the game.' });
          return;
        }

        const activePlayerIds = Object.keys(room.players).filter(id => room.players[id].isConnected);
        if (activePlayerIds.length < 1) {
          res.status(400).json({ error: 'Need players in room to start.' });
          return;
        }

        room.latestScorecard = null;

        if (room.selectedGame === 'housy') {
          // Initialize authoritative Housy
          const pool: number[] = [];
          for (let i = 1; i <= 90; i++) pool.push(i);
          // Shuffle pool
          for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
          }
          housyPools.set(code, pool);

          for (const pId of Object.keys(room.players)) {
            const ticket = generateAuthoritativeTambolaTicket();
            const pStore = privatePlayerStore.get(getPrivateStoreKey(code, pId))!;
            pStore.tambola = {
              ticket,
              markedNumbers: [],
            };
          }

          room.tambolaState = {
            calledNumbers: [],
            currentNumber: null,
            isCallingPaused: false,
            verifiedWinners: [],
            recentClaims: [],
          };
          room.status = 'playing';
          room.announcement = {
            id: generateToken(),
            text: 'Housy game started! Tickets distributed to all players.',
            type: 'success',
            timestamp: Date.now(),
          };
        } else if (room.selectedGame === 'show') {
          if (activePlayerIds.length < 2) {
            res.status(400).json({ error: 'Show requires at least 2 active players to pass cards.' });
            return;
          }

          const deck = generateShowDeck(
            room.showConfig.category,
            activePlayerIds.length,
            room.showConfig.customCardPool
          );
          const dealtHands = distributeShowCards(deck, activePlayerIds);

          for (const pId of activePlayerIds) {
            const pStore = privatePlayerStore.get(getPrivateStoreKey(code, pId))!;
            pStore.show = {
              hand: dealtHands[pId],
              selectedCardIdForPass: null,
              receivedCardIdFromLastRound: null,
            };
          }

          room.showState = {
            roundNumber: 1,
            phase: 'SELECTING',
            category: room.showConfig.category,
            submittedPlayerIds: [],
            passingOrder: [...activePlayerIds],
          };
          room.status = 'playing';
          room.announcement = {
            id: generateToken(),
            text: `Show game started! Category: ${room.showConfig.category}. Select 1 card to pass.`,
            type: 'success',
            timestamp: Date.now(),
          };
        } else if (room.selectedGame === 'ramudu-seetha') {
          room.status = 'playing';
          room.announcement = {
            id: generateToken(),
            text: 'Ramudu–Seetha scoring engine ready. Character preview & rules loaded.',
            type: 'info',
            timestamp: Date.now(),
          };
        }
        break;
      }

      // ----------------------------------------------------
      // HOUSY ACTIONS
      // ----------------------------------------------------
      case 'housyCallNextNumber': {
        if (!player.isHost) {
          res.status(403).json({ error: 'Only host can call numbers.' });
          return;
        }
        const pool = housyPools.get(code);
        if (!pool || pool.length === 0) {
          res.status(400).json({ error: 'All 90 numbers have been called!' });
          return;
        }

        const nextNum = pool.pop()!;
        if (!room.tambolaState) {
          room.tambolaState = {
            calledNumbers: [],
            currentNumber: null,
            isCallingPaused: false,
            verifiedWinners: [],
            recentClaims: [],
          };
        }

        room.tambolaState.calledNumbers.unshift(nextNum);
        room.tambolaState.currentNumber = nextNum;

        // Auto-mark on players' private tickets if they have it
        for (const pId of Object.keys(room.players)) {
          const pStore = privatePlayerStore.get(getPrivateStoreKey(code, pId));
          if (pStore?.tambola?.ticket) {
            const hasNum = pStore.tambola.ticket.some(row => row.includes(nextNum));
            if (hasNum && !pStore.tambola.markedNumbers.includes(nextNum)) {
              pStore.tambola.markedNumbers.push(nextNum);
            }
          }
        }

        room.announcement = {
          id: generateToken(),
          text: `Number Called: ${nextNum}`,
          type: 'info',
          timestamp: Date.now(),
        };
        break;
      }

      case 'housyClaimPattern': {
        const pattern = payload?.pattern as TambolaPattern;
        if (!['earlyFive', 'topLine', 'middleLine', 'bottomLine', 'fullHouse'].includes(pattern)) {
          res.status(400).json({ error: 'Invalid pattern claim.' });
          return;
        }

        const pStore = storedPrivate;
        if (!pStore.tambola?.ticket) {
          res.status(400).json({ error: 'No active ticket found for player.' });
          return;
        }

        const calledNumbers = room.tambolaState?.calledNumbers || [];

        // Check if pattern is already won
        const alreadyWon = room.tambolaState?.verifiedWinners.some(w => w.pattern === pattern);
        if (alreadyWon) {
          res.status(400).json({ error: `Pattern "${pattern}" has already been claimed and verified by a player.` });
          return;
        }

        // Validate claim authoritatively
        const validation = validateTambolaClaim(pStore.tambola.ticket, calledNumbers, pattern);

        const claimId = generateToken();
        const claimRecord = {
          id: claimId,
          playerId,
          playerName: player.name,
          pattern,
          claimedAt: Date.now(),
          verified: validation.valid,
          invalidReason: validation.reason,
        };

        if (!room.tambolaState) {
          res.status(400).json({ error: 'Game state not found.' });
          return;
        }

        room.tambolaState.recentClaims.unshift(claimRecord);
        if (room.tambolaState.recentClaims.length > 8) {
          room.tambolaState.recentClaims.pop();
        }

        if (validation.valid) {
          room.tambolaState.verifiedWinners.push({
            pattern,
            playerId,
            playerName: player.name,
            claimedAt: Date.now(),
          });
          room.announcement = {
            id: generateToken(),
            text: `🎉 WINNER! ${player.name} (${player.shortUid}) claimed ${pattern.toUpperCase()}!`,
            type: 'success',
            timestamp: Date.now(),
          };

          // If Full House claimed, complete game and generate scorecard!
          if (pattern === 'fullHouse') {
            room.status = 'round-summary';
            room.latestScorecard = {
              id: generateToken(),
              game: 'housy',
              gameTitle: 'Housy (Tambola)',
              winningCondition: `Full House Won by ${player.name} (${player.shortUid})`,
              completedAt: Date.now(),
              entries: Object.values(room.players).map(p => {
                const wonThisPattern = p.id === playerId;
                const otherWins = room.tambolaState?.verifiedWinners.filter(w => w.playerId === p.id) || [];
                return {
                  playerId: p.id,
                  shortUid: p.shortUid,
                  playerName: p.name,
                  roleOrPattern: otherWins.map(w => w.pattern).join(', ') || 'Participant',
                  outcome: wonThisPattern ? 'win' : otherWins.length > 0 ? 'win' : 'loss',
                  notes: wonThisPattern ? 'Claimed Full House' : otherWins.length > 0 ? `Claimed ${otherWins.map(w => w.pattern).join(', ')}` : 'Completed match',
                };
              }),
            };
          }
        } else {
          room.announcement = {
            id: generateToken(),
            text: `Claim rejected for ${player.name}: ${validation.reason}`,
            type: 'warning',
            timestamp: Date.now(),
          };
        }
        break;
      }

      // ----------------------------------------------------
      // SHOW ACTIONS
      // ----------------------------------------------------
      case 'showSelectPassCard': {
        const cardId = payload?.cardId as string;
        if (!cardId) {
          res.status(400).json({ error: 'Card ID required.' });
          return;
        }

        if (room.showState?.phase !== 'SELECTING') {
          res.status(400).json({ error: 'Current phase is not accepting card passes.' });
          return;
        }

        const pStore = storedPrivate;
        if (!pStore.show?.hand) {
          res.status(400).json({ error: 'No active hand found.' });
          return;
        }

        // Authoritative ownership check
        const ownsCard = pStore.show.hand.some(c => c.id === cardId);
        if (!ownsCard) {
          res.status(403).json({ error: 'Security Violation: You do not own this card.' });
          return;
        }

        pStore.show.selectedCardIdForPass = cardId;

        if (!room.showState.submittedPlayerIds.includes(playerId)) {
          room.showState.submittedPlayerIds.push(playerId);
        }

        // Check if all active players have submitted
        const activePlayerIds = room.showState.passingOrder;
        const allSubmitted = activePlayerIds.every(id => {
          const store = privatePlayerStore.get(getPrivateStoreKey(code, id));
          return store?.show?.selectedCardIdForPass !== null && store?.show?.selectedCardIdForPass !== undefined;
        });

        if (allSubmitted && activePlayerIds.length >= 2) {
          // Resolve round authoritatively!
          const currentHands: Record<string, ShowCard[]> = {};
          const submissions: Record<string, string> = {};

          for (const id of activePlayerIds) {
            const store = privatePlayerStore.get(getPrivateStoreKey(code, id))!;
            currentHands[id] = store.show!.hand;
            submissions[id] = store.show!.selectedCardIdForPass!;
          }

          const resolution = resolveShowPassingRound(
            currentHands,
            submissions,
            activePlayerIds,
            room.showConfig.passingDirection
          );

          if (resolution.success) {
            for (const id of activePlayerIds) {
              const store = privatePlayerStore.get(getPrivateStoreKey(code, id))!;
              store.show!.hand = resolution.newHands[id];
              store.show!.selectedCardIdForPass = null;

              const transfer = resolution.transfers.find(t => t.toPlayerId === id);
              store.show!.receivedCardIdFromLastRound = transfer?.passedCard.id || null;
            }

            room.showState.roundNumber++;
            room.showState.submittedPlayerIds = [];
            room.showState.lastRoundTransfers = resolution.transfers.map(t => ({
              fromPlayerId: t.fromPlayerId,
              toPlayerId: t.toPlayerId,
            }));

            // Check if any player has achieved Four of a Kind
            const winners: string[] = [];
            for (const id of activePlayerIds) {
              const store = privatePlayerStore.get(getPrivateStoreKey(code, id))!;
              if (checkFourOfAKind(store.show!.hand)) {
                winners.push(room.players[id].name);
              }
            }

            if (winners.length > 0) {
              room.announcement = {
                id: generateToken(),
                text: `✨ FOUR OF A KIND! ${winners.join(', ')} assembled a complete matching set!`,
                type: 'success',
                timestamp: Date.now(),
              };
            } else {
              room.announcement = {
                id: generateToken(),
                text: `Round ${room.showState.roundNumber - 1} resolved! All cards delivered. Round ${room.showState.roundNumber} started.`,
                type: 'info',
                timestamp: Date.now(),
              };
            }
          }
        }
        break;
      }

      case 'showDeclareShowdown': {
        const pStore = storedPrivate;
        if (!pStore.show?.hand) {
          res.status(400).json({ error: 'No hand found.' });
          return;
        }

        const isWin = checkFourOfAKind(pStore.show.hand);
        if (!room.showState) break;

        if (!room.showState.revealedShowdowns) {
          room.showState.revealedShowdowns = [];
        }

        room.showState.revealedShowdowns.unshift({
          playerId,
          playerName: player.name,
          cards: pStore.show.hand,
          isFourOfAKind: isWin,
        });

        if (isWin) {
          room.status = 'round-summary';
          room.latestScorecard = {
            id: generateToken(),
            game: 'show',
            gameTitle: 'Show (Passing Game)',
            winningCondition: `Four of a Kind Verified: 4x ${pStore.show.hand[0].name}`,
            completedAt: Date.now(),
            entries: Object.values(room.players).map(p => {
              const isWinner = p.id === playerId;
              return {
                playerId: p.id,
                shortUid: p.shortUid,
                playerName: p.name,
                roleOrPattern: isWinner ? `4x ${pStore.show!.hand[0].name}` : 'Runner up',
                outcome: isWinner ? 'win' : 'loss',
                notes: isWinner ? 'Successfully assembled Four of a Kind' : 'Participated in pass sequence',
              };
            }),
          };

          room.announcement = {
            id: generateToken(),
            text: `🏆 SHOW VERIFIED! ${player.name} (${player.shortUid}) holds 4 matching cards: ${pStore.show.hand[0].name}!`,
            type: 'success',
            timestamp: Date.now(),
          };
        } else {
          room.announcement = {
            id: generateToken(),
            text: `Show called by ${player.name}, but cards did not match 4-of-a-kind.`,
            type: 'warning',
            timestamp: Date.now(),
          };
        }
        break;
      }

      // ----------------------------------------------------
      // RAMUDU-SEETHA ACTIONS
      // ----------------------------------------------------
      case 'addCustomCharacter': {
        if (!player.isHost) {
          res.status(403).json({ error: 'Only host can configure characters.' });
          return;
        }
        const { name, score } = payload;
        const validation = validateCustomCharacter(name, score, room.ramuduSeethaConfig.characters);
        if (!validation.valid || !validation.character) {
          res.status(400).json({ error: validation.error || 'Invalid custom character.' });
          return;
        }
        room.ramuduSeethaConfig.characters.push(validation.character);
        room.announcement = {
          id: generateToken(),
          text: `Added custom character "${validation.character.name}" with score ${validation.character.baseScore}.`,
          type: 'info',
          timestamp: Date.now(),
        };
        break;
      }

      case 'simulateRamuduSeethaScoring': {
        const ramuduFoundSeetha = Boolean(payload?.ramuduFoundSeetha);
        const characters = room.ramuduSeethaConfig.characters;
        const playerIds = Object.keys(room.players);

        const assignments = playerIds.map((pId, idx) => ({
          playerId: pId,
          playerName: room.players[pId].name,
          character: characters[idx % characters.length],
        }));

        const result = calculateRamuduSeethaScores(ramuduFoundSeetha, assignments);

        // Update latestScorecard on room
        room.latestScorecard = {
          id: generateToken(),
          game: 'ramudu-seetha',
          gameTitle: 'Ramudu–Seetha',
          winningCondition: ramuduFoundSeetha
            ? 'Ramudu Successfully Found Seetha'
            : 'Ramudu Failed to Find Seetha (Seetha Won)',
          completedAt: Date.now(),
          entries: result.scores.map(s => {
            const p = room.players[s.playerId];
            const isWinner = (ramuduFoundSeetha && s.characterName === 'Ramudu') ||
              (!ramuduFoundSeetha && s.characterName === 'Seetha');
            return {
              playerId: s.playerId,
              shortUid: p ? p.shortUid : 'G-UNKNOWN',
              playerName: s.playerName,
              roleOrPattern: s.characterName,
              score: s.score,
              outcome: isWinner ? 'win' : s.score === 0 ? 'loss' : 'completed',
              notes: s.notes,
            };
          }),
        };

        res.json({ success: true, result });
        return;
      }

      default:
        res.status(400).json({ error: `Unknown action: ${action}` });
        return;
    }

    broadcastRoomUpdate(code);
    res.json({ success: true, room });
  } catch (err: any) {
    console.error('Action error:', err);
    res.status(500).json({ error: err.message || 'Server error processing action.' });
  }
});

// -----------------------------------------------------------------
// Vite Middleware (Dev) or Static Assets (Prod)
// -----------------------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`[GamesByVT] Server listening on port ${PORT} (${isProduction ? 'Production' : 'Development'})`);
  });
}

startServer();
