import React from "react";
import { Outlet, Link } from "react-router-dom";
import { AkiraLogo } from "../../features/marketing/components/experience/ui/AkiraLogo";

export const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#07060a] text-[#f3efe6] scroll-smooth">
      {/* Header - Sticky & Luxury Glassmorphism without blocky drop shadows */}
      <header className="sticky top-0 z-50 glass-navbar shrink-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity focus-visible:outline-none"
            >
              {/* Brand Mark with Gold Gradient */}
              <AkiraLogo size={28} />
              <span className="font-serif text-[18px] tracking-[1.5px] text-[#f3dfa0] font-normal">
                Akira PM
              </span>
            </Link>
            
            {/* Desktop Navigation Links - Sentence Case, subtle opacity (Apple style) */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                to="/features" 
                className="text-[13.5px] font-medium text-white/60 hover:text-white transition-colors duration-200"
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className="text-[13.5px] font-medium text-white/60 hover:text-white transition-colors duration-200"
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className="text-[13.5px] font-medium text-white/60 hover:text-white transition-colors duration-200"
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-[13.5px] font-medium text-white/60 hover:text-white transition-colors duration-200"
              >
                Contact
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6">
              <Link
                to="/login"
                className="text-[13.5px] font-medium text-white/60 hover:text-white transition-colors duration-200"
              >
                Log in
              </Link>
              <Link to="/register">
                {/* Premium Gold Button with clean shadow glow */}
                <button 
                  type="button"
                  className="px-6 py-2.5 text-[13px] font-bold tracking-wide rounded-full text-[#1a1206] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                  style={{
                    background: "linear-gradient(135deg, #ffe9a0, #d4af37 60%, #8a6b1f)",
                    boxShadow: "0 4px 20px rgba(212, 175, 55, 0.2)"
                  }}
                >
                  Get started
                </button>
              </Link>
            </nav>
          </div>
        </div>

        {/* Mobile Navigation Links - Sleek glassmorphism positioning */}
        <div className="flex md:hidden items-center justify-around py-3.5 border-t border-white/5 bg-black/35 text-[11px] font-medium tracking-wide text-white/60 backdrop-blur-md">
          <Link to="/features" className="hover:text-white transition-colors">Features</Link>
          <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </header>

      {/* Main content viewport */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="glass-footer py-10 px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40 select-none border-t border-white/5">
        <span>© {new Date().getFullYear()} Akira PM. All rights reserved.</span>
        <span className="font-serif italic text-[#f3dfa0] text-[13px]">Project management, refined.</span>
        <div className="flex items-center gap-6 font-medium text-white/50">
          <Link to="/features" className="hover:text-white transition-colors">Features</Link>
          <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          <div className="h-3 w-px bg-white/10" />
          <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
