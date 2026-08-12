import React from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi, SprintVelocityPoint } from "@/services/api/dashboard.api";
import { Card } from "@/components/ui/data-display";
import { Skeleton } from "@/components/ui/feedback";
import { TrendingUp, AlertCircle } from "lucide-react";

export const VelocityChart: React.FC = () => {
  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard", "analytics"],
    queryFn: () => dashboardApi.getAnalytics().then((res) => res.data),
    staleTime: 60000,
    retry: 2,
    refetchOnMount: "always",
  });

  const velocityHistory: SprintVelocityPoint[] = analytics?.velocity_history || [];
  const maxShipped = Math.max(...velocityHistory.map((p) => p.tasks_shipped), 1);
  const hasData = velocityHistory.some((p) => p.tasks_shipped > 0 || p.total_tasks > 0);

  if (isLoading) {
    return (
      <Card className="p-5 flex flex-col gap-4">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-40 w-full" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-5 flex flex-col items-center justify-center min-h-[220px] text-center gap-2">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <span className="text-xs font-bold text-foreground">Velocity telemetry unavailable.</span>
        <span className="text-[10px] text-muted-foreground">Unable to query completion telemetry metrics.</span>
        <button
          onClick={() => refetch()}
          className="mt-2 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/30 rounded hover:bg-accent/10 transition-colors"
        >
          Retry
        </button>
      </Card>
    );
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent shrink-0" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
            Weekly Velocity &middot; Tasks Shipped
          </h3>
        </div>
        <div className="flex items-center gap-3 font-mono text-[9px] text-muted-foreground">
          {analytics?.avg_cycle_time_days !== null && (
            <span>Avg Cycle: <strong className="text-foreground font-bold">{analytics?.avg_cycle_time_days}d</strong></span>
          )}
          {analytics?.completion_rate_percent !== undefined && (
            <span>Completion: <strong className="text-accent font-bold">{analytics.completion_rate_percent}%</strong></span>
          )}
        </div>
      </div>

      {!hasData ? (
        <div className="py-10 flex flex-col items-center justify-center text-center space-y-1.5">
          <span className="font-mono text-xs font-bold text-foreground">Not enough history yet.</span>
          <p className="text-[10px] text-muted-foreground max-w-xs leading-relaxed">
            Complete work across a few weeks to build your completion velocity history.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* SVG Telemetry Line Chart — purely presentational */}
          <div className="relative h-44 w-full pt-4 pb-6">
            <svg
              className="w-full h-full overflow-hidden"
              viewBox="0 0 400 120"
              preserveAspectRatio="none"
              role="img"
              aria-label="Weekly task completion velocity chart"
              focusable="false"
              style={{ pointerEvents: "none" }}
            >
              {/* Horizontal Grid lines — decorative */}
              <line x1="0" y1="20" x2="400" y2="20" stroke="var(--workspace-border)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="400" y2="60" stroke="var(--workspace-border)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="var(--workspace-border)" strokeWidth="1" strokeDasharray="3 3" />

              {/* Data points & connecting line */}
              {(() => {
                const points = velocityHistory.map((pt, idx) => {
                  const x = (idx / (velocityHistory.length - 1 || 1)) * 360 + 20;
                  const y = 100 - (pt.tasks_shipped / maxShipped) * 80;
                  return { x, y, pt };
                });

                const d = points.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");

                return (
                  <>
                    <path
                      d={d}
                      fill="none"
                      stroke="var(--workspace-accent)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="4"
                          fill="var(--workspace-surface)"
                          stroke="var(--workspace-accent)"
                          strokeWidth="2"
                        />
                        <text
                          x={p.x}
                          y={p.y - 10}
                          textAnchor="middle"
                          className="fill-foreground font-mono text-[9px] font-bold"
                        >
                          {p.pt.tasks_shipped}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="flex items-center justify-between font-mono text-[9px] text-muted-foreground px-2 border-t border-border pt-2">
            {velocityHistory.map((pt, idx) => (
              <span key={idx} className="truncate">{pt.label}</span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
