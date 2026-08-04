import React, { useRef, useEffect } from "react";
import { AlertCircle, Sparkles } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { NotificationSkeleton } from "./NotificationSkeleton";
import { Button } from "@/components/ui/button";

interface NotificationCenterProps {
  onClose: () => void;
  isOpen: boolean;
  pollingInterval?: number;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  onClose, 
  isOpen, 
  pollingInterval 
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    notifications,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markRead,
    markAllRead,
  } = useNotifications(pollingInterval);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-12 z-50 w-80 sm:w-96 max-h-[480px] flex flex-col bg-popover text-popover-foreground border border-border shadow-xl rounded-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0 select-none">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold tracking-tight text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-primary text-primary-foreground rounded-full select-none">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={() => markAllRead()}
            className="text-[10px] font-semibold text-primary hover:text-primary/80 hover:underline transition-all focus:outline-none"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Content Feed */}
      <div className="flex-grow overflow-y-auto min-h-0 max-h-[360px] divide-y divide-border/30">
        {isLoading ? (
          <NotificationSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-destructive animate-bounce shrink-0" />
            <p className="text-xs font-semibold text-foreground">Failed to load feed</p>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="text-[10px] h-7 px-3">
              Try again
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center space-y-3 select-none">
            <div className="p-3 bg-primary/10 rounded-full text-primary animate-pulse">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground">All Caught Up!</p>
              <p className="text-[10px] text-muted-foreground max-w-[200px] leading-relaxed">
                You don't have any notifications right now. Check back later!
              </p>
            </div>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
                onMarkRead={(id) => markRead(id)}
              />
            ))}
          </>
        )}
      </div>

      {/* Footer / Load More */}
      {hasNextPage && (
        <div className="border-t border-border bg-card/10 p-2 text-center shrink-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => fetchNextPage()} 
            disabled={isFetchingNextPage}
            className="w-full text-[10px] h-7 text-muted-foreground hover:text-foreground font-semibold"
          >
            {isFetchingNextPage ? "Loading more..." : "Load More Notifications"}
          </Button>
        </div>
      )}
    </div>
  );
};
