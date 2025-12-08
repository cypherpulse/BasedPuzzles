import { Calendar, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChallengeType } from "@/lib/types";

interface ChallengeSwitcherProps {
  activeChallenge: ChallengeType;
  onChallengeChange: (challenge: ChallengeType) => void;
  dailyCompleted?: boolean;
}

export function ChallengeSwitcher({ activeChallenge, onChallengeChange, dailyCompleted }: ChallengeSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={activeChallenge === 'practice' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChallengeChange('practice')}
        className="gap-2"
        data-testid="button-practice-mode"
      >
        <Dumbbell className="w-4 h-4" />
        Practice
      </Button>
      <Button
        variant={activeChallenge === 'daily' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChallengeChange('daily')}
        className="gap-2"
        data-testid="button-daily-mode"
      >
        <Calendar className="w-4 h-4" />
        Daily
        {dailyCompleted && (
          <span className="ml-1 text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full">
            Done
          </span>
        )}
      </Button>
    </div>
  );
}
