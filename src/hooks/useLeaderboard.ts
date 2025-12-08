import { useState, useEffect, useCallback } from "react";
import { generateId, type LeaderboardEntry, type LeaderboardMode, type Difficulty } from "@/lib/types";

const STORAGE_KEY = 'based-puzzles-leaderboard';
const MAX_ENTRIES = 100;

function loadEntries(): LeaderboardEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load leaderboard:', e);
  }
  return [];
}

function saveEntries(entries: LeaderboardEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save leaderboard:', e);
  }
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => loadEntries());

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const getEntries = useCallback((mode?: LeaderboardMode, difficulty?: Difficulty) => {
    let filtered = entries;
    
    if (mode) {
      filtered = filtered.filter(e => e.mode === mode);
    }
    
    if (difficulty) {
      filtered = filtered.filter(e => e.difficulty === difficulty);
    }
    
    return filtered.sort((a, b) => a.timeSeconds - b.timeSeconds);
  }, [entries]);

  const addEntry = useCallback((entry: Omit<LeaderboardEntry, 'id' | 'completedAt'>) => {
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: generateId(),
      completedAt: Date.now(),
    };

    setEntries(prev => {
      const updated = [newEntry, ...prev];
      const sorted = updated.sort((a, b) => a.timeSeconds - b.timeSeconds);
      return sorted.slice(0, MAX_ENTRIES);
    });

    return newEntry;
  }, []);

  const clearEntries = useCallback((mode?: LeaderboardMode) => {
    if (mode) {
      setEntries(prev => prev.filter(e => e.mode !== mode));
    } else {
      setEntries([]);
    }
  }, []);

  return {
    entries,
    getEntries,
    addEntry,
    clearEntries,
  };
}
