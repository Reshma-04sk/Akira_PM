import React from "react";
import { Link } from "react-router-dom";

export const Navbar: React.FC = () => {
  return (
    <nav className="w-full flex items-center justify-between px-6 lg:px-16 py-6 relative z-30 border-b border-[#26262b] bg-[#0a0a0b] select-none">
      {/* Brand Logo */}
      <Link to="/" className="font-semibold tracking-[2px] text-sm flex items-center gap-2.5 text-[#f3f1ec] focus:outline-none">
        <span className="w-2 h-2 rounded-full bg-[#ff4d2e]" />
        AKIRA
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-9 text-sm text-[#8b8a90]">
        <a href="#board" className="hover:text-[#f3f1ec] transition-colors">Product</a>
        <a href="#analytics" className="hover:text-[#f3f1ec] transition-colors">Analytics</a>
        <a href="#ai" className="hover:text-[#f3f1ec] transition-colors">AI</a>
        <a href="#cmd" className="hover:text-[#f3f1ec] transition-colors">Command</a>
        <a href="#pricing" className="hover:text-[#f3f1ec] transition-colors">Pricing</a>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-5 text-sm">
        <Link to="/login" className="text-[#8b8a90] hover:text-[#f3f1ec] transition-colors">
          Sign in
        </Link>
        <Link
          to="/register"
          className="bg-[#f3f1ec] text-[#0a0a0b] hover:bg-[#ff4d2e] hover:text-[#1a0a06] px-5 py-2.5 rounded-md font-semibold text-sm transition-all active:scale-97 cursor-pointer"
        >
          Start building
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
