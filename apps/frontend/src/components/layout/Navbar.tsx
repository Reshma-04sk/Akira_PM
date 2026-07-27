import React from "react";
import { Menu } from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";
import { SearchInput } from "./SearchInput";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationButton } from "./NotificationButton";
import { ProfileDropdown } from "./ProfileDropdown";

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  return (
    <header className="h-16 border-b border-border bg-card/15 backdrop-blur flex items-center justify-between px-4 sm:px-6 select-none shrink-0">
      {/* Left side: Mobile drawer trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg border border-border bg-card/30 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus:outline-none focus:ring-1 focus:ring-ring md:hidden"
          aria-label="Toggle Navigation Drawer"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right side: Search, Theme Toggle, Notification, Profile */}
      <div className="flex items-center gap-4">
        <div className="hidden md:block">
          <SearchInput />
        </div>
        <ThemeToggle />
        <NotificationButton />
        <div className="h-8 w-px bg-border shrink-0" />
        <ProfileDropdown />
      </div>
    </header>
  );
};
