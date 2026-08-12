import React from "react";
import { Outlet, Link } from "react-router-dom";

export const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0b] text-[#f3f1ec] antialiased font-sans select-none">
      {/* Header Navigation */}
      <header className="w-full border-b border-[#26262b] bg-[#0a0a0b] px-6 lg:px-16 py-6 flex items-center justify-between z-30">
        <Link to="/" className="font-semibold tracking-[2px] text-sm flex items-center gap-2.5 text-[#f3f1ec] focus:outline-none">
          <span className="w-2 h-2 rounded-full bg-[#ff4d2e]" />
          AKIRA PM
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link to="/" className="text-[#8b8a90] hover:text-[#f3f1ec] transition-colors">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Form Outlet Wrapper */}
      <main className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#26262b] px-6 lg:px-16 py-8 text-center text-xs text-[#8b8a90] font-mono">
        &copy; 2026 Akira PM. Work, in motion.
      </footer>
    </div>
  );
};

export default PublicLayout;
