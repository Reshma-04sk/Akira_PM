import React from "react";
import { cn } from "@/lib/utils";

// Avatar
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border select-none bg-muted text-foreground items-center justify-center text-xs font-bold leading-none uppercase",
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt || fallback} className="h-full w-full object-cover" />
      ) : (
        <span>{fallback.slice(0, 2)}</span>
      )}
    </div>
  );
};

// Card
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className, ...props }) => (
  <div className={cn("rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden", className)} {...props} />
);

export const CardHeader: React.FC<CardProps> = ({ className, ...props }) => (
  <div className={cn("flex flex-col gap-1.5 p-4 sm:p-6", className)} {...props} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={cn("text-sm font-bold tracking-tight text-foreground leading-none", className)} {...props} />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={cn("text-xs text-muted-foreground", className)} {...props} />
);

export const CardContent: React.FC<CardProps> = ({ className, ...props }) => (
  <div className={cn("p-4 sm:p-6 pt-0 sm:pt-0", className)} {...props} />
);

export const CardFooter: React.FC<CardProps> = ({ className, ...props }) => (
  <div className={cn("flex items-center p-4 sm:p-6 pt-0 sm:pt-0 border-t border-border/40 mt-4", className)} {...props} />
);

// Empty State
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  action,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-muted/20 min-h-[220px]",
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="h-10 w-10 rounded-full bg-muted border border-border flex items-center justify-center mb-4 text-muted-foreground shrink-0">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <h3 className="text-xs font-bold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

// Stat Card
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: string | number;
    type: "up" | "down" | "neutral";
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  trend,
  className,
  ...props
}) => {
  return (
    <Card className={cn("p-4 sm:p-6 flex flex-col gap-1.5", className)} {...props}>
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-extrabold tracking-tight text-foreground">{value}</span>
        {trend && (
          <span
            className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-full select-none",
              trend.type === "up" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              trend.type === "down" && "bg-destructive/10 text-destructive",
              trend.type === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
    </Card>
  );
};

// Divider
export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-px w-full my-4" : "w-px h-full mx-4",
        className
      )}
      {...props}
    />
  );
};
