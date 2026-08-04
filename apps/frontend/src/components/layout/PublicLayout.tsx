import React from "react";
import { Outlet, Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#07060a] text-[#f3efe6] scroll-smooth">
      {/* Header - Sticky & Luxury Glassmorphism */}
      <header className="sticky top-0 z-50 glass-navbar shadow-[0_4px_30px_rgba(0,0,0,0.7)] shrink-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-90 transition-opacity focus-visible:outline-none"
            >
              {/* Brand Mark with Gold Gradient */}
              <div 
                className="w-[30px] h-[30px] rounded-lg flex items-center justify-center font-sans font-black text-sm text-[#1a1206]"
                style={{
                  background: "linear-gradient(135deg, #f3dfa0, #d4af37 60%, #8a6b1f)",
                  boxShadow: "0 4px 14px rgba(212, 175, 55, 0.35)",
                }}
              >
                A
              </div>
              <span className="font-serif text-[19px] tracking-[1.5px] text-[#f3dfa0]">
                Akira PM
              </span>
            </Link>
            
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                to="/features" 
                className="text-[13px] font-medium tracking-[1px] uppercase text-[#9a938a] hover:text-[#f3dfa0] transition-colors"
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className="text-[13px] font-medium tracking-[1px] uppercase text-[#9a938a] hover:text-[#f3dfa0] transition-colors"
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className="text-[13px] font-medium tracking-[1px] uppercase text-[#9a938a] hover:text-[#f3dfa0] transition-colors"
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-[13px] font-medium tracking-[1px] uppercase text-[#9a938a] hover:text-[#f3dfa0] transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-5">
              <Link
                to="/login"
                className="text-[13px] font-medium tracking-[1px] uppercase text-[#9a938a] hover:text-[#f3dfa0] transition-colors"
              >
                Log in
              </Link>
              <Link to="/register">
                {/* btn-gold style */}
                <button 
                  type="button"
                  className="px-6 py-2.5 text-[13px] font-bold tracking-[0.5px] rounded-full text-[#1a1206] cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-all"
                  style={{
                    background: "linear-gradient(135deg, #f3dfa0, #d4af37 60%, #8a6b1f)",
                    boxShadow: "0 8px 24px rgba(212, 175, 55, 0.25)"
                  }}
                >
                  Get started
                </button>
              </Link>
              <div className="h-4 w-px bg-white/10" />
              <ThemeToggle />
            </nav>
          </div>
        </div>

        {/* Mobile Navigation Links */}
        <div className="flex md:hidden items-center justify-around py-3 border-t border-white/5 bg-black/40 text-[10px] font-bold uppercase tracking-[1px] text-[#9a938a]">
          <Link to="/features" className="hover:text-[#f3dfa0] transition-colors">Features</Link>
          <Link to="/pricing" className="hover:text-[#f3dfa0] transition-colors">Pricing</Link>
          <Link to="/about" className="hover:text-[#f3dfa0] transition-colors">About</Link>
          <Link to="/contact" className="hover:text-[#f3dfa0] transition-colors">Contact</Link>
        </div>
      </header>

      {/* Main content viewport */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="glass-footer py-9 px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#9a938a] select-none">
        <span>© {new Date().getFullYear()} Akira PM. All rights reserved.</span>
        <span className="font-serif italic text-[#f3dfa0]">Project management, refined.</span>
        <div className="flex items-center gap-6 font-medium">
          <Link to="/features" className="hover:text-[#f3dfa0] transition-colors">Features</Link>
          <Link to="/pricing" className="hover:text-[#f3dfa0] transition-colors">Pricing</Link>
          <Link to="/about" className="hover:text-[#f3dfa0] transition-colors">About</Link>
          <Link to="/contact" className="hover:text-[#f3dfa0] transition-colors">Contact</Link>
          <div className="h-3 w-px bg-white/10" />
          <Link to="/terms" className="hover:text-[#f3dfa0] transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-[#f3dfa0] transition-colors">Privacy</Link>
        </div>
      </footer>
    </div>
  );
};
