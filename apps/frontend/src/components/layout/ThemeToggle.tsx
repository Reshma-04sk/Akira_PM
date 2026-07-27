import React from "react";
import { useTheme } from "@/app/theme-provider";
import { Sun, Moon, Monitor } from "lucide-react";

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border">
      <button
        onClick={() => setTheme("light")}
        className={`p-1.5 rounded-md transition-all hover:text-foreground ${
          theme === "light"
            ? "bg-background shadow text-foreground"
            : "text-muted-foreground"
        }`}
        aria-label="Light theme"
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-1.5 rounded-md transition-all hover:text-foreground ${
          theme === "dark"
            ? "bg-background shadow text-foreground"
            : "text-muted-foreground"
        }`}
        aria-label="Dark theme"
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-1.5 rounded-md transition-all hover:text-foreground ${
          theme === "system"
            ? "bg-background shadow text-foreground"
            : "text-muted-foreground"
        }`}
        aria-label="System theme"
      >
        <Monitor className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
