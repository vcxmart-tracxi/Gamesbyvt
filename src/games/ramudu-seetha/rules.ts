/**
 * Ramudu–Seetha Game Rules & Scoring Engine
 * Designed and Developed by Bodepudi Varun Teja
 */

import { RamuduSeethaCharacter, RamuduSeethaScoringResult } from '../../types/game.js';

export const DEFAULT_CHARACTERS: RamuduSeethaCharacter[] = [
  { id: 'ramudu', name: 'Ramudu', baseScore: 1000, roleType: 'ramudu' },
  { id: 'seetha', name: 'Seetha', baseScore: 1000, roleType: 'seetha' },
  { id: 'lakshman', name: 'Lakshman', baseScore: 900, roleType: 'fixed' },
  { id: 'hanumal', name: 'Hanumal', baseScore: 750, roleType: 'fixed' },
  { id: 'vaali', name: 'Vaali', baseScore: 500, roleType: 'fixed' },
];

export const RAMUDU_SEETHA_PENDING_RULES_NOTE = 
  "The exact dealing mechanism, turn sequence, and discovery interaction rules ('Ramudu finds Seetha') have not yet been specified by the game designer. The scoring engine and custom character configuration are fully implemented and verified below. Full dealing gameplay will be unlocked once discovery rules are confirmed.";

/**
 * Validates a custom character addition.
 * Rule: Host can add configurable name and integer score >= 0 and strictly below 500.
 */
export function validateCustomCharacter(
  name: string,
  score: number,
  existingCharacters: RamuduSeethaCharacter[]
): { valid: boolean; error?: string; character?: RamuduSeethaCharacter } {
  const trimmedName = name.trim();
  if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 25) {
    return { valid: false, error: 'Character name must be between 2 and 25 characters.' };
  }

  // Check duplicate
  const isDuplicate = existingCharacters.some(
    c => c.name.toLowerCase() === trimmedName.toLowerCase()
  );
  if (isDuplicate) {
    return { valid: false, error: `Character "${trimmedName}" already exists.` };
  }

  // Integer check
  if (!Number.isInteger(score)) {
    return { valid: false, error: 'Score must be a whole integer.' };
  }

  // Score rule: Non-negative and STRICTLY BELOW 500
  if (score < 0 || score >= 500) {
    return { valid: false, error: 'Custom character score must be non-negative and strictly below 500 (0 to 499).' };
  }

  const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  return {
    valid: true,
    character: {
      id,
      name: trimmedName,
      baseScore: score,
      isCustom: true,
      roleType: 'custom'
    }
  };
}

/**
 * Authoritative Scoring Calculation for Ramudu-Seetha
 * Rules:
 * - If Ramudu finds Seetha: Ramudu receives 1,000 and Seetha receives 0.
 * - If Ramudu does not find Seetha: Ramudu receives 0 and Seetha receives 1,000.
 * - The other characters retain their assigned scores (Lakshman 900, Hanumal 750, Vaali 500, custom <500).
 * - The scores of the other characters do not affect the Ramudu–Seetha scoring outcome.
 */
export function calculateRamuduSeethaScores(
  ramuduFoundSeetha: boolean,
  playerAssignments: {
    playerId: string;
    playerName: string;
    character: RamuduSeethaCharacter;
  }[]
): RamuduSeethaScoringResult {
  const scores = playerAssignments.map(assignment => {
    const { playerId, playerName, character } = assignment;
    let finalScore = character.baseScore;
    let notes = '';

    if (character.roleType === 'ramudu') {
      if (ramuduFoundSeetha) {
        finalScore = 1000;
        notes = 'Found Seetha: awarded full 1,000 points.';
      } else {
        finalScore = 0;
        notes = 'Failed to find Seetha: awarded 0 points.';
      }
    } else if (character.roleType === 'seetha') {
      if (ramuduFoundSeetha) {
        finalScore = 0;
        notes = 'Discovered by Ramudu: awarded 0 points.';
      } else {
        finalScore = 1000;
        notes = 'Remained hidden from Ramudu: awarded full 1,000 points.';
      }
    } else {
      // Fixed characters and custom characters retain assigned scores
      finalScore = character.baseScore;
      notes = `Retains assigned fixed score of ${character.baseScore} points.`;
    }

    return {
      playerId,
      playerName,
      characterName: character.name,
      score: finalScore,
      notes
    };
  });

  return {
    ramuduFoundSeetha,
    scores
  };
}
