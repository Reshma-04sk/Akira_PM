import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Terminal } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground scroll-smooth">
      {/* Header - Sticky & Glassmorphism */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-sm tracking-wide hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <Terminal className="h-5 w-5 text-primary" />
              <span className="font-extrabold tracking-tight">Akira PM</span>
            </Link>
            
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/features" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link to="/pricing" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link to="/about" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 transition-all shadow-sm active:scale-[0.98]"
              >
                Sign up
              </Link>
              <div className="h-4 w-px bg-border" />
              <ThemeToggle />
            </nav>
          </div>
        </div>

        {/* Mobile Navigation Links (shows beneath title on small devices) */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-border/20 bg-card/10 text-[10px] font-bold text-muted-foreground">
          <Link to="/features" className="hover:text-foreground">Features</Link>
          <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
          <Link to="/about" className="hover:text-foreground">About</Link>
          <Link to="/contact" className="hover:text-foreground">Contact</Link>
        </div>
      </header>

      {/* Main content viewport */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card/5 shrink-0 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Akira PM. Built with React & Tailwind. All rights reserved.</span>
          <div className="flex items-center gap-6 font-medium">
            <Link to="/features" className="hover:text-foreground transition-colors">Features</Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <div className="h-3 w-px bg-border" />
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
