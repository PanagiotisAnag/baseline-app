"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "blue" | "green" | "orange" | "purple" | "red";
}

const colorMap = {
  blue: "text-blue-500 bg-blue-500/10",
  green: "text-emerald-500 bg-emerald-500/10",
  orange: "text-orange-500 bg-orange-500/10",
  purple: "text-purple-500 bg-purple-500/10",
  red: "text-red-500 bg-red-500/10",
};

export function StatsCard({ title, value, subtitle, icon: Icon, color = "blue" }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-4">
        <div className={cn("rounded-lg p-2 shrink-0", colorMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{title}</p>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
