import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { PageTransition } from "../common/PageTransition";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const ProtectedLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Mobile sidebar overlay drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black md:hidden"
            />
            {/* Sidebar container */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 md:hidden"
            >
              <div className="relative h-full">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="absolute right-4 top-4 z-50 p-1.5 rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </button>
                <Sidebar
                  isCollapsed={false}
                  setIsCollapsed={() => {}}
                  className="w-full h-full border-r border-border"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        className="hidden md:flex"
      />

      {/* Main content wrapper */}
      <div className="flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar onMenuClick={() => setIsMobileOpen(!isMobileOpen)} />

        {/* Content viewport */}
        <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>

        {/* Footer placeholder */}
        <footer className="h-10 border-t border-border flex items-center justify-center text-[10px] text-muted-foreground shrink-0 bg-card/5 select-none">
          Akira PM &middot; General Workspace Panel
        </footer>
      </div>
    </div>
  );
};
