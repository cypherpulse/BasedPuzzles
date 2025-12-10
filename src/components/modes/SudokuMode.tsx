import { Card, CardContent } from "@/components/ui/card";
import { SudokuGrid } from "@/components/sudoku/SudokuGrid";
import { SudokuControls } from "@/components/sudoku/SudokuControls";
import { NumberPad } from "@/components/sudoku/NumberPad";
import { Timer } from "@/components/Timer";
import { DifficultySelector } from "@/components/DifficultySelector";
import type { SudokuBoard, Difficulty, GameStatus } from "@/lib/types";

interface SudokuModeProps {
  board: SudokuBoard;
  selectedCell: { row: number; col: number } | null;
  errors: Set<string>;
  difficulty: Difficulty;
  timerSeconds: number;
  status: GameStatus;
  onCellSelect: (row: number, col: number) => void;
  onCellChange: (row: number, col: number, value: number | null) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onNewGame: () => void;
  onReset: () => void;
  onCheck: () => void;
  isDaily?: boolean;
}

export function SudokuMode({
  board,
  selectedCell,
  errors,
  difficulty,
  timerSeconds,
  status,
  onCellSelect,
  onCellChange,
  onDifficultyChange,
  onNewGame,
  onReset,
  onCheck,
  isDaily = false,
}: SudokuModeProps) {
  const isSolved = status === 'solved';
  const canClearCell = selectedCell && !board[selectedCell.row][selectedCell.col].readonly && board[selectedCell.row][selectedCell.col].value !== null;

  const handleNumberInput = (num: number | null) => {
    if (selectedCell && !board[selectedCell.row][selectedCell.col].readonly) {
      onCellChange(selectedCell.row, selectedCell.col, num);
    }
  };

  const handleClearCell = () => {
    if (selectedCell && !board[selectedCell.row][selectedCell.col].readonly) {
      onCellChange(selectedCell.row, selectedCell.col, null);
    }
  };

  return (
    <div className="space-y-6" data-testid="sudoku-mode">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {!isDaily ? (
          <DifficultySelector
            difficulty={difficulty}
            onChange={onDifficultyChange}
            disabled={isSolved}
          />
        ) : (
          <div className="text-sm text-muted-foreground capitalize">
            Difficulty: <span className="font-medium text-foreground">{difficulty}</span>
          </div>
        )}
        <Timer seconds={timerSeconds} isRunning={!isSolved} />
      </div>

      <Card>
        <CardContent className="p-1 sm:p-2 md:p-4 lg:p-6 flex flex-col items-center gap-4 sm:gap-6">
          <SudokuGrid
            board={board}
            selectedCell={selectedCell}
            errors={errors}
            onCellSelect={onCellSelect}
            onCellChange={onCellChange}
            disabled={isSolved}
          />

          <div className="w-full max-w-sm sm:hidden">
            <NumberPad onNumber={handleNumberInput} disabled={isSolved} />
          </div>

          <SudokuControls
            onNewGame={onNewGame}
            onReset={onReset}
            onCheck={onCheck}
            onClearCell={handleClearCell}
            disabled={isSolved}
            canClear={!!canClearCell}
          />
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>Click a cell and use keyboard (1-9) or number pad to fill in values</p>
      </div>
    </div>
  );
}
