"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function AIInsights() {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function fetchInsights() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-insights", { method: "POST" });
      if (!res.ok) throw new Error("Failed to fetch insights");
      const data = await res.json();
      setInsights(data.insights ?? []);
      setLoaded(true);
    } catch {
      toast.error("Could not load AI insights");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-primary/15 bg-primary/5 dark:bg-primary/[0.04]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/15">
              <Sparkles className="h-3 w-3 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
          </div>
          <ShimmerButton
            onClick={fetchInsights}
            disabled={loading}
            className="h-7"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            {loaded ? "Refresh" : "Analyze my week"}
          </ShimmerButton>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2.5">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/5" />
          </div>
        ) : insights.length > 0 ? (
          <ol className="space-y-3">
            {insights.map((insight, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {i + 1}
                </span>
                <span className="text-muted-foreground leading-relaxed">{insight}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">
            Click <span className="text-foreground font-medium">Analyze my week</span> to get personalized insights from your data.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
