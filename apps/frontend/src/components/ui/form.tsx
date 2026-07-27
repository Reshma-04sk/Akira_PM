import React from "react";
import { cn } from "@/lib/utils";

// FormField Wrapper
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  error,
  className,
  ...props
}) => {
  return (
    <div className={cn("space-y-1.5 w-full", className)} {...props}>
      {children}
      {error && <FormMessage>{error}</FormMessage>}
    </div>
  );
};

// FormLabel
export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const FormLabel: React.FC<FormLabelProps> = ({
  children,
  required,
  className,
  ...props
}) => {
  return (
    <label
      className={cn("text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none", className)}
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  );
};

// FormMessage
export interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const FormMessage: React.FC<FormMessageProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p
      className={cn("text-[10px] font-medium text-destructive leading-none", className)}
      {...props}
    >
      {children}
    </p>
  );
};

// FormSection
export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("space-y-4 border-b border-border/60 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0", className)} {...props}>
      <div>
        <h4 className="text-xs font-bold text-foreground leading-none">{title}</h4>
        {description && <p className="text-[10px] text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="grid gap-4 w-full">{children}</div>
    </div>
  );
};
