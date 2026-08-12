import React from "react";
import { useTheme } from "@/app/theme-provider";
import { Sun, Moon, Monitor } from "lucide-react";

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-card p-1 rounded-lg border border-border transition-colors">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`p-1.5 rounded-md transition-all cursor-pointer ${
          theme === "light"
            ? "bg-accent text-accent-foreground font-bold shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Light theme"
        title="Light theme"
      >
        <Sun className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`p-1.5 rounded-md transition-all cursor-pointer ${
          theme === "dark"
            ? "bg-accent text-[#1a0a06] font-bold shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Dark theme"
        title="Dark theme"
      >
        <Moon className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        className={`p-1.5 rounded-md transition-all cursor-pointer ${
          theme === "system"
            ? "bg-accent text-accent-foreground font-bold shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="System theme"
        title="System theme"
      >
        <Monitor className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default ThemeToggle;
