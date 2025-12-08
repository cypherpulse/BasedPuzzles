import { RotateCcw, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CrosswordControlsProps {
  onNewPuzzle: () => void;
  onReset: () => void;
  onCheck: () => void;
  disabled?: boolean;
}

export function CrosswordControls({
  onNewPuzzle,
  onReset,
  onCheck,
  disabled,
}: CrosswordControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2" data-testid="crossword-controls">
      <Button
        variant="default"
        onClick={onCheck}
        disabled={disabled}
        className="gap-2"
        data-testid="button-check-crossword"
      >
        <Check className="w-4 h-4" />
        Check Puzzle
      </Button>
      <Button
        variant="outline"
        onClick={onNewPuzzle}
        disabled={disabled}
        className="gap-2"
        data-testid="button-new-puzzle"
      >
        <RefreshCw className="w-4 h-4" />
        New Puzzle
      </Button>
      <Button
        variant="outline"
        onClick={onReset}
        disabled={disabled}
        className="gap-2"
        data-testid="button-reset-crossword"
      >
        <RotateCcw className="w-4 h-4" />
        Reset
      </Button>
    </div>
  );
}
