import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Checkbox
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, checked, ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer select-none">
        <input
          type="checkbox"
          checked={checked}
          className="sr-only peer"
          ref={ref}
          {...props}
        />
        <div className="h-4 w-4 rounded border border-border bg-background flex items-center justify-center transition-all peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-1 peer-focus-visible:ring-ring shrink-0">
          <Check className="h-3 w-3 text-primary-foreground stroke-[3] scale-0 transition-transform peer-checked:scale-100" />
        </div>
        {label && <span>{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

// Radio Group
interface RadioItem {
  value: string;
  label: string;
}

export interface RadioGroupProps {
  name: string;
  options: RadioItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)} role="radiogroup">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer select-none"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only peer"
          />
          <div className="h-4 w-4 rounded-full border border-border bg-background flex items-center justify-center transition-all peer-checked:border-primary peer-focus-visible:ring-1 peer-focus-visible:ring-ring shrink-0">
            <div className="h-2 w-2 rounded-full bg-primary scale-0 transition-transform peer-checked:scale-100" />
          </div>
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
};

// Switch
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, checked, ...props }, ref) => {
    return (
      <label className="flex items-center gap-3 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer select-none">
        <input
          type="checkbox"
          checked={checked}
          className="sr-only peer"
          ref={ref}
          {...props}
        />
        <div className="w-8 h-4 rounded-full bg-muted border border-border relative transition-colors peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-1 peer-focus-visible:ring-ring shrink-0">
          <div className="h-3 w-3 rounded-full bg-background absolute left-0.5 top-0.5 transition-transform peer-checked:translate-x-4 shadow-sm" />
        </div>
        {label && <span>{label}</span>}
      </label>
    );
  }
);
Switch.displayName = "Switch";

// Select
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            "appearance-none flex h-9 w-full rounded-lg border border-border bg-background pl-3 pr-10 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer",
            className
          )}
          ref={ref}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    );
  }
);
Select.displayName = "Select";

// MultiSelect (placeholder interface)
export interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
}) => {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1.5 p-1.5 border border-border bg-background rounded-lg min-h-[36px] items-center">
        {selected.length === 0 ? (
          <span className="text-xs text-muted-foreground px-2">{placeholder}</span>
        ) : (
          selected.map((val) => {
            const label = options.find((opt) => opt.value === val)?.label || val;
            return (
              <span
                key={val}
                className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-[10px] font-semibold text-foreground border border-border select-none"
              >
                {label}
                <button
                  type="button"
                  onClick={() => handleToggle(val)}
                  className="hover:text-destructive text-muted-foreground focus:outline-none"
                >
                  &times;
                </button>
              </span>
            );
          })
        )}
      </div>
    </div>
  );
};
