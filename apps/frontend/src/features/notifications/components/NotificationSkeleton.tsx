import React from "react";

export const NotificationSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-start gap-3 animate-pulse border-b border-border/40 pb-3 last:border-0 last:pb-0">
          <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-3 w-1/3 bg-muted rounded" />
            <div className="h-3.5 w-3/4 bg-muted rounded" />
            <div className="h-2 w-1/4 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};
