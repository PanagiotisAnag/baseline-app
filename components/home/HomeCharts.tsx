"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: 11,
  color: "hsl(var(--foreground))",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};

const axisStyle = { fontSize: 10, fill: "hsl(var(--muted-foreground))" };

interface HomeChartsProps {
  workoutData: { day: string; sessions: number; minutes: number }[];
  calorieData: { day: string; calories: number; goal: number }[];
  financeData: { day: string; income: number; expenses: number }[];
}

export function HomeCharts({ workoutData, calorieData, financeData }: HomeChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-1 pt-4 px-4">
          <CardTitle className="section-label">Workout Minutes</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-3">
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={workoutData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="workoutGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />
              <Area type="monotone" dataKey="minutes" stroke="#f97316" strokeWidth={1.5} fill="url(#workoutGrad)" name="Minutes" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1 pt-4 px-4">
          <CardTitle className="section-label">Daily Calories</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-3">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={calorieData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))", fillOpacity: 0.5 }} />
              <Bar dataKey="calories" fill="#22c55e" radius={[3, 3, 0, 0]} name="Calories" />
              <Bar dataKey="goal" fill="#22c55e" fillOpacity={0.15} radius={[3, 3, 0, 0]} name="Goal" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader className="pb-1 pt-4 px-4">
          <CardTitle className="section-label">Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-3">
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={financeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />
              <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={1.5} dot={false} name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={1.5} dot={false} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
