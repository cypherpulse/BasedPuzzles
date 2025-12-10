import { useCallback, useEffect, useRef } from "react";
import type { SudokuBoard } from "@/lib/types";

interface SudokuGridProps {
  board: SudokuBoard;
  selectedCell: { row: number; col: number } | null;
  errors: Set<string>;
  onCellSelect: (row: number, col: number) => void;
  onCellChange: (row: number, col: number, value: number | null) => void;
  disabled?: boolean;
}

function getCellKey(row: number, col: number): string {
  return `r${row}c${col}`;
}

export function SudokuGrid({
  board,
  selectedCell,
  errors,
  onCellSelect,
  onCellChange,
  disabled,
}: SudokuGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedCell || disabled) return;
    
    const { row, col } = selectedCell;
    const cell = board[row][col];
    
    if (cell.readonly) return;

    if (e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      onCellChange(row, col, parseInt(e.key));
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      e.preventDefault();
      onCellChange(row, col, null);
    } else if (e.key === 'ArrowUp' && row > 0) {
      e.preventDefault();
      onCellSelect(row - 1, col);
    } else if (e.key === 'ArrowDown' && row < 8) {
      e.preventDefault();
      onCellSelect(row + 1, col);
    } else if (e.key === 'ArrowLeft' && col > 0) {
      e.preventDefault();
      onCellSelect(row, col - 1);
    } else if (e.key === 'ArrowRight' && col < 8) {
      e.preventDefault();
      onCellSelect(row, col + 1);
    }
  }, [selectedCell, board, onCellSelect, onCellChange, disabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div 
      ref={gridRef}
      className="inline-block bg-foreground/90 dark:bg-foreground/80 p-0.5 rounded-lg"
      role="grid"
      aria-label="Sudoku grid"
      data-testid="sudoku-grid"
    >
      <div className="grid grid-cols-9">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const hasError = errors.has(getCellKey(rowIndex, colIndex));
            const isHighlighted = selectedCell && (
              selectedCell.row === rowIndex || 
              selectedCell.col === colIndex ||
              (Math.floor(selectedCell.row / 3) === Math.floor(rowIndex / 3) && 
               Math.floor(selectedCell.col / 3) === Math.floor(colIndex / 3))
            );
            const sameValue = selectedCell && 
              board[selectedCell.row][selectedCell.col].value !== null &&
              board[selectedCell.row][selectedCell.col].value === cell.value;

            const borderClasses = [
              colIndex % 3 === 0 && colIndex !== 0 ? 'border-l-2 border-l-foreground/80 dark:border-l-foreground/60' : '',
              rowIndex % 3 === 0 && rowIndex !== 0 ? 'border-t-2 border-t-foreground/80 dark:border-t-foreground/60' : '',
            ].join(' ');

            return (
              <button
                key={getCellKey(rowIndex, colIndex)}
                onClick={() => !disabled && onCellSelect(rowIndex, colIndex)}
                disabled={disabled}
                className={`
                  w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 
                  flex items-center justify-center
                  text-xs sm:text-sm md:text-base lg:text-lg font-mono font-medium
                  transition-colors duration-75
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset
                  ${borderClasses}
                  ${cell.readonly 
                    ? 'bg-muted font-semibold text-foreground' 
                    : 'bg-background cursor-pointer'}
                  ${isSelected 
                    ? 'bg-primary/20 ring-2 ring-primary ring-inset' 
                    : isHighlighted && !cell.readonly
                      ? 'bg-primary/5'
                      : ''}
                  ${sameValue && !isSelected ? 'bg-primary/15' : ''}
                  ${hasError ? 'text-destructive bg-destructive/10' : ''}
                  ${disabled ? 'cursor-not-allowed opacity-75' : ''}
                `}
                data-testid={`cell-${rowIndex}-${colIndex}`}
                aria-label={`Row ${rowIndex + 1}, Column ${colIndex + 1}, ${cell.value || 'empty'}`}
                tabIndex={isSelected ? 0 : -1}
              >
                {cell.value}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
