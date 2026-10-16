/**
 * Show Card Game Rules, Deck Distribution & Resolution Engine
 * Designed and Developed by Bodepudi Varun Teja
 */

import { ShowCard, ShowCategory, ShowConfig } from '../../types/game.js';

export const SHOW_CATEGORY_PRESETS: Record<ShowCategory, string[]> = {
  Cars: ['Ferrari', 'Porsche', 'Lamborghini', 'Aston Martin', 'McLaren', 'Bugatti', 'Mercedes-AMG', 'BMW M'],
  Animals: ['Bengal Tiger', 'African Lion', 'Snow Leopard', 'Peregrine Falcon', 'Timber Wolf', 'Grizzly Bear', 'Golden Eagle', 'Cheetah'],
  Fruits: ['Alphonso Mango', 'Honeycrisp Apple', 'Wild Strawberry', 'Golden Kiwi', 'Sweet Cherry', 'Ruby Papaya', 'Pineapple', 'Valencia Orange'],
  Actors: ['Leonardo DiCaprio', 'Cillian Murphy', 'Christian Bale', 'Tom Cruise', 'Brad Pitt', 'Robert Downey Jr', 'Keanu Reeves', 'Denzel Washington'],
  Cricket: ['Virat Kohli', 'MS Dhoni', 'Sachin Tendulkar', 'Rohit Sharma', 'AB de Villiers', 'Kane Williamson', 'Ben Stokes', 'Jasprit Bumrah'],
  Custom: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Sigma', 'Echo', 'Zeta']
};

/**
 * Generates an authoritative shuffled deck for N players.
 * For N players, we need N unique items, each having 4 identical cards (total 4N cards).
 */
export function generateShowDeck(category: ShowCategory, playerCount: number, customPool?: string[]): ShowCard[] {
  let pool = SHOW_CATEGORY_PRESETS[category] || SHOW_CATEGORY_PRESETS.Cars;
  if (category === 'Custom' && customPool && customPool.length >= playerCount) {
    pool = customPool;
  }

  // Ensure pool has at least playerCount distinct items
  const items = [...pool];
  while (items.length < playerCount) {
    items.push(`Item ${items.length + 1}`);
  }

  const selectedItems = items.slice(0, playerCount);
  const deck: ShowCard[] = [];

  selectedItems.forEach((itemName, itemIndex) => {
    for (let c = 0; c < 4; c++) {
      deck.push({
        id: `card_${itemIndex}_${c}_${Math.random().toString(36).substring(2, 7)}`,
        name: itemName,
        category,
        setIndex: itemIndex
      });
    }
  });

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

/**
 * Distributes initial 4 cards to each player
 */
export function distributeShowCards(
  deck: ShowCard[],
  playerIds: string[]
): Record<string, ShowCard[]> {
  const hands: Record<string, ShowCard[]> = {};
  playerIds.forEach(id => {
    hands[id] = [];
  });

  // Deal 4 cards to each player
  for (let r = 0; r < 4; r++) {
    for (const id of playerIds) {
      const card = deck.pop();
      if (card) {
        hands[id].push(card);
      }
    }
  }

  return hands;
}

/**
 * Authoritative Server Resolution for a Show Round
 * - Validates that every active player passed a card they actually hold
 * - Removes passed card from owner's hand
 * - Delivers passed card to the next player according to passing order (clockwise or counter-clockwise)
 * - Asserts that every player has exactly 4 cards after resolution
 */
export function resolveShowPassingRound(
  currentHands: Record<string, ShowCard[]>,
  submissions: Record<string, string>, // playerId -> cardId
  passingOrder: string[],
  direction: 'clockwise' | 'counter-clockwise' = 'clockwise'
): {
  success: boolean;
  newHands: Record<string, ShowCard[]>;
  transfers: { fromPlayerId: string; toPlayerId: string; passedCard: ShowCard }[];
  error?: string;
} {
  const newHands: Record<string, ShowCard[]> = {};
  const transfers: { fromPlayerId: string; toPlayerId: string; passedCard: ShowCard }[] = [];
  const activePlayers = passingOrder.filter(id => currentHands[id] !== undefined);

  if (activePlayers.length < 2) {
    return { success: false, newHands: currentHands, transfers: [], error: 'At least 2 active players required for Show.' };
  }

  // 1. Validation: Verify all submitted cards belong to the respective player
  for (const playerId of activePlayers) {
    const cardId = submissions[playerId];
    if (!cardId) {
      return { success: false, newHands: currentHands, transfers: [], error: `Player ${playerId} has not selected a card to pass.` };
    }
    const playerHand = currentHands[playerId];
    const ownsCard = playerHand.some(c => c.id === cardId);
    if (!ownsCard) {
      return { success: false, newHands: currentHands, transfers: [], error: `Security violation: Player does not own card ${cardId}.` };
    }
  }

  // 2. Prepare remaining hands (3 cards each) and extract passed cards
  const passedCardsByPlayer: Record<string, ShowCard> = {};
  for (const playerId of activePlayers) {
    const cardId = submissions[playerId];
    const playerHand = currentHands[playerId];
    const passedCard = playerHand.find(c => c.id === cardId)!;
    const remainingHand = playerHand.filter(c => c.id !== cardId);

    newHands[playerId] = remainingHand;
    passedCardsByPlayer[playerId] = passedCard;
  }

  // 3. Deliver passed cards in passing order
  const n = activePlayers.length;
  for (let i = 0; i < n; i++) {
    const fromPlayerId = activePlayers[i];
    const toPlayerIndex = direction === 'clockwise' ? (i + 1) % n : (i - 1 + n) % n;
    const toPlayerId = activePlayers[toPlayerIndex];
    const passedCard = passedCardsByPlayer[fromPlayerId];

    newHands[toPlayerId].push(passedCard);
    transfers.push({
      fromPlayerId,
      toPlayerId,
      passedCard
    });
  }

  // 4. Invariant check: Everyone must have exactly 4 cards
  for (const playerId of activePlayers) {
    if (newHands[playerId].length !== 4) {
      return {
        success: false,
        newHands: currentHands,
        transfers: [],
        error: `Integrity failure: Player ${playerId} does not have exactly 4 cards.`
      };
    }
  }

  return {
    success: true,
    newHands,
    transfers
  };
}

/**
 * Checks if a hand has a 4-of-a-kind (same card name 4 times)
 */
export function checkFourOfAKind(hand: ShowCard[]): boolean {
  if (hand.length !== 4) return false;
  const firstName = hand[0].name;
  return hand.every(c => c.name === firstName);
}
