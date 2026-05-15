import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, UtensilsCrossed, Wallet, TrendingUp, BriefcaseBusiness, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const colorMap = {
  blue: { icon: "text-blue-400 bg-blue-500/10", value: "" },
  green: { icon: "text-emerald-400 bg-emerald-500/10", value: "text-emerald-400" },
  orange: { icon: "text-orange-400 bg-orange-500/10", value: "" },
  purple: { icon: "text-purple-400 bg-purple-500/10", value: "" },
  red: { icon: "text-red-400 bg-red-500/10", value: "text-red-400" },
};

const iconMap = {
  dumbbell: Dumbbell,
  utensils: UtensilsCrossed,
  wallet: Wallet,
  trending: TrendingUp,
  briefcase: BriefcaseBusiness,
  check: CheckSquare,
};

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  iconName: keyof typeof iconMap;
  color?: keyof typeof colorMap;
}

export function StatsCard({ title, value, subtitle, iconName, color = "blue" }: StatsCardProps) {
  const Icon = iconMap[iconName];
  const colors = colorMap[color];
  return (
    <Card className="group transition-all duration-200 hover:shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className={cn("inline-flex rounded-md p-1.5", colors.icon)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div>
          <p className={cn("text-2xl font-bold tabular-nums leading-none", colors.value)}>{value}</p>
          <p className="text-xs text-muted-foreground mt-1.5 leading-tight">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
