import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Plus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/feedback";

interface Workspace {
  id: string;
  name: string;
  plan: string;
}

const mockWorkspaces: Workspace[] = [
  { id: "1", name: "Akira PM Design", plan: "Pro Plan" },
  { id: "2", name: "Personal Work", plan: "Free Plan" },
];

export const WorkspaceSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Workspace>(mockWorkspaces[0]);
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

  // Keyboard accessibility: Close on escape
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
        aria-haspopup="listbox"
        className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-[#d4af37]/15 bg-black/45 hover:bg-[#d4af37]/5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="h-6 w-6 rounded bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center font-bold text-xs shrink-0">
            {selected.name.charAt(0)}
          </div>
          <div className="flex flex-col overflow-hidden leading-none gap-0.5">
            <span className="truncate text-foreground font-semibold text-xs tracking-wide">
              {selected.name}
            </span>
            <span className="text-[10px] text-muted-foreground truncate font-normal">
              {selected.plan}
            </span>
          </div>
        </div>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>
 
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute left-0 z-50 mt-1 w-56 bg-black border border-[#d4af37]/20 rounded-lg shadow-2xl py-1 text-sm overflow-hidden backdrop-blur-xl"
            role="listbox"
          >
            <div className="px-3 py-1.5 text-xs font-medium text-[#d4af37]/75 border-b border-border mb-1">
              Workspaces
            </div>
            {mockWorkspaces.map((workspace) => (
              <button
                key={workspace.id}
                role="option"
                aria-selected={selected.id === workspace.id}
                onClick={() => {
                  setSelected(workspace);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#d4af37]/10 hover:text-[#d4af37] transition-colors ${
                  selected.id === workspace.id ? "bg-[#d4af37]/5 font-semibold text-[#d4af37]" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center font-bold text-[10px]">
                    {workspace.name.charAt(0)}
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-xs text-foreground">{workspace.name}</span>
                    <span className="text-[9px] text-muted-foreground mt-0.5">{workspace.plan}</span>
                  </div>
                </div>
                {selected.id === workspace.id && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </button>
            ))}
            <div className="border-t border-border mt-1 pt-1">
              <button
                onClick={() => toast.info("Coming soon", "Workspace creation will be available in the next release.")}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Workspace
              </button>
              <button
                onClick={() => toast.info("Feature preview", "Upgrade plan to Pro is in test mode.")}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Upgrade to Pro
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
