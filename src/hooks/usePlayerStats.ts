import { useState, useEffect, useCallback } from "react";
import type { PlayerStats, PuzzleMode } from "@/lib/types";

const STORAGE_KEY = 'based-puzzles-stats';

function getDefaultStats(): PlayerStats {
  return {
    sudoku: {
      gamesCompleted: 0,
      bestTimeSeconds: undefined,
      totalPuzzlesStarted: 0,
    },
    crossword: {
      gamesCompleted: 0,
      bestTimeSeconds: undefined,
      totalPuzzlesStarted: 0,
    },
    streakDays: 0,
    lastPlayedDate: undefined,
    playerName: undefined,
  };
}

function loadStats(): PlayerStats {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...getDefaultStats(),
        ...parsed,
        sudoku: { ...getDefaultStats().sudoku, ...parsed.sudoku },
        crossword: { ...getDefaultStats().crossword, ...parsed.crossword },
      };
    }
  } catch (e) {
    console.error('Failed to load stats:', e);
  }
  return getDefaultStats();
}

function saveStats(stats: PlayerStats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
}

function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

function isYesterday(dateString: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateString(yesterday) === dateString;
}

function isToday(dateString: string): boolean {
  return getDateString() === dateString;
}

export function usePlayerStats() {
  const [stats, setStats] = useState<PlayerStats>(() => loadStats());

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  const updateName = useCallback((name: string) => {
    setStats(prev => ({ ...prev, playerName: name }));
  }, []);

  const recordCompletion = useCallback((mode: PuzzleMode, timeSeconds: number) => {
    setStats(prev => {
      const modeStats = prev[mode];
      const newBestTime = modeStats.bestTimeSeconds === undefined 
        ? timeSeconds 
        : Math.min(modeStats.bestTimeSeconds, timeSeconds);

      const today = getDateString();
      let newStreak = prev.streakDays;

      if (!prev.lastPlayedDate || !isToday(prev.lastPlayedDate)) {
        if (prev.lastPlayedDate && isYesterday(prev.lastPlayedDate)) {
          newStreak = prev.streakDays + 1;
        } else if (!prev.lastPlayedDate) {
          newStreak = 1;
        } else {
          newStreak = 1;
        }
      }

      return {
        ...prev,
        [mode]: {
          ...modeStats,
          gamesCompleted: modeStats.gamesCompleted + 1,
          bestTimeSeconds: newBestTime,
        },
        streakDays: newStreak,
        lastPlayedDate: today,
      };
    });
  }, []);

  const incrementStarted = useCallback((mode: PuzzleMode) => {
    setStats(prev => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        totalPuzzlesStarted: prev[mode].totalPuzzlesStarted + 1,
      },
    }));
  }, []);

  const updateStreak = useCallback(() => {
    setStats(prev => {
      if (!prev.lastPlayedDate) return prev;
      
      const today = getDateString();
      
      if (isToday(prev.lastPlayedDate) || isYesterday(prev.lastPlayedDate)) {
        return prev;
      }
      
      return {
        ...prev,
        streakDays: 0,
      };
    });
  }, []);

  const resetStats = useCallback(() => {
    setStats(getDefaultStats());
  }, []);

  return {
    stats,
    updateName,
    recordCompletion,
    incrementStarted,
    updateStreak,
    resetStats,
  };
}
