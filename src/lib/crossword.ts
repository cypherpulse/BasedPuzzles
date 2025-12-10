import type { CrosswordPuzzle, CrosswordCell, CrosswordClue, Difficulty } from "./types";

// For competitive/daily mode - fetch from backend
export async function fetchDailyCrossword(date: string, walletAddress?: string): Promise<CrosswordPuzzle> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (walletAddress) {
    headers['X-Wallet-Address'] = walletAddress;
  }
  const response = await fetch(`/api/puzzles/daily?date=${date}&type=crossword`, {
    headers,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch daily crossword');
  }
  const data = await response.json();
  return data.puzzle;
}

export async function fetchCrosswordById(id: string, walletAddress?: string): Promise<CrosswordPuzzle> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (walletAddress) {
    headers['X-Wallet-Address'] = walletAddress;
  }
  const response = await fetch(`/api/puzzles/${id}`, {
    headers,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch crossword by id');
  }
  const data = await response.json();
  return data.puzzle;
}

export async function verifyCrosswordSolution(puzzleId: string, solution: string[], timeSeconds: number, walletAddress: string): Promise<{ valid: boolean; score?: number }> {
  const response = await fetch('/api/puzzles/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Wallet-Address': walletAddress,
    },
    body: JSON.stringify({
      puzzleId,
      type: 'crossword',
      solution,
      timeSeconds,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to verify crossword solution');
  }
  return await response.json();
}

// Keep existing static puzzles for fallback/demo
const BASE_PUZZLES: CrosswordPuzzle[] = [
  {
    id: 'base-basics-1',
    title: 'Base Basics',
    difficulty: 'easy',
    width: 7,
    height: 7,
    grid: [],
    clues: [
      { id: 'a1', number: 1, direction: 'across', row: 0, col: 2, length: 4, prompt: 'The L2 network built on Ethereum' },
      { id: 'a2', number: 2, direction: 'across', row: 4, col: 0, length: 7, prompt: 'Where the new economy is moving (___ economy)' },
      { id: 'd1', number: 1, direction: 'down', row: 0, col: 2, length: 5, prompt: 'Core mantra: ___ on Base' },
      { id: 'd2', number: 2, direction: 'down', row: 0, col: 5, length: 3, prompt: 'The gas token used on Base' },
    ],
  },
  {
    id: 'base-culture-1',
    title: 'Base Culture',
    difficulty: 'medium',
    width: 9,
    height: 9,
    grid: [],
    clues: [
      { id: 'a1', number: 1, direction: 'across', row: 1, col: 1, length: 4, prompt: 'Create a new NFT' },
      { id: 'a2', number: 2, direction: 'across', row: 3, col: 0, length: 8, prompt: 'Exchange that incubated Base' },
      { id: 'a3', number: 3, direction: 'across', row: 5, col: 2, length: 5, prompt: 'We are all gonna make it (abbr)' },
      { id: 'd1', number: 1, direction: 'down', row: 1, col: 1, length: 5, prompt: 'Viral meme coin on Base (cat)' },
      { id: 'd2', number: 2, direction: 'down', row: 0, col: 4, length: 5, prompt: 'Creator of Base (first name)' },
      { id: 'd3', number: 3, direction: 'down', row: 3, col: 7, length: 3, prompt: 'Gas token' },
    ],
  },
  {
    id: 'crypto-expert-1',
    title: 'Crypto Expert',
    difficulty: 'hard',
    width: 11,
    height: 11,
    grid: [],
    clues: [
      { id: 'a1', number: 1, direction: 'across', row: 0, col: 0, length: 9, prompt: 'Entity that orders transactions on L2' },
      { id: 'a2', number: 2, direction: 'across', row: 2, col: 2, length: 4, prompt: 'Data storage unit introduced in EIP-4844' },
      { id: 'a3', number: 3, direction: 'across', row: 4, col: 0, length: 8, prompt: 'Technology stack Base is built on' },
      { id: 'a4', number: 4, direction: 'across', row: 6, col: 3, length: 6, prompt: 'Scaling solution type (Optimistic ___)' },
      { id: 'd1', number: 1, direction: 'down', row: 0, col: 0, length: 10, prompt: 'Network of networks (___chain)' },
      { id: 'd2', number: 2, direction: 'down', row: 0, col: 5, length: 7, prompt: 'Mainnet launch month (2023)' },
      { id: 'd3', number: 3, direction: 'down', row: 4, col: 9, length: 5, prompt: 'Layer 1 blockchain' },
    ],
  },
];

const SOLUTIONS: Record<string, string[][]> = {
  'base-basics-1': [
    ['#', '#', 'B', 'A', 'S', 'E', '#'],
    ['#', '#', 'U', '#', '#', 'T', '#'],
    ['#', '#', 'I', '#', '#', 'H', '#'],
    ['#', '#', 'L', '#', '#', '#', '#'],
    ['O', 'N', 'C', 'H', 'A', 'I', 'N'],
    ['#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#'],
  ],
  'base-culture-1': [
    ['#', '#', '#', '#', 'J', '#', '#', '#', '#'],
    ['#', 'M', 'I', 'N', 'T', '#', '#', '#', '#'],
    ['#', 'O', '#', '#', 'S', '#', '#', '#', '#'],
    ['C', 'O', 'I', 'N', 'B', 'A', 'S', 'E', '#'],
    ['#', 'C', '#', '#', 'E', '#', '#', 'T', '#'],
    ['#', 'H', 'W', 'A', 'G', 'M', 'I', 'H', '#'],
    ['#', 'I', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#', '#'],
  ],
  'crypto-expert-1': [
    ['S', 'E', 'Q', 'U', 'E', 'N', 'C', 'E', 'R', '#', '#'],
    ['U', '#', '#', '#', '#', 'U', '#', '#', '#', '#', '#'],
    ['P', '#', 'B', 'L', 'O', 'B', '#', '#', '#', '#', '#'],
    ['E', '#', '#', '#', '#', 'G', '#', '#', '#', '#', '#'],
    ['O', 'P', 'T', 'I', 'M', 'I', 'S', 'M', '#', 'E', '#'],
    ['C', '#', '#', '#', '#', 'S', '#', '#', '#', 'T', '#'],
    ['H', '#', '#', 'R', 'O', 'L', 'L', 'U', 'P', 'H', '#'],
    ['A', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ['I', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ['N', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
  ],
};



function buildGrid(puzzle: CrosswordPuzzle): CrosswordCell[][] {
  const solution = SOLUTIONS[puzzle.id];
  const grid: CrosswordCell[][] = [];
  
  const cellNumbers = new Map<string, number>();
  puzzle.clues.forEach(clue => {
    const key = `${clue.row}-${clue.col}`;
    if (!cellNumbers.has(key)) {
      cellNumbers.set(key, clue.number);
    }
  });

  for (let row = 0; row < puzzle.height; row++) {
    const rowCells: CrosswordCell[] = [];
    for (let col = 0; col < puzzle.width; col++) {
      const letter = solution[row][col];
      const isBlock = letter === '#';
      const key = `${row}-${col}`;
      
      rowCells.push({
        row,
        col,
        letter: isBlock ? null : letter,
        userLetter: null,
        isBlock,
        number: cellNumbers.get(key),
      });
    }
    grid.push(rowCells);
  }
  
  return grid;
}

export function getCrosswordPuzzle(difficulty: Difficulty, seed?: number): CrosswordPuzzle {
  const puzzles = BASE_PUZZLES.filter(p => p.difficulty === difficulty);
  const index = seed !== undefined ? seed % puzzles.length : Math.floor(Math.random() * puzzles.length);
  const puzzle = puzzles.length > 0 
    ? puzzles[index % puzzles.length]
    : BASE_PUZZLES[0];
  
  return {
    ...puzzle,
    grid: buildGrid(puzzle),
  };
}

export function getDailyCrosswordPuzzle(dateString: string): CrosswordPuzzle {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    hash = hash & hash;
  }
  const seed = Math.abs(hash);
  const puzzle = BASE_PUZZLES[seed % BASE_PUZZLES.length];
  return {
    ...puzzle,
    grid: buildGrid(puzzle),
  };
}

export function getDailyCrosswordDifficulty(dateString: string): Difficulty {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    hash = hash & hash;
  }
  const seed = Math.abs(hash);
  return BASE_PUZZLES[seed % BASE_PUZZLES.length].difficulty;
}

export function isCrosswordSolved(puzzle: CrosswordPuzzle): boolean {
  for (const row of puzzle.grid) {
    for (const cell of row) {
      if (!cell.isBlock) {
        if (!cell.userLetter || cell.userLetter.toUpperCase() !== cell.letter?.toUpperCase()) {
          return false;
        }
      }
    }
  }
  return true;
}

export function getIncorrectCells(puzzle: CrosswordPuzzle): Set<string> {
  const incorrect = new Set<string>();
  
  for (const row of puzzle.grid) {
    for (const cell of row) {
      if (!cell.isBlock && cell.userLetter) {
        if (cell.userLetter.toUpperCase() !== cell.letter?.toUpperCase()) {
          incorrect.add(`${cell.row}-${cell.col}`);
        }
      }
    }
  }
  
  return incorrect;
}

export function getCellsForClue(puzzle: CrosswordPuzzle, clue: CrosswordClue): CrosswordCell[] {
  const cells: CrosswordCell[] = [];
  for (let i = 0; i < clue.length; i++) {
    const row = clue.direction === 'down' ? clue.row + i : clue.row;
    const col = clue.direction === 'across' ? clue.col + i : clue.col;
    if (row < puzzle.height && col < puzzle.width) {
      cells.push(puzzle.grid[row][col]);
    }
  }
  return cells;
}

export function findClueForCell(
  puzzle: CrosswordPuzzle, 
  row: number, 
  col: number, 
  preferredDirection?: 'across' | 'down'
): CrosswordClue | null {
  const matchingClues = puzzle.clues.filter(clue => {
    for (let i = 0; i < clue.length; i++) {
      const clueRow = clue.direction === 'down' ? clue.row + i : clue.row;
      const clueCol = clue.direction === 'across' ? clue.col + i : clue.col;
      if (clueRow === row && clueCol === col) {
        return true;
      }
    }
    return false;
  });

  if (matchingClues.length === 0) return null;
  
  if (preferredDirection) {
    const preferred = matchingClues.find(c => c.direction === preferredDirection);
    if (preferred) return preferred;
  }
  
  return matchingClues[0];
}

export function clonePuzzle(puzzle: CrosswordPuzzle): CrosswordPuzzle {
  return {
    ...puzzle,
    grid: puzzle.grid.map(row => row.map(cell => ({ ...cell }))),
  };
}
