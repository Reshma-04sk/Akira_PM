import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Terminal } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground select-none">
      {/* Header */}
      <header className="border-b border-border bg-card/15 backdrop-blur shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-sm tracking-wide hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <Terminal className="h-5 w-5 text-primary" />
            <span>Akira PM</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              to="/login"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Sign up
            </Link>
            <div className="h-4 w-px bg-border" />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main viewport */}
      <main className="flex-grow flex items-center justify-center p-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 bg-card/5 shrink-0 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Akira PM. Built with React 19 & Tailwind.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
