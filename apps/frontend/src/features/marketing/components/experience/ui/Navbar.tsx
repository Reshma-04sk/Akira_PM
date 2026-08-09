import React from "react";
import { Link } from "react-router-dom";
import AkiraLogo from "./AkiraLogo";

export const Navbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#07090d]/65 backdrop-blur-md border-b border-white/5 px-6 flex items-center justify-between transition-all duration-300">
      {/* 1. Brand Logo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 cursor-pointer focus:outline-none">
          <AkiraLogo className="h-5.5 w-auto" />
          <span className="text-sm font-semibold tracking-wider text-[#f4f7fa] uppercase">
            AKIRA
          </span>
        </Link>
      </div>

      {/* 2. Central Navigation Links */}
      <nav className="hidden md:flex items-center gap-8">
        <a 
          href="#features" 
          className="text-xs font-medium text-[#8b95a5] hover:text-[#f4f7fa] transition-colors focus:outline-none focus:text-[#f4f7fa]"
        >
          Features
        </a>
        <a 
          href="#product" 
          className="text-xs font-medium text-[#8b95a5] hover:text-[#f4f7fa] transition-colors focus:outline-none focus:text-[#f4f7fa]"
        >
          Product
        </a>
        <a 
          href="#pricing" 
          className="text-xs font-medium text-[#8b95a5] hover:text-[#f4f7fa] transition-colors focus:outline-none focus:text-[#f4f7fa]"
        >
          Pricing
        </a>
        <a 
          href="#about" 
          className="text-xs font-medium text-[#8b95a5] hover:text-[#f4f7fa] transition-colors focus:outline-none focus:text-[#f4f7fa]"
        >
          About
        </a>
      </nav>

      {/* 3. Action Buttons */}
      <div className="flex items-center gap-4">
        <Link 
          to="/login" 
          className="text-xs font-semibold text-[#8b95a5] hover:text-[#f4f7fa] transition-colors cursor-pointer focus:outline-none"
        >
          Sign In
        </Link>
        
        <Link 
          to="/register" 
          className="h-8.5 px-4 rounded-lg bg-[#7c8cff] hover:bg-[#6c7cfa] text-[#07090d] text-xs font-bold tracking-wide flex items-center justify-center transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7c8cff]/50"
        >
          Start Building
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
