/**
 * Housy / Tambola Rules, Ticket Generator & Server-Side Validator
 * Designed and Developed by Bodepudi Varun Teja
 */

import { TambolaPattern, TambolaTicket } from '../../types/game.js';

export const PATTERN_LABELS: Record<TambolaPattern, string> = {
  earlyFive: 'Early Five',
  topLine: 'Top Line',
  middleLine: 'Middle Line',
  bottomLine: 'Bottom Line',
  fullHouse: 'Full House',
};

export const PATTERN_DESCRIPTIONS: Record<TambolaPattern, string> = {
  earlyFive: 'Any 5 numbers marked on your ticket',
  topLine: 'All 5 numbers in the first row',
  middleLine: 'All 5 numbers in the second row',
  bottomLine: 'All 5 numbers in the third row',
  fullHouse: 'All 15 numbers on your entire ticket',
};

/**
 * Column number boundaries (inclusive)
 * Col 0: 1-9
 * Col 1: 10-19
 * ...
 * Col 8: 80-90
 */
export function getColumnRange(colIndex: number): { min: number; max: number } {
  if (colIndex === 0) return { min: 1, max: 9 };
  if (colIndex === 8) return { min: 80, max: 90 };
  return { min: colIndex * 10, max: colIndex * 10 + 9 };
}

/**
 * Generates an authoritative, mathematically valid Tambola ticket:
 * - 3 rows x 9 columns
 * - Exactly 5 numbers per row (15 total numbers)
 * - Numbers in column c must strictly fall within c's range
 * - Numbers within each column are sorted strictly ascending vertically
 */
export function generateAuthoritativeTambolaTicket(): TambolaTicket {
  // Step 1: Initialize empty 3x9 grid
  const grid: (number | null)[][] = [
    new Array(9).fill(null),
    new Array(9).fill(null),
    new Array(9).fill(null),
  ];

  // Distribute 15 numbers across 9 columns (every column must have at least 1, max 3)
  // Total = 15. Initial 1 per column = 9. Remaining 6 distributed.
  const colCounts = new Array(9).fill(1);
  let remaining = 6;
  while (remaining > 0) {
    const col = Math.floor(Math.random() * 9);
    if (colCounts[col] < 3) {
      colCounts[col]++;
      remaining--;
    }
  }

  // Row counts must each be exactly 5
  // We need to place colCounts[c] numbers in rows such that each row has 5
  // Let's use a standard assignment solver
  let rowCounts = [0, 0, 0];
  const colRowAssignments: number[][] = Array.from({ length: 9 }, () => []);

  // For columns with 3 numbers, they fill all 3 rows
  for (let c = 0; c < 9; c++) {
    if (colCounts[c] === 3) {
      colRowAssignments[c] = [0, 1, 2];
      rowCounts[0]++;
      rowCounts[1]++;
      rowCounts[2]++;
    }
  }

  // For columns with 2 or 1 number, assign rows respecting the target of 5 per row
  const remainingCols = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(c => colCounts[c] < 3);
  // Simple retry loop for row assignment to ensure exactly 5 per row
  let assignedSuccessfully = false;
  let attempts = 0;

  while (!assignedSuccessfully && attempts < 100) {
    attempts++;
    const testRowCounts = [...rowCounts];
    const testAssignments = colRowAssignments.map(r => [...r]);
    let possible = true;

    // Shuffle remaining cols to avoid bias
    const shuffledCols = [...remainingCols].sort(() => Math.random() - 0.5);

    for (const c of shuffledCols) {
      const count = colCounts[c];
      // Available rows that have space (< 5)
      const availableRows = [0, 1, 2].filter(r => testRowCounts[r] < 5);
      if (availableRows.length < count) {
        possible = false;
        break;
      }
      // Pick random `count` rows from available
      const picked = [...availableRows].sort(() => Math.random() - 0.5).slice(0, count).sort();
      testAssignments[c] = picked;
      for (const r of picked) {
        testRowCounts[r]++;
      }
    }

    if (possible && testRowCounts[0] === 5 && testRowCounts[1] === 5 && testRowCounts[2] === 5) {
      assignedSuccessfully = true;
      for (let c = 0; c < 9; c++) {
        colRowAssignments[c] = testAssignments[c];
      }
    }
  }

  // Fallback to deterministic layout if random attempts exceeded
  if (!assignedSuccessfully) {
    return generateFallbackTicket();
  }

  // Step 2: Pick unique numbers for each column and sort them
  for (let c = 0; c < 9; c++) {
    const { min, max } = getColumnRange(c);
    const rangeSize = max - min + 1;
    const allNumsInCol: number[] = [];
    for (let i = min; i <= max; i++) allNumsInCol.push(i);

    // Pick colCounts[c] random numbers
    allNumsInCol.sort(() => Math.random() - 0.5);
    const pickedNums = allNumsInCol.slice(0, colCounts[c]).sort((a, b) => a - b);

    // Place into the assigned rows
    const rows = colRowAssignments[c].sort((a, b) => a - b);
    for (let i = 0; i < rows.length; i++) {
      grid[rows[i]][c] = pickedNums[i];
    }
  }

  return grid;
}

