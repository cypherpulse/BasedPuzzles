import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface NumberPadProps {
  onNumber: (num: number | null) => void;
  disabled?: boolean;
}

export function NumberPad({ onNumber, disabled }: NumberPadProps) {
  return (
    <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto" data-testid="number-pad">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <Button
          key={num}
          variant="secondary"
          size="lg"
          onClick={() => onNumber(num)}
          disabled={disabled}
          className="font-mono text-lg font-semibold aspect-square"
          data-testid={`button-number-${num}`}
        >
          {num}
        </Button>
      ))}
      <Button
        variant="outline"
        size="lg"
        onClick={() => onNumber(null)}
        disabled={disabled}
        className="aspect-square"
        data-testid="button-number-clear"
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  );
}
