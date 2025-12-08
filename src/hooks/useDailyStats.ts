import { useState, useEffect, useCallback } from "react";
import { getTodayDateString, type DailyStats, type PuzzleMode } from "@/lib/types";

const DAILY_STATS_KEY = 'based-puzzles-daily-stats';

function getDefaultDailyStats(): DailyStats {
  return {
    sudokuCompleted: false,
    crosswordCompleted: false,
    date: getTodayDateString(),
  };
}

export function useDailyStats() {
  const [dailyStats, setDailyStats] = useState<DailyStats>(() => {
    const stored = localStorage.getItem(DAILY_STATS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as DailyStats;
      if (parsed.date === getTodayDateString()) {
        return parsed;
      }
    }
    return getDefaultDailyStats();
  });

  useEffect(() => {
    if (dailyStats.date !== getTodayDateString()) {
      const newStats = getDefaultDailyStats();
      setDailyStats(newStats);
      localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(newStats));
    } else {
      localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(dailyStats));
    }
  }, [dailyStats]);

  const markDailyCompleted = useCallback((mode: PuzzleMode, timeSeconds: number) => {
    setDailyStats(prev => {
      if (prev.date !== getTodayDateString()) {
        const newStats = getDefaultDailyStats();
        if (mode === 'sudoku') {
          newStats.sudokuCompleted = true;
          newStats.sudokuTime = timeSeconds;
        } else {
          newStats.crosswordCompleted = true;
          newStats.crosswordTime = timeSeconds;
        }
        return newStats;
      }
      
      if (mode === 'sudoku' && !prev.sudokuCompleted) {
        return { ...prev, sudokuCompleted: true, sudokuTime: timeSeconds };
      }
      if (mode === 'crossword' && !prev.crosswordCompleted) {
        return { ...prev, crosswordCompleted: true, crosswordTime: timeSeconds };
      }
      return prev;
    });
  }, []);

  const isDailyCompleted = useCallback((mode: PuzzleMode) => {
    if (dailyStats.date !== getTodayDateString()) {
      return false;
    }
    return mode === 'sudoku' ? dailyStats.sudokuCompleted : dailyStats.crosswordCompleted;
  }, [dailyStats]);

  const getDailyTime = useCallback((mode: PuzzleMode) => {
    if (dailyStats.date !== getTodayDateString()) {
      return undefined;
    }
    return mode === 'sudoku' ? dailyStats.sudokuTime : dailyStats.crosswordTime;
  }, [dailyStats]);

  return {
    dailyStats,
    markDailyCompleted,
    isDailyCompleted,
    getDailyTime,
    today: getTodayDateString(),
  };
}
