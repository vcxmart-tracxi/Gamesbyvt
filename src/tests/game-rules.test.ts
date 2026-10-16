/**
 * GamesByVT — Comprehensive Rules & Security Verification Tests
 * Designed and Developed by Bodepudi Varun Teja
 */

import {
  calculateRamuduSeethaScores,
  validateCustomCharacter,
  DEFAULT_CHARACTERS
} from '../games/ramudu-seetha/rules.js';

import {
  generateAuthoritativeTambolaTicket,
  validateTambolaClaim,
  getColumnRange,
  getTicketNumbers
} from '../games/housy/rules.js';

import {
  generateShowDeck,
  distributeShowCards,
  resolveShowPassingRound,
  checkFourOfAKind
} from '../games/show/rules.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedTests++;
  }
}

console.log('\n======================================================');
console.log(' GamesByVT — Automated Test Suite');
console.log(' Designed and Developed by Bodepudi Varun Teja');
console.log('======================================================\n');

// -----------------------------------------------------------------
// 1. RAMUDU-SEETHA TESTS
// -----------------------------------------------------------------
console.log('1. Testing Ramudu–Seetha Scoring & Character Validation...');

// Test 1: Ramudu finds Seetha -> Ramudu gets 1000, Seetha gets 0, others retain
const assignments = [
  { playerId: 'p1', playerName: 'Alice', character: DEFAULT_CHARACTERS[0] }, // Ramudu
  { playerId: 'p2', playerName: 'Bob', character: DEFAULT_CHARACTERS[1] },   // Seetha
  { playerId: 'p3', playerName: 'Charlie', character: DEFAULT_CHARACTERS[2] }, // Lakshman (900)
  { playerId: 'p4', playerName: 'David', character: DEFAULT_CHARACTERS[3] },  // Hanumal (750)
  { playerId: 'p5', playerName: 'Eve', character: DEFAULT_CHARACTERS[4] },    // Vaali (500)
];

const outcomeFound = calculateRamuduSeethaScores(true, assignments);
const ramuduScoreFound = outcomeFound.scores.find(s => s.characterName === 'Ramudu')?.score;
const seethaScoreFound = outcomeFound.scores.find(s => s.characterName === 'Seetha')?.score;
const lakshmanScoreFound = outcomeFound.scores.find(s => s.characterName === 'Lakshman')?.score;

assert(ramuduScoreFound === 1000, 'When Ramudu finds Seetha, Ramudu receives 1,000 pts');
assert(seethaScoreFound === 0, 'When Ramudu finds Seetha, Seetha receives 0 pts');
assert(lakshmanScoreFound === 900, 'Lakshman retains 900 pts irrespective of discovery');

// Test 2: Ramudu does NOT find Seetha -> Ramudu gets 0, Seetha gets 1000
const outcomeNotFound = calculateRamuduSeethaScores(false, assignments);
const ramuduScoreNotFound = outcomeNotFound.scores.find(s => s.characterName === 'Ramudu')?.score;
const seethaScoreNotFound = outcomeNotFound.scores.find(s => s.characterName === 'Seetha')?.score;

assert(ramuduScoreNotFound === 0, 'When Ramudu misses Seetha, Ramudu receives 0 pts');
assert(seethaScoreNotFound === 1000, 'When Ramudu misses Seetha, Seetha receives 1,000 pts');

// Test 3: Custom character validation - score must be strictly below 500
const validCustom = validateCustomCharacter('Sugriva', 450, DEFAULT_CHARACTERS);
assert(validCustom.valid === true, 'Accepts valid custom character with score < 500');

const invalidHighCustom = validateCustomCharacter('Ravana', 500, DEFAULT_CHARACTERS);
assert(invalidHighCustom.valid === false, 'Rejects custom character with score >= 500');

const invalidNegativeCustom = validateCustomCharacter('Kumbha', -10, DEFAULT_CHARACTERS);
assert(invalidNegativeCustom.valid === false, 'Rejects custom character with negative score');

const invalidDuplicateCustom = validateCustomCharacter('Ramudu', 300, DEFAULT_CHARACTERS);
assert(invalidDuplicateCustom.valid === false, 'Rejects duplicate character name');

// -----------------------------------------------------------------
// 2. HOUSY / TAMBOLA TESTS
// -----------------------------------------------------------------
console.log('\n2. Testing Housy / Tambola Ticket Generation & Verification...');

const ticket = generateAuthoritativeTambolaTicket();

// Test: Exactly 3 rows and 9 columns
assert(ticket.length === 3 && ticket[0].length === 9, 'Ticket has exactly 3 rows x 9 columns');

// Test: Exactly 5 numbers per row (total 15)
const row0Count = ticket[0].filter(n => n !== null).length;
const row1Count = ticket[1].filter(n => n !== null).length;
const row2Count = ticket[2].filter(n => n !== null).length;
const allTicketNums = getTicketNumbers(ticket);

assert(row0Count === 5 && row1Count === 5 && row2Count === 5, 'Every row has exactly 5 numbers');
assert(allTicketNums.length === 15, 'Ticket has exactly 15 numbers total');

// Test: Column ranges and vertical ordering
let columnsValid = true;
for (let c = 0; c < 9; c++) {
  const { min, max } = getColumnRange(c);
  const colNums = [ticket[0][c], ticket[1][c], ticket[2][c]].filter((n): n is number => n !== null);
  for (const n of colNums) {
    if (n < min || n > max) columnsValid = false;
  }
  // Check ascending
  for (let i = 0; i < colNums.length - 1; i++) {
    if (colNums[i] >= colNums[i + 1]) columnsValid = false;
  }
}
assert(columnsValid, 'All columns strictly satisfy range and vertical ascending order');

