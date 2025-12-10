import { Card, CardContent } from "@/components/ui/card";
import { CrosswordGrid } from "@/components/crossword/CrosswordGrid";
import { CrosswordClues } from "@/components/crossword/CrosswordClues";
import { CrosswordControls } from "@/components/crossword/CrosswordControls";
import { Timer } from "@/components/Timer";
import { DifficultySelector } from "@/components/DifficultySelector";
import type { CrosswordPuzzle, CrosswordClue, Difficulty, GameStatus } from "@/lib/types";

interface CrosswordModeProps {
  puzzle: CrosswordPuzzle;
  selectedCell: { row: number; col: number } | null;
  activeClue: CrosswordClue | null;
  incorrectCells: Set<string>;
  difficulty: Difficulty;
  timerSeconds: number;
  status: GameStatus;
  onCellSelect: (row: number, col: number) => void;
  onLetterInput: (row: number, col: number, letter: string | null) => void;
  onClueSelect: (clueId: string) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onNewPuzzle: () => void;
  onReset: () => void;
  onCheck: () => void;
  isDaily?: boolean;
}

export function CrosswordMode({
  puzzle,
  selectedCell,
  activeClue,
  incorrectCells,
  difficulty,
  timerSeconds,
  status,
  onCellSelect,
  onLetterInput,
  onClueSelect,
  onDifficultyChange,
  onNewPuzzle,
  onReset,
  onCheck,
  isDaily = false,
}: CrosswordModeProps) {
  const isSolved = status === 'solved';

  return (
    <div className="space-y-6" data-testid="crossword-mode">
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

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <Card>
          <CardContent className="p-1 sm:p-2 md:p-4 lg:p-6 flex flex-col items-center gap-4 sm:gap-6">
            <div className="text-center mb-2">
              <h2 className="text-lg font-semibold" data-testid="text-puzzle-title">{puzzle.title}</h2>
            </div>
            
            <CrosswordGrid
              puzzle={puzzle}
              selectedCell={selectedCell}
              activeClue={activeClue}
              incorrectCells={incorrectCells}
              onCellSelect={onCellSelect}
              onLetterInput={onLetterInput}
              disabled={isSolved}
            />

            <CrosswordControls
              onNewPuzzle={onNewPuzzle}
              onReset={onReset}
              onCheck={onCheck}
              disabled={isSolved}
            />
          </CardContent>
        </Card>

        <Card className="lg:self-start">
          <CardContent className="p-2 sm:p-4">
            <CrosswordClues
              clues={puzzle.clues}
              activeClueId={activeClue?.id || null}
              onClueSelect={onClueSelect}
            />
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Click a cell and type letters. Use arrow keys or click clues to navigate.</p>
      </div>
    </div>
  );
}
