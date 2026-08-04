import React, { useState } from "react";
import { Bell } from "lucide-react";
import { NotificationCenter } from "@/features/notifications/components/NotificationCenter";
import { useUnreadCount } from "@/features/notifications/hooks/useNotifications";

export const NotificationButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Configure polling interval (30 seconds)
  const pollingInterval = 30000;
  const { unreadCount } = useUnreadCount(pollingInterval);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg border border-border bg-card/30 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground ring-2 ring-background select-none animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenter 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        pollingInterval={pollingInterval}
      />
    </div>
  );
};
