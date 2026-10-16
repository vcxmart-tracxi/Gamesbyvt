/**
 * GamesByVT — Core Types
 * Designed and Developed by Bodepudi Varun Teja
 */

export type GameType = 'ramudu-seetha' | 'housy' | 'show';

export type RoomStatus = 'lobby' | 'playing' | 'round-summary' | 'ended';

export interface Player {
  id: string; // Internal UID / Client ID
  uid: string; // Authenticated Guest UID
  shortUid: string; // Display format, e.g. G-7F2A91C4
  name: string;
  avatarColor?: string; // CSS-only colored circle token
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  lastActive: number;
}

export interface ScorecardEntry {
  playerId: string;
  shortUid: string;
  playerName: string;
  score?: number | string;
  rank?: number;
  roleOrPattern?: string;
  outcome: 'win' | 'loss' | 'draw' | 'completed';
  notes?: string;
}

export interface GameResultScorecard {
  id: string;
  game: GameType;
  gameTitle: string;
  winningCondition: string;
  completedAt: number;
  entries: ScorecardEntry[];
}

export interface PlayerAuth {
  playerId: string;
  uid: string;
  shortUid: string;
  reconnectToken: string;
  name: string;
  isHost: boolean;
  roomCode: string;
}

// ----------------------------------------------------
// Game 1: Ramudu-Seetha Types
// ----------------------------------------------------
export interface RamuduSeethaCharacter {
  id: string;
  name: string;
  baseScore: number;
  isCustom?: boolean;
  roleType: 'ramudu' | 'seetha' | 'fixed' | 'custom';
}

export interface RamuduSeethaConfig {
  characters: RamuduSeethaCharacter[];
  statusNote: string;
}

export interface RamuduSeethaPrivateState {
  characterCard?: RamuduSeethaCharacter;
}

export interface RamuduSeethaScoringResult {
  ramuduFoundSeetha: boolean;
  scores: {
    playerId: string;
    playerName: string;
    characterName: string;
    score: number;
    notes: string;
  }[];
}

// ----------------------------------------------------
// Game 2: Housy / Tambola Types
// ----------------------------------------------------
export type TambolaPattern = 'earlyFive' | 'topLine' | 'middleLine' | 'bottomLine' | 'fullHouse';

export interface TambolaClaim {
  id: string;
  playerId: string;
  playerName: string;
  pattern: TambolaPattern;
  claimedAt: number;
  verified: boolean;
  invalidReason?: string;
}

export interface TambolaConfig {
  supportedPatterns: TambolaPattern[];
  autoCallIntervalSeconds: number; // 0 = manual, >0 = auto
}

export interface TambolaTicketCell {
  value: number | null; // null for blank space
  row: number; // 0, 1, 2
  col: number; // 0 to 8
}

export type TambolaTicket = (number | null)[][]; // 3 rows x 9 cols

export interface TambolaPublicState {
  calledNumbers: number[];
  currentNumber: number | null;
  isCallingPaused: boolean;
  verifiedWinners: {
    pattern: TambolaPattern;
    playerId: string;
    playerName: string;
    claimedAt: number;
  }[];
  recentClaims: TambolaClaim[];
}

export interface TambolaPrivateState {
  ticket: TambolaTicket;
  markedNumbers: number[];
}

// ----------------------------------------------------
// Game 3: Show Types
// ----------------------------------------------------
export type ShowCategory = 'Cars' | 'Animals' | 'Fruits' | 'Actors' | 'Cricket' | 'Custom';

export interface ShowCard {
  id: string;
  name: string;
  category: string;
  setIndex: number;
}

export interface ShowConfig {
  category: ShowCategory;
  customCardPool?: string[];
  passingDirection: 'clockwise' | 'counter-clockwise';
  cardsPerPlayer: 4;
}

export type ShowRoundPhase = 'DISTRIBUTING' | 'SELECTING' | 'PASSING' | 'RESOLVING' | 'NEXT_ROUND';

export interface ShowPublicState {
  roundNumber: number;
  phase: ShowRoundPhase;
  category: ShowCategory;
  submittedPlayerIds: string[]; // only reveals WHO submitted, NEVER what card
  passingOrder: string[]; // player IDs in sequence
  lastRoundTransfers?: {
    fromPlayerId: string;
    toPlayerId: string;
  }[];
  revealedShowdowns?: {
    playerId: string;
    playerName: string;
    cards: ShowCard[];
    isFourOfAKind: boolean;
  }[];
}

export interface ShowPrivateState {
  hand: ShowCard[]; // exactly 4 cards
  selectedCardIdForPass: string | null;
  receivedCardIdFromLastRound: string | null;
}

// ----------------------------------------------------
// Combined Room & Game State
// ----------------------------------------------------
export interface RoomState {
  code: string;
  createdAt: number;
  updatedAt: number;
  status: RoomStatus;
  selectedGame: GameType;
  hostId: string;
  players: Record<string, Player>;
  maxPlayers: number;

  // Public Game States
  ramuduSeethaConfig: RamuduSeethaConfig;
  tambolaConfig: TambolaConfig;
  tambolaState?: TambolaPublicState;
  showConfig: ShowConfig;
  showState?: ShowPublicState;
  
  // Reusable authoritative scorecard for completed rounds / matches
  latestScorecard?: GameResultScorecard | null;

  // Game result / announcement
  announcement?: {
    id: string;
    text: string;
    type: 'info' | 'success' | 'warning';
    timestamp: number;
  };
}

export interface PrivatePlayerData {
  playerId: string;
  roomCode: string;
  reconnectToken: string;
  ramuduSeetha?: RamuduSeethaPrivateState;
  tambola?: TambolaPrivateState;
  show?: ShowPrivateState;
}

// Client action payload
export interface GameActionRequest {
  action: string;
  payload?: any;
}