// Test: Claim verification
// Early Five claim with only 3 called numbers should be rejected
const fakeCalled = allTicketNums.slice(0, 3);
const claimEarlyFiveInvalid = validateTambolaClaim(ticket, fakeCalled, 'earlyFive');
assert(claimEarlyFiveInvalid.valid === false, 'Rejects Early Five when only 3 numbers called');

// Early Five claim with 5 called numbers should be approved
const validFiveCalled = allTicketNums.slice(0, 5);
const claimEarlyFiveValid = validateTambolaClaim(ticket, validFiveCalled, 'earlyFive');
assert(claimEarlyFiveValid.valid === true, 'Accepts Early Five when 5 numbers called');

// Top Line claim test
const row0Numbers = ticket[0].filter((n): n is number => n !== null);
const claimTopLine = validateTambolaClaim(ticket, row0Numbers, 'topLine');
assert(claimTopLine.valid === true, 'Accepts Top Line when all 5 numbers in row 0 are called');

// Full House claim test with missing 1 number
const fourteenCalled = allTicketNums.slice(0, 14);
const claimFullHousePremature = validateTambolaClaim(ticket, fourteenCalled, 'fullHouse');
assert(claimFullHousePremature.valid === false, 'Rejects Full House when 1 number is missing');

// Full House with all 15
const claimFullHouseComplete = validateTambolaClaim(ticket, allTicketNums, 'fullHouse');
assert(claimFullHouseComplete.valid === true, 'Accepts Full House when all 15 numbers called');

// -----------------------------------------------------------------
// 3. SHOW TESTS
// -----------------------------------------------------------------
console.log('\n3. Testing Show Distribution, Invariants & Round Passing...');

const showPlayerIds = ['player_1', 'player_2', 'player_3'];
const deck = generateShowDeck('Cars', 3);
assert(deck.length === 12, 'Show generates 4N cards for N players (12 for 3 players)');

const dealtHands = distributeShowCards(deck, showPlayerIds);
assert(
  dealtHands['player_1'].length === 4 &&
  dealtHands['player_2'].length === 4 &&
  dealtHands['player_3'].length === 4,
  'Every player starts with exactly 4 cards'
);

// Simulate valid selection to pass
const p1CardToPass = dealtHands['player_1'][0].id;
const p2CardToPass = dealtHands['player_2'][0].id;
const p3CardToPass = dealtHands['player_3'][0].id;

const validSubmissions = {
  player_1: p1CardToPass,
  player_2: p2CardToPass,
  player_3: p3CardToPass,
};

const roundResult = resolveShowPassingRound(
  dealtHands,
  validSubmissions,
  showPlayerIds,
  'clockwise'
);

assert(roundResult.success === true, 'Round resolution succeeds with valid submissions');
assert(
  roundResult.newHands['player_1'].length === 4 &&
  roundResult.newHands['player_2'].length === 4 &&
  roundResult.newHands['player_3'].length === 4,
  'Every player has exactly 4 cards after pass (INVARIANT HELD)'
);

// Verify clockwise delivery: player_1 passed to player_2
const p2ReceivedCard = roundResult.newHands['player_2'].some(c => c.id === p1CardToPass);
assert(p2ReceivedCard, 'Player 2 received the card passed by Player 1 (Clockwise)');

// Security test: Attempting to pass a card not in player hand
const hackSubmissions = {
  player_1: 'non_existent_card_id',
  player_2: p2CardToPass,
  player_3: p3CardToPass,
};
const hackResult = resolveShowPassingRound(dealtHands, hackSubmissions, showPlayerIds, 'clockwise');
assert(hackResult.success === false, 'Server securely rejects passing cards not owned by player');

// Four of a kind detector test
const matchingHand = [
  { id: '1', name: 'Ferrari', category: 'Cars', setIndex: 0 },
  { id: '2', name: 'Ferrari', category: 'Cars', setIndex: 0 },
  { id: '3', name: 'Ferrari', category: 'Cars', setIndex: 0 },
  { id: '4', name: 'Ferrari', category: 'Cars', setIndex: 0 },
];
assert(checkFourOfAKind(matchingHand) === true, 'Correctly detects Four-of-a-Kind');

const mixedHand = [
  { id: '1', name: 'Ferrari', category: 'Cars', setIndex: 0 },
  { id: '2', name: 'Ferrari', category: 'Cars', setIndex: 0 },
  { id: '3', name: 'Ferrari', category: 'Cars', setIndex: 0 },
  { id: '4', name: 'Porsche', category: 'Cars', setIndex: 1 },
];
assert(checkFourOfAKind(mixedHand) === false, 'Correctly rejects non-matching hand');

// -----------------------------------------------------------------
// 4. GUEST UID & IDENTITY TESTS
// -----------------------------------------------------------------
console.log('\n4. Testing Guest UID Formatting & Identity Rules...');

import { formatShortUid } from '../services/guestAuth.js';

const formattedUid1 = formatShortUid('guest_1742080000_7F2A91C4');
assert(formattedUid1.startsWith('G-') && formattedUid1.length === 10, 'Formats guest UID to G-XXXXXXXX (10 chars)');

const formattedUid2 = formatShortUid('abc12345');
assert(formattedUid2 === 'G-ABC12345', 'Formats lowercase UID to uppercase G-ABC12345');

// Verification of empty string handling
const fallbackFormatted = formatShortUid('');
assert(fallbackFormatted === 'G-00000000', 'Handles empty UID with safe fallback');

console.log('\n======================================================');
console.log(` Results: ${passedTests} Passed, ${failedTests} Failed.`);
console.log('======================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
