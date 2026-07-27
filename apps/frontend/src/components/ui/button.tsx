import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-xs font-semibold select-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-8 px-3 text-[11px]",
        md: "h-9 px-4",
        lg: "h-10 px-5 text-sm",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant,
  size,
  isLoading,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }), isLoading && "pointer-events-none opacity-80")}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" /> : null}
      {children}
    </button>
  );
};

export interface IconButtonProps extends ButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  "aria-label": string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  className,
  children,
  ...props
}) => {
  return (
    <Button size="icon" variant="outline" className={className} {...props}>
      <Icon className="h-4 w-4 shrink-0" />
      {children}
    </Button>
  );
};
