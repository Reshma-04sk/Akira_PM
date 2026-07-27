import React, { useState, useRef, useEffect } from "react";
import { LogOut, Settings, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm tracking-wider border border-primary/20 hover:ring-2 hover:ring-primary/25 transition-all focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="User profile menu"
      >
        JD
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 z-50 mt-1.5 w-56 bg-card border border-border rounded-lg shadow-lg py-1 text-sm overflow-hidden"
            role="menu"
          >
            <div className="px-3.5 py-2.5 border-b border-border">
              <p className="text-xs font-semibold text-foreground leading-none">John Doe</p>
              <p className="text-[10px] text-muted-foreground mt-1 truncate">john.doe@forgepm.com</p>
            </div>
            
            <div className="p-1 space-y-0.5">
              <button
                role="menuitem"
                onClick={() => {
                  console.log("Navigating to settings");
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors text-left"
              >
                <User className="h-3.5 w-3.5" />
                Profile Details
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  console.log("Navigating to workspaces");
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors text-left"
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </button>
            </div>

            <div className="border-t border-border p-1 mt-1">
              <button
                role="menuitem"
                onClick={() => {
                  console.log("User logging out");
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 rounded-md transition-colors text-left"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
