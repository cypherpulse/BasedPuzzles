import { Puzzle, User, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { PlayerStats } from "@/lib/types";
import { getPlayerTitle } from "@/lib/types";

interface HeaderProps {
  stats: PlayerStats;
  onProfileClick?: () => void;
}

export function Header({ stats, onProfileClick }: HeaderProps) {
  const title = getPlayerTitle(stats);
  const totalGames = stats.sudoku.gamesCompleted + stats.crossword.gamesCompleted;
  
  return (
    <header className="h-16 border-b bg-background px-4 md:px-6 flex items-center justify-between gap-4" data-testid="header">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <Puzzle className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight" data-testid="text-app-title">Based Puzzles</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">Brain games on Base</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button 
          onClick={onProfileClick}
          className="flex items-center gap-3 hover-elevate active-elevate-2 rounded-lg px-3 py-2 transition-colors"
          data-testid="button-profile"
        >
          <div className="hidden sm:flex items-center gap-2">
            {stats.streakDays > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-mono" data-testid="text-streak">{stats.streakDays}</span>
              </div>
            )}
            <Badge variant="secondary" className="text-xs" data-testid="badge-title">{title}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium" data-testid="text-player-name">{stats.playerName || 'Player'}</p>
              <p className="text-xs text-muted-foreground">{totalGames} games</p>
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
