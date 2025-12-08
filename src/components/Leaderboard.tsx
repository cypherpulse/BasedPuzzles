import { Trophy, Medal, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatTime, type LeaderboardEntry, type Difficulty, type LeaderboardMode, type ChallengeType } from "@/lib/types";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  mode: LeaderboardMode;
  maxEntries?: number;
  challengeType?: ChallengeType;
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Medal className="w-4 h-4 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />;
  if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
  return <span className="text-xs text-muted-foreground w-4 text-center">{rank}</span>;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No entries yet. Be the first!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/50"
          data-testid={`leaderboard-entry-${index}`}
        >
          <div className="w-6 flex justify-center">
            {getRankIcon(index + 1)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium truncate" data-testid={`text-leaderboard-name-${index}`}>
                {entry.playerName}
              </p>
              {entry.assisted && (
                <Lightbulb className="w-3 h-3 text-yellow-500 shrink-0" title="Used hints" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDate(entry.completedAt)}
            </p>
          </div>
          <Badge variant="outline" className="text-xs capitalize shrink-0">
            {entry.difficulty}
          </Badge>
          <div className="text-right shrink-0">
            <p className="text-sm font-mono font-semibold" data-testid={`text-leaderboard-time-${index}`}>
              {formatTime(entry.timeSeconds)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Leaderboard({ entries, mode, maxEntries = 10, challengeType = 'practice' }: LeaderboardProps) {
  const modeEntries = entries
    .filter(e => e.mode === mode)
    .filter(e => (e.challengeType || 'practice') === challengeType)
    .sort((a, b) => a.timeSeconds - b.timeSeconds)
    .slice(0, maxEntries);

  const filterByDifficulty = (difficulty: Difficulty | 'all') => {
    if (difficulty === 'all') return modeEntries;
    return modeEntries.filter(e => e.difficulty === difficulty);
  };

  return (
    <Card data-testid="leaderboard-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="all" data-testid="tab-leaderboard-all">All</TabsTrigger>
            <TabsTrigger value="easy" data-testid="tab-leaderboard-easy">Easy</TabsTrigger>
            <TabsTrigger value="medium" data-testid="tab-leaderboard-medium">Med</TabsTrigger>
            <TabsTrigger value="hard" data-testid="tab-leaderboard-hard">Hard</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <LeaderboardTable entries={filterByDifficulty('all')} />
          </TabsContent>
          <TabsContent value="easy">
            <LeaderboardTable entries={filterByDifficulty('easy')} />
          </TabsContent>
          <TabsContent value="medium">
            <LeaderboardTable entries={filterByDifficulty('medium')} />
          </TabsContent>
          <TabsContent value="hard">
            <LeaderboardTable entries={filterByDifficulty('hard')} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
