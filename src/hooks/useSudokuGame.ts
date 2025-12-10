import { useState, useEffect, useCallback, useRef } from "react";
import { getSudokuPuzzle, cloneBoard, isBoardSolved, getErrorCells, getDailySudokuPuzzle, getDailySudokuDifficulty, fetchDailySudoku, verifySudokuSolution } from "@/lib/sudoku";
import type { SudokuBoard, Difficulty, GameStatus, ChallengeType } from "@/lib/types";
import { getTodayDateString } from "@/lib/types";
import { useWalletAddress } from "@/hooks/useWalletAddress";

interface UseSudokuGameOptions {
  onGameStart?: () => void;
  challengeType?: ChallengeType;
}

export function useSudokuGame(options?: UseSudokuGameOptions) {
  const challengeType = options?.challengeType ?? 'practice';
  const today = getTodayDateString();
  const { address } = useWalletAddress();
  
  const [difficulty, setDifficultyState] = useState<Difficulty>(() => {
    if (challengeType === 'daily') {
      return getDailySudokuDifficulty(today);
    }
    return 'easy';
  });
  const [board, setBoard] = useState<SudokuBoard>(() => {
    if (challengeType === 'daily') {
      return getDailySudokuPuzzle(today);
    }
    return getSudokuPuzzle('easy');
  });
  const [initialBoard, setInitialBoard] = useState<SudokuBoard>(() => cloneBoard(board));
  const [loading, setLoading] = useState(challengeType === 'daily');
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [hasStarted, setHasStarted] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Load board
  useEffect(() => {
    const loadBoard = async () => {
      if (challengeType === 'daily') {
        try {
          const fetchedBoard = await fetchDailySudoku(today, address || undefined);
          setBoard(fetchedBoard);
          setInitialBoard(cloneBoard(fetchedBoard));
        } catch (error) {
          console.error('Failed to load daily sudoku:', error);
          // Fallback to local
          const localBoard = getDailySudokuPuzzle(today);
          setBoard(localBoard);
          setInitialBoard(cloneBoard(localBoard));
        }
      } else {
        const localBoard = getSudokuPuzzle(difficulty);
        setBoard(localBoard);
        setInitialBoard(cloneBoard(localBoard));
      }
      setLoading(false);
    };
    loadBoard();
  }, [challengeType, today, difficulty, address]);

  useEffect(() => {
    if (status === 'playing' && hasStarted) {
      timerRef.current = window.setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status, hasStarted]);

  const startNewGame = useCallback(() => {
    if (challengeType === 'daily') {
      const newBoard = getDailySudokuPuzzle(today);
      setBoard(newBoard);
      setInitialBoard(cloneBoard(newBoard));
      setDifficultyState(getDailySudokuDifficulty(today));
    } else {
      const newBoard = getSudokuPuzzle(difficulty);
      setBoard(newBoard);
      setInitialBoard(cloneBoard(newBoard));
    }
    setSelectedCell(null);
    setErrors(new Set());
    setTimerSeconds(0);
    setStatus('playing');
    setHasStarted(false);
    setHintsUsed(0);
  }, [difficulty, challengeType, today]);

  const setDifficulty = useCallback((newDifficulty: Difficulty) => {
    if (challengeType === 'daily') return;
    setDifficultyState(newDifficulty);
    const newBoard = getSudokuPuzzle(newDifficulty);
    setBoard(newBoard);
    setInitialBoard(cloneBoard(newBoard));
    setSelectedCell(null);
    setErrors(new Set());
    setTimerSeconds(0);
    setStatus('playing');
    setHasStarted(false);
    setHintsUsed(0);
    options?.onGameStart?.();
  }, [options, challengeType]);

  const selectCell = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
    if (!hasStarted) {
      setHasStarted(true);
      options?.onGameStart?.();
    }
  }, [hasStarted, options]);

  const updateCell = useCallback((row: number, col: number, value: number | null) => {
    if (status !== 'playing') return;
    
    const cell = board[row][col];
    if (cell.readonly) return;

    if (!hasStarted) {
      setHasStarted(true);
      options?.onGameStart?.();
    }

    setBoard(prevBoard => {
      const newBoard = cloneBoard(prevBoard);
      newBoard[row][col].value = value;
      return newBoard;
    });
    
    setErrors(new Set());
  }, [board, status, hasStarted, options]);

  const resetBoard = useCallback(() => {
    setBoard(cloneBoard(initialBoard));
    setErrors(new Set());
    setTimerSeconds(0);
    setStatus('playing');
    setHasStarted(false);
    setHintsUsed(0);
  }, [initialBoard]);

  const checkSolution = useCallback(() => {
    const errorCells = getErrorCells(board);
    setErrors(errorCells);

    if (isBoardSolved(board)) {
      setStatus('solved');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return true;
    }
    
    return false;
  }, [board]);

  const submitSolution = useCallback(async () => {
    if (!board || !address || challengeType !== 'daily') return false;
    
    try {
      const solution = board.flat().map(cell => cell.value || 0);
      const result = await verifySudokuSolution(board.id, solution, timerSeconds, address);
      if (result.valid) {
        setStatus('solved');
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        return true;
      }
    } catch (error) {
      console.error('Failed to verify solution:', error);
    }
    return false;
  }, [board, address, challengeType, timerSeconds]);

  return {
    board,
    initialBoard,
    loading,
    selectedCell,
    errors,
    difficulty,
    timerSeconds,
    status,
    hintsUsed,
    challengeType,
    setDifficulty,
    startNewGame,
    selectCell,
    updateCell,
    resetBoard,
    checkSolution,
    submitSolution,
    setHintsUsed,
  };
}
