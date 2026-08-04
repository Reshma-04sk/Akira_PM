import React, { useState } from "react";
import { Menu, UserPlus, Mail, Shield } from "lucide-react";
import { useWorkspace } from "@/features/workspaces/context/WorkspaceContext";
import { workspacesApi } from "@/services/api/workspaces.api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { SearchInput } from "./SearchInput";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationButton } from "./NotificationButton";
import { ProfileDropdown } from "./ProfileDropdown";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/overlay";
import { FormField, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { activeWorkspace } = useWorkspace();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");

  const inviteMutation = useMutation({
    mutationFn: (payload: { email: string; role: string }) =>
      workspacesApi.inviteMember(activeWorkspace!.id, payload),
    onSuccess: () => {
      toast.success(`Invitation sent successfully to ${inviteEmail}`);
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteRole("viewer");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to invite member to workspace.");
    }
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeWorkspace) return;
    inviteMutation.mutate({
      email: inviteEmail.trim(),
      role: inviteRole,
    });
  };

  return (
    <>
      <header className="h-16 glass-navbar flex items-center justify-between px-4 sm:px-6 select-none shrink-0 z-30">
        {/* Left side: Mobile trigger & Workspace Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg border border-white/5 bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-[#d4af37] md:hidden"
            aria-label="Toggle Navigation Drawer"
          >
            <Menu className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-2">
            <WorkspaceSwitcher />
          </div>
        </div>

        {/* Right side: Search, Invite, Theme Toggle, Notification, Profile */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block w-48 lg:w-60">
            <SearchInput />
          </div>
          
          {activeWorkspace && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsInviteOpen(true)}
              className="h-8 text-[10px] gap-1.5 px-3 font-bold border-white/5 hover:border-[#d4af37]/30 text-white cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Invite
            </Button>
          )}

          <ThemeToggle />
          <NotificationButton />
          
          <div className="h-7 w-px bg-white/10 shrink-0" />
          <ProfileDropdown />
        </div>
      </header>

      {/* Invite Member dialog */}
      <Dialog 
        isOpen={isInviteOpen} 
        onClose={() => setIsInviteOpen(false)} 
        title={`Invite to ${activeWorkspace?.name || "Workspace"}`}
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
          <FormField>
            <FormLabel required>Colleague Email Address</FormLabel>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="colleague@domain.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                className="pl-9 h-9"
                disabled={inviteMutation.isPending}
              />
            </div>
          </FormField>

          <FormField>
            <FormLabel required>Access Permissions Role</FormLabel>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                disabled={inviteMutation.isPending}
                className="w-full pl-9 bg-[#050505] border border-white/10 hover:border-white/20 rounded-xl text-xs py-2 px-3 text-foreground focus:outline-none transition-all cursor-pointer shadow-sm focus:ring-1 focus:ring-[#d4af37]"
              >
                <option value="admin">Admin (Full write, workspace control)</option>
                <option value="manager">Manager (Create projects & edit tasks)</option>
                <option value="developer">Developer (Collaborate & edit tasks)</option>
                <option value="viewer">Viewer (Read-only observation)</option>
              </select>
            </div>
          </FormField>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/5 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setIsInviteOpen(false)} 
              className="h-8 text-[11px]"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm" 
              className="h-8 text-[11px] font-bold" 
              isLoading={inviteMutation.isPending}
            >
              Send Invitation
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
};
