"use client";

import { usePathname } from "next/navigation";
import { Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

const pageTitles: Record<string, string> = {
  "/home": "Dashboard",
  "/workout": "Workout",
  "/diet": "Diet",
  "/financials": "Financials",
  "/work": "Work",
  "/todos": "Todos",
  "/activities": "Activities",
};

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const title = pageTitles[pathname] ?? "Trackable";

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sticky top-0 z-10">
      <SidebarTrigger className="-ml-1" />
      <div className="flex-1">
        <h1 className="text-base font-semibold">{title}</h1>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </header>
  );
}
