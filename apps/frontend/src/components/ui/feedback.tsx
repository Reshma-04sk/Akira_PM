import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle, Info, Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { toast as sonnerToast } from "sonner";
import { cn } from "@/lib/utils";

// Alert Component
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground text-xs leading-relaxed",
  {
    variants: {
      variant: {
        info: "bg-muted/40 text-foreground border-border [&>svg]:text-primary",
        success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 [&>svg]:text-emerald-500",
        warning: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 [&>svg]:text-amber-500",
        error: "bg-destructive/10 text-destructive border-destructive/20 [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant,
  title,
  description,
  children,
  ...props
}) => {
  const Icon = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
  }[variant || "info"];

  return (
    <div className={cn(alertVariants({ variant, className }))} {...props}>
      <Icon className="h-4 w-4 shrink-0" />
      {title && <h5 className="font-bold text-foreground mb-0.5">{title}</h5>}
      {description && <div className="text-muted-foreground">{description}</div>}
      {children}
    </div>
  );
};

// Badge Component
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold select-none transition-all leading-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "text-foreground border-border bg-background",
        success: "border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        warning: "border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400",
        destructive: "border-transparent bg-destructive/15 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge: React.FC<BadgeProps> = ({ className, variant, ...props }) => {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
};

// Progress Component
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export const Progress: React.FC<ProgressProps> = ({ className, value = 0, ...props }) => {
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted border border-border", className)} {...props}>
      <div
        className="h-full w-full bg-primary transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

// Spinner Component
export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: "sm" | "md" | "lg";
}

export const Spinner: React.FC<SpinnerProps> = ({ className, size = "md", ...props }) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }[size];

  return <Loader2 className={cn("animate-spin text-primary shrink-0", sizes, className)} {...props} />;
};

// Skeleton Component
export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return <div className={cn("animate-pulse rounded-md bg-muted/60", className)} {...props} />;
};

// Toast Helpers
export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, { description });
  },
  error: (message: string, description?: string) => {
    sonnerToast.error(message, { description });
  },
  info: (message: string, description?: string) => {
    sonnerToast.info(message, { description });
  },
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, { description });
  },
};