/**
 * Deterministic fallback generator guaranteed to be valid
 */
function generateFallbackTicket(): TambolaTicket {
  // 5 numbers per row, sorted columns
  const ticket: TambolaTicket = [
    [4, null, 23, null, 42, 51, null, 74, null],
    [null, 15, null, 36, 48, null, 62, null, 83],
    [8, null, 29, 39, null, 59, null, null, 89],
  ];
  return ticket;
}

/**
 * Extracts all non-null numbers from a ticket
 */
export function getTicketNumbers(ticket: TambolaTicket): number[] {
  const numbers: number[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 9; c++) {
      const val = ticket[r][c];
      if (val !== null) numbers.push(val);
    }
  }
  return numbers;
}

/**
 * Authoritative Server Validation of a Tambola Claim
 * Rejects if:
 * - Claimed pattern is not supported
 * - Player's required numbers have not been officially called by the backend
 */
export function validateTambolaClaim(
  ticket: TambolaTicket,
  calledNumbers: number[],
  pattern: TambolaPattern
): { valid: boolean; reason?: string } {
  const calledSet = new Set(calledNumbers);

  switch (pattern) {
    case 'earlyFive': {
      const allNumbers = getTicketNumbers(ticket);
      const marked = allNumbers.filter(n => calledSet.has(n));
      if (marked.length < 5) {
        return {
          valid: false,
          reason: `Early Five requires 5 called numbers on your ticket, but only ${marked.length} have been called.`,
        };
      }
      return { valid: true };
    }

    case 'topLine': {
      const rowNumbers = ticket[0].filter((n): n is number => n !== null);
      const uncalled = rowNumbers.filter(n => !calledSet.has(n));
      if (uncalled.length > 0) {
        return {
          valid: false,
          reason: `Top Line requires all 5 row numbers called. Missing: ${uncalled.join(', ')}.`,
        };
      }
      return { valid: true };
    }

    case 'middleLine': {
      const rowNumbers = ticket[1].filter((n): n is number => n !== null);
      const uncalled = rowNumbers.filter(n => !calledSet.has(n));
      if (uncalled.length > 0) {
        return {
          valid: false,
          reason: `Middle Line requires all 5 row numbers called. Missing: ${uncalled.join(', ')}.`,
        };
      }
      return { valid: true };
    }

    case 'bottomLine': {
      const rowNumbers = ticket[2].filter((n): n is number => n !== null);
      const uncalled = rowNumbers.filter(n => !calledSet.has(n));
      if (uncalled.length > 0) {
        return {
          valid: false,
          reason: `Bottom Line requires all 5 row numbers called. Missing: ${uncalled.join(', ')}.`,
        };
      }
      return { valid: true };
    }

    case 'fullHouse': {
      const allNumbers = getTicketNumbers(ticket);
      const uncalled = allNumbers.filter(n => !calledSet.has(n));
      if (uncalled.length > 0) {
        return {
          valid: false,
          reason: `Full House requires all 15 ticket numbers called. Remaining uncalled: ${uncalled.length}.`,
        };
      }
      return { valid: true };
    }

    default:
      return { valid: false, reason: 'Unknown pattern claim.' };
  }
}
