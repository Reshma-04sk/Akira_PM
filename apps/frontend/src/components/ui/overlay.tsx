import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Dialog Component
export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  // Keybind accessibility: Escape key closes Dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "relative bg-card border border-border rounded-xl shadow-lg w-full max-w-md p-6 overflow-hidden text-sm",
              className
            )}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-2">
              {title && <h3 className="font-bold text-foreground text-sm tracking-tight">{title}</h3>}
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Drawer Component
export interface DrawerProps extends DialogProps {
  position?: "left" | "right" | "bottom";
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  position = "right",
  children,
  className,
}) => {
  const directions = {
    left: { x: "-100%" },
    right: { x: "100%" },
    bottom: { y: "100%" },
  }[position];

  const positioning = {
    left: "left-0 inset-y-0 w-80 max-w-[calc(100vw-3rem)]",
    right: "right-0 inset-y-0 w-80 max-w-[calc(100vw-3rem)]",
    bottom: "bottom-0 inset-x-0 h-96 max-h-[80vh]",
  }[position];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black"
          />

          {/* Panel */}
          <motion.div
            initial={directions}
            animate={{ x: 0, y: 0 }}
            exit={directions}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "absolute bg-card border-border flex flex-col p-6 shadow-xl",
              position === "left" && "border-r",
              position === "right" && "border-l",
              position === "bottom" && "border-t rounded-t-xl",
              positioning,
              className
            )}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-2">
              {title && <h3 className="font-bold text-foreground text-sm tracking-tight">{title}</h3>}
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label="Close drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Dropdown Menu Item
interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  destructive?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = "right",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className={cn(
              "absolute z-50 mt-1.5 w-48 bg-card border border-border rounded-lg shadow-lg py-1 text-xs overflow-hidden",
              align === "right" ? "right-0" : "left-0",
              className
            )}
            role="menu"
          >
            {items.map((item, idx) => (
              <button
                key={idx}
                role="menuitem"
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3.5 py-2 text-left hover:bg-accent transition-colors",
                  item.destructive ? "text-destructive hover:bg-destructive/10" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.icon && <item.icon className="h-3.5 w-3.5 shrink-0" />}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Popover Component
export interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({ trigger, children, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">{trigger}</div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className={cn("absolute z-50 mt-1.5 p-4 bg-card border border-border rounded-lg shadow-lg text-xs w-64", className)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Tooltip Component
export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className={cn(
              "absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[10px] font-bold text-background bg-foreground rounded pointer-events-none z-50 whitespace-nowrap",
              className
            )}
            role="tooltip"
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};
