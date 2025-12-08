import { Grid3X3, AlignJustify } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PuzzleMode } from "@/lib/types";

interface ModeSwitcherProps {
  mode: PuzzleMode;
  onChange: (mode: PuzzleMode) => void;
}

export function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div className="flex items-center justify-center gap-3 p-4" data-testid="mode-switcher">
      <Button
        variant={mode === 'sudoku' ? 'default' : 'outline'}
        size="lg"
        onClick={() => onChange('sudoku')}
        className="px-6 md:px-8 gap-2 font-semibold"
        data-testid="button-mode-sudoku"
      >
        <Grid3X3 className="w-5 h-5" />
        <span>Sudoku</span>
      </Button>
      <Button
        variant={mode === 'crossword' ? 'default' : 'outline'}
        size="lg"
        onClick={() => onChange('crossword')}
        className="px-6 md:px-8 gap-2 font-semibold"
        data-testid="button-mode-crossword"
      >
        <AlignJustify className="w-5 h-5" />
        <span>Crossword</span>
      </Button>
    </div>
  );
}
