import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-xs font-semibold select-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-[#f5f5f3] text-black hover:bg-white font-bold border border-white/20 shadow-sm",
        secondary: "bg-white/5 text-white/80 border border-white/10 backdrop-blur hover:bg-white/10 hover:border-white/20",
        ghost: "hover:bg-white/5 hover:text-white text-muted-foreground",
        outline: "border border-white/10 bg-transparent text-white hover:bg-white/5 hover:border-white/15",
        destructive: "bg-rose-950/40 text-rose-400 border border-rose-900/30 hover:bg-rose-900/40 hover:text-rose-300",
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
