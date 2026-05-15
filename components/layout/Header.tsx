"use client";

import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/layout/NotificationBell";

const pageTitles: Record<string, string> = {
  "/home": "Dashboard",
  "/workout": "Workout",
  "/diet": "Diet",
  "/financials": "Financials",
  "/work": "Work",
  "/todos": "Todos",
  "/activities": "Activities",
  "/habits": "Habits",
};

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const title = pageTitles[pathname] ?? "Baseline";

  return (
    <header className="flex h-12 items-center gap-3 border-b bg-background/80 backdrop-blur-sm px-4 sticky top-0 z-10">
      <SidebarTrigger className="-ml-1 h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
      </div>
      <NotificationBell />
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </header>
  );
}
