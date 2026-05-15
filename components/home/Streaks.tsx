import { Flame, BriefcaseBusiness, Dumbbell, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StreakItem {
  label: string;
  streak: number;
  longest: number;
  icon: React.ReactNode;
  color: string;
}

interface StreaksProps {
  workoutStreak: number;
  workoutLongest: number;
  dietStreak: number;
  dietLongest: number;
  workStreak: number;
  workLongest: number;
}

export function Streaks({ workoutStreak, workoutLongest, dietStreak, dietLongest, workStreak, workLongest }: StreaksProps) {
  const items: StreakItem[] = [
    { label: "Workout", streak: workoutStreak, longest: workoutLongest, icon: <Dumbbell className="h-3.5 w-3.5" />, color: "text-orange-400 bg-orange-500/10" },
    { label: "Diet", streak: dietStreak, longest: dietLongest, icon: <UtensilsCrossed className="h-3.5 w-3.5" />, color: "text-emerald-400 bg-emerald-500/10" },
    { label: "Work", streak: workStreak, longest: workLongest, icon: <BriefcaseBusiness className="h-3.5 w-3.5" />, color: "text-purple-400 bg-purple-500/10" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-400" />
          Streaks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center gap-1.5">
                <div className={cn("rounded-md p-1", item.color)}>
                  {item.icon}
                </div>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className={cn("text-2xl font-bold tabular-nums", item.streak > 0 ? "text-foreground" : "text-muted-foreground/50")}>
                    {item.streak}
                  </span>
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
                <p className="text-xs text-muted-foreground/60 mt-0.5">best {item.longest}d</p>
              </div>
              {/* Mini streak dots — last 7 days visual */}
              <StreakDots streak={item.streak} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StreakDots({ streak }: { streak: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 7 }, (_, i) => {
        const active = i >= 7 - streak;
        return (
          <div
            key={i}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              active ? "bg-primary" : "bg-muted"
            )}
          />
        );
      })}
    </div>
  );
}
