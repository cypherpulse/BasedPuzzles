import { useCallback, useEffect, useRef } from "react";
import type { CrosswordPuzzle, CrosswordClue } from "@/lib/types";

interface CrosswordGridProps {
  puzzle: CrosswordPuzzle;
  selectedCell: { row: number; col: number } | null;
  activeClue: CrosswordClue | null;
  incorrectCells: Set<string>;
  onCellSelect: (row: number, col: number) => void;
  onLetterInput: (row: number, col: number, letter: string | null) => void;
  disabled?: boolean;
}

function getCellKey(row: number, col: number): string {
  return `${row}-${col}`;
}

function getCellsForClue(puzzle: CrosswordPuzzle, clue: CrosswordClue): Set<string> {
  const cells = new Set<string>();
  for (let i = 0; i < clue.length; i++) {
    const row = clue.direction === 'down' ? clue.row + i : clue.row;
    const col = clue.direction === 'across' ? clue.col + i : clue.col;
    cells.add(getCellKey(row, col));
  }
  return cells;
}

export function CrosswordGrid({
  puzzle,
  selectedCell,
  activeClue,
  incorrectCells,
  onCellSelect,
  onLetterInput,
  disabled,
}: CrosswordGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeClueCells = activeClue ? getCellsForClue(puzzle, activeClue) : new Set<string>();

  const moveToNextCell = useCallback((row: number, col: number, direction: 'forward' | 'backward') => {
    if (!activeClue) return;
    
    const delta = direction === 'forward' ? 1 : -1;
    let newRow = row;
    let newCol = col;
    
    if (activeClue.direction === 'across') {
      newCol += delta;
    } else {
      newRow += delta;
    }

    if (newRow >= 0 && newRow < puzzle.height && newCol >= 0 && newCol < puzzle.width) {
      const cell = puzzle.grid[newRow][newCol];
      if (!cell.isBlock) {
        onCellSelect(newRow, newCol);
      }
    }
  }, [activeClue, puzzle, onCellSelect]);

  // Focus input when cell is selected
  useEffect(() => {
    if (selectedCell && !disabled) {
      // Small timeout to ensure UI is ready and to handle mobile focus behavior
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedCell, disabled]);

  // Keep focus on input when clicking anywhere in the grid
  const handleGridClick = () => {
    if (selectedCell && !disabled) {
      inputRef.current?.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCell || disabled) return;
    
    const inputChar = e.target.value.slice(-1).toUpperCase();
    // Reset input immediately
    e.target.value = '';

    if (inputChar >= 'A' && inputChar <= 'Z') {
      onLetterInput(selectedCell.row, selectedCell.col, inputChar);
      moveToNextCell(selectedCell.row, selectedCell.col, 'forward');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!selectedCell || disabled) return;
    
    const { row, col } = selectedCell;
    const cell = puzzle.grid[row][col];
    
    if (cell.isBlock) return;

    // We handle letters in onChange to support mobile keyboards better
    // But we need to prevent default for navigation keys to avoid scrolling
    
    if (e.key === 'Backspace') {
      e.preventDefault(); // Prevent browser back
      if (cell.userLetter) {
        onLetterInput(row, col, null);
      } else {
        moveToNextCell(row, col, 'backward');
      }
    } else if (e.key === 'Delete') {
      e.preventDefault();
      onLetterInput(row, col, null);
    } else if (e.key === 'ArrowUp' && row > 0 && !puzzle.grid[row - 1][col].isBlock) {
      e.preventDefault();
      onCellSelect(row - 1, col);
    } else if (e.key === 'ArrowDown' && row < puzzle.height - 1 && !puzzle.grid[row + 1][col].isBlock) {
      e.preventDefault();
      onCellSelect(row + 1, col);
    } else if (e.key === 'ArrowLeft' && col > 0 && !puzzle.grid[row][col - 1].isBlock) {
      e.preventDefault();
      onCellSelect(row, col - 1);
    } else if (e.key === 'ArrowRight' && col < puzzle.width - 1 && !puzzle.grid[row][col + 1].isBlock) {
      e.preventDefault();
      onCellSelect(row, col + 1);
    } else if (e.key === 'Tab') {
      e.preventDefault();
    }
  };

  return (
    <div 
      ref={gridRef}
      className="inline-block bg-foreground/90 dark:bg-foreground/70 p-0.5 rounded-lg relative"
      role="grid"
      aria-label="Crossword grid"
      data-testid="crossword-grid"
      onClick={handleGridClick}
    >
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 w-px h-px overflow-hidden pointer-events-none"
        style={{ top: 0, left: 0 }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck="false"
        value=""
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        aria-hidden="true"
      />
      <div 
        className="grid gap-px"
        style={{ 
          gridTemplateColumns: `repeat(${puzzle.width}, 1fr)`,
        }}
      >
        {puzzle.grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const cellKey = getCellKey(rowIndex, colIndex);
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isInActiveClue = activeClueCells.has(cellKey);
            const hasError = incorrectCells.has(cellKey);

            if (cell.isBlock) {
              return (
                <div
                  key={cellKey}
                  className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-foreground/90 dark:bg-foreground/70"
                  data-testid={`cell-block-${rowIndex}-${colIndex}`}
                />
              );
            }

            return (
              <button
                key={cellKey}
                onClick={() => !disabled && onCellSelect(rowIndex, colIndex)}
                disabled={disabled}
                className={`
                  w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10
                  relative
                  flex items-center justify-center
                  text-xs sm:text-sm md:text-base lg:text-lg font-mono font-medium uppercase
                  transition-colors duration-75
                  focus:outline-none
                  ${isSelected 
                    ? 'bg-primary/30 ring-2 ring-primary ring-inset' 
                    : isInActiveClue
                      ? 'bg-primary/10'
                      : 'bg-background'}
                  ${hasError ? 'text-destructive bg-destructive/10' : 'text-foreground'}
                  ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
                `}
                data-testid={`cell-${rowIndex}-${colIndex}`}
                aria-label={`Row ${rowIndex + 1}, Column ${colIndex + 1}, ${cell.userLetter || 'empty'}`}
                tabIndex={isSelected ? 0 : -1}
              >
                {cell.number && (
                  <span className="absolute top-0.5 left-1 text-[10px] text-muted-foreground font-sans font-normal">
                    {cell.number}
                  </span>
                )}
                {cell.userLetter}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
