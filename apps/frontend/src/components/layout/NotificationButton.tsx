import React from "react";
import { Bell } from "lucide-react";

export const NotificationButton: React.FC = () => {
  return (
    <button
      onClick={() => console.log("Open notifications")}
      className="relative p-2 rounded-lg border border-border bg-card/30 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      aria-label="Notifications"
    >
      <Bell className="h-4 w-4" />
      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
    </button>
  );
};
