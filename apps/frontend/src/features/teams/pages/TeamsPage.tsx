import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Users, 
  Plus, 
  Trash2, 
  Settings, 
  UserPlus, 
  Shield, 
  Clock, 
  UserMinus,
  ChevronRight
} from "lucide-react";
import { useWorkspace } from "@/features/workspaces/context/WorkspaceContext";
import { useAuth } from "@/features/auth/auth-hooks";
import { workspacesApi } from "@/services/api/workspaces.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/data-display";
import { FormField, FormLabel } from "@/components/ui/form";
import { Dialog } from "@/components/ui/overlay";
import { Skeleton, toast } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

export const TeamsPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    workspaces, 
    activeWorkspace, 
    userRole, 
    isLoading: contextLoading,
    switchWorkspace, 
    createWorkspace,
    refetchWorkspaces
  } = useWorkspace();

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form Fields
  const [newWsName, setNewWsName] = useState("");
  const [newWsDesc, setNewWsDesc] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");

  const [editWsName, setEditWsName] = useState("");
  const [editWsDesc, setEditWsDesc] = useState("");

  // Load Workspace Members
  const { data: members = [], isLoading: membersLoading, refetch: refetchMembers } = useQuery({
    queryKey: ["workspaces", activeWorkspace?.id, "members"],
    queryFn: () => workspacesApi.getMembers(activeWorkspace!.id).then((res) => res.data),
    enabled: !!activeWorkspace,
  });

  // Check if current user is Workspace Owner/Admin
  const isOwner = userRole === "owner";
  const isAdminOrOwner = userRole === "owner" || userRole === "admin";

  // Mutations
  const editWorkspaceMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      workspacesApi.update(activeWorkspace!.id, payload),
    onSuccess: async () => {
      toast.success("Team Settings Updated", "Workspace details updated successfully.");
      setIsEditOpen(false);
      await refetchWorkspaces();
    },
    onError: (err: any) => {
      toast.error("Failed to update team settings", err.message || "An error occurred.");
    }
  });

  const deleteWorkspaceMutation = useMutation({
    mutationFn: () => workspacesApi.delete(activeWorkspace!.id),
    onSuccess: async () => {
      toast.success("Team Deleted", "Workspace has been deleted successfully.");
      setIsDeleteOpen(false);
      // Wait and reload to trigger fallback active workspace selection
      setTimeout(() => window.location.reload(), 150);
    },
    onError: (err: any) => {
      toast.error("Failed to delete team", err.message || "An error occurred.");
    }
  });

  const inviteMemberMutation = useMutation({
    mutationFn: (payload: { email: string; role: string }) =>
      workspacesApi.inviteMember(activeWorkspace!.id, payload),
    onSuccess: () => {
      toast.success("Invitation Sent", `${inviteEmail} has been added to the team.`);
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteRole("viewer");
      refetchMembers();
    },
    onError: (err: any) => {
      toast.error("Failed to invite member", err.message || "Make sure the user exists and is not already a member.");
    }
  });

  const updateMemberRoleMutation = useMutation({
    mutationFn: ({ targetUserId, role }: { targetUserId: string; role: string }) =>
      workspacesApi.updateMemberRole(activeWorkspace!.id, targetUserId, { role }),
    onSuccess: () => {
      toast.success("Role Updated", "Member permission level changed successfully.");
      refetchMembers();
    },
    onError: (err: any) => {
      toast.error("Failed to update role", err.message || "Only workspace owners can promote or modify owner roles.");
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      workspacesApi.removeMember(activeWorkspace!.id, targetUserId),
    onSuccess: () => {
      toast.success("Member Removed", "User has been removed from this workspace.");
      refetchMembers();
    },
    onError: (err: any) => {
      toast.error("Failed to remove member", err.message || "Only workspace owners or admins can perform this action.");
    }
  });

  // Action Triggers
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    await createWorkspace(newWsName.trim(), newWsDesc.trim() || undefined);
    setIsCreateOpen(false);
    setNewWsName("");
    setNewWsDesc("");
  };

  const handleEditWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWsName.trim()) return;
    editWorkspaceMutation.mutate({
      name: editWsName.trim(),
      description: editWsDesc.trim() || undefined,
    });
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteMemberMutation.mutate({
      email: inviteEmail.trim(),
      role: inviteRole,
    });
  };

  const openEditModal = () => {
    if (activeWorkspace) {
      setEditWsName(activeWorkspace.name);
      setEditWsDesc(activeWorkspace.description || "");
      setIsEditOpen(true);
    }
  };

  if (contextLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-4">
          <Skeleton className="h-72 col-span-1" />
          <Skeleton className="h-72 col-span-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Team Management</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Create workspaces, invite colleagues, and customize member authorization roles.
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={() => setIsCreateOpen(true)}
          className="h-8 text-xs gap-1.5 px-3 font-semibold cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Create Team
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4 items-start">
        {/* Workspace/Teams Left Menu */}
        <div className="md:col-span-1 space-y-3">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block px-1">Your Teams</span>
          <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto p-1 bg-card/45 border border-border/80 rounded-xl">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => switchWorkspace(ws.id)}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 text-xs rounded-lg transition-all text-left w-full cursor-pointer focus:outline-none shrink-0",
                  activeWorkspace?.id === ws.id
                    ? "bg-primary/10 border border-primary/20 text-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/20 border border-transparent"
                )}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="h-6 w-6 rounded-md bg-accent flex items-center justify-center font-bold text-[10px] text-foreground shrink-0 border border-border/60">
                    {ws.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="truncate pr-1">{ws.name}</span>
                </div>
                <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Workspace/Team Details Right Main Area */}
        <div className="md:col-span-3 space-y-6">
          {activeWorkspace ? (
            <>
              {/* Team Overview Card */}
              <Card className="border-border/80 bg-card/45 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/40">
                  <div>
                    <CardTitle className="text-sm font-extrabold">{activeWorkspace.name}</CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xl">
                      {activeWorkspace.description || "No description provided."}
                    </p>
                  </div>
                  {isAdminOrOwner && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openEditModal}
                        className="h-8 w-8 p-0 cursor-pointer border-border/60"
                        title="Edit Team Settings"
                      >
                        <Settings className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      </Button>
                      {isOwner && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsDeleteOpen(true)}
                          className="h-8 w-8 p-0 border-rose-500/20 hover:bg-rose-500/10 cursor-pointer group"
                          title="Delete Team Workspace"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-500/70 group-hover:text-rose-500" />
                        </Button>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-4 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 p-3.5 border border-border/40 bg-card/10 rounded-xl">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Users className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Members</span>
                      <span className="text-xs font-extrabold text-foreground leading-none mt-0.5">{members.length} Members</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3.5 border border-border/40 bg-card/10 rounded-xl">
                    <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                      <Clock className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Creation Date</span>
                      <span className="text-xs font-extrabold text-foreground leading-none mt-0.5">
                        {new Date(activeWorkspace.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Members Management Table */}
              <Card className="border-border/80 bg-card/45 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/40">
                  <CardTitle className="text-sm font-extrabold">Workspace Members</CardTitle>
                  {isAdminOrOwner && (
                    <Button
                      size="sm"
                      onClick={() => setIsInviteOpen(true)}
                      className="h-8 text-xs gap-1.5 px-3 font-semibold cursor-pointer"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Invite Member
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  {membersLoading ? (
                    <div className="p-6 space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border/40 bg-muted/20 text-muted-foreground font-bold uppercase text-[10px] tracking-wider">
                            <th className="py-3 px-4">Member Info</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Role level</th>
                            {isAdminOrOwner && <th className="py-3 px-4 text-right">Actions</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {members.map((member) => {
                            const isSelf = member.user_id === user?.id;
                            return (
                              <tr key={member.user_id} className="hover:bg-accent/10 transition-colors">
                                <td className="py-3 px-4 font-semibold text-foreground flex items-center gap-2.5">
                                  <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs text-primary shrink-0 select-none">
                                    {(member.full_name || member.email).slice(0, 1).toUpperCase()}
                                  </div>
                                  <span className="truncate">{member.full_name || "New Recruit"}</span>
                                  {isSelf && <span className="text-[9px] font-bold bg-primary/20 border border-primary/30 text-primary px-1.5 py-0.5 rounded-full select-none">You</span>}
                                </td>
                                <td className="py-3 px-4 text-muted-foreground font-mono">{member.email}</td>
                                <td className="py-3 px-4">
                                  {isAdminOrOwner && !isSelf && member.role !== "owner" ? (
                                    <select
                                      value={member.role}
                                      onChange={(e) => updateMemberRoleMutation.mutate({ targetUserId: member.user_id, role: e.target.value })}
                                      className="bg-background border border-border/60 hover:border-border rounded-lg text-xs py-1 px-2 text-foreground focus:outline-none transition-all cursor-pointer shadow-sm"
                                      disabled={updateMemberRoleMutation.isPending}
                                    >
                                      <option value="admin">Admin</option>
                                      <option value="manager">Manager</option>
                                      <option value="developer">Developer</option>
                                      <option value="viewer">Viewer</option>
                                    </select>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 font-semibold text-foreground px-2 py-1 rounded bg-accent/40 border border-border/40 text-[10px] uppercase">
                                      <Shield className="h-3 w-3 text-primary shrink-0" />
                                      {member.role}
                                    </span>
                                  )}
                                </td>
                                {isAdminOrOwner && (
                                  <td className="py-3 px-4 text-right">
                                    {!isSelf && member.role !== "owner" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeMemberMutation.mutate(member.user_id)}
                                        className="h-7 w-7 p-0 border-rose-500/10 hover:bg-rose-500/15 cursor-pointer text-rose-500 transition-colors"
                                        title="Remove Member from Workspace"
                                        isLoading={removeMemberMutation.isPending && removeMemberMutation.variables === member.user_id}
                                      >
                                        <UserMinus className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-2xl bg-card/10">
              <Users className="h-10 w-10 text-muted-foreground/60 mb-3" />
              <h3 className="text-xs font-bold text-foreground">No active team selected</h3>
              <p className="text-[10px] text-muted-foreground mt-1 mb-4 text-center max-w-xs">
                Select a team workspace from the side list panel or register a new custom workspace node.
              </p>
              <Button size="sm" onClick={() => setIsCreateOpen(true)} className="h-8 text-xs cursor-pointer">
                Create First Team
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* CREATE WORKSPACE MODAL */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Team Workspace">
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          <FormField>
            <FormLabel required>Team Name</FormLabel>
            <Input
              placeholder="e.g. Design Studio, Marketing, QA"
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              required
            />
          </FormField>
          <FormField>
            <FormLabel>Team Description</FormLabel>
            <Input
              placeholder="Short description highlighting workspace scope"
              value={newWsDesc}
              onChange={(e) => setNewWsDesc(e.target.value)}
            />
          </FormField>
          <div className="flex justify-end gap-2.5 pt-2 border-t border-border/40">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} className="h-8 text-xs cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-8 text-xs font-semibold cursor-pointer">
              Create Team
            </Button>
          </div>
        </form>
      </Dialog>

      {/* EDIT WORKSPACE MODAL */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Workspace Settings">
        <form onSubmit={handleEditWorkspace} className="space-y-4">
          <FormField>
            <FormLabel required>Team Workspace Name</FormLabel>
            <Input
              placeholder="Workspace name"
              value={editWsName}
              onChange={(e) => setEditWsName(e.target.value)}
              required
            />
          </FormField>
          <FormField>
            <FormLabel>Team Workspace Description</FormLabel>
            <Input
              placeholder="Workspace description"
              value={editWsDesc}
              onChange={(e) => setEditWsDesc(e.target.value)}
            />
          </FormField>
          <div className="flex justify-end gap-2.5 pt-2 border-t border-border/40">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)} className="h-8 text-xs cursor-pointer">
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm" 
              className="h-8 text-xs font-semibold cursor-pointer"
              isLoading={editWorkspaceMutation.isPending}
            >
              Update Settings
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DELETE WORKSPACE MODAL */}
      <Dialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Team Workspace">
        <div className="space-y-4">
          <div className="p-3 border border-rose-500/20 bg-rose-500/10 text-rose-600 rounded-lg text-xs leading-normal">
            <strong>Warning:</strong> Deleting this workspace is destructive and irreversible. All projects, tasks, attachments, and members belonging to this workspace will be deleted.
          </div>
          <p className="text-xs text-muted-foreground">
            Are you sure you want to delete workspace <strong>{activeWorkspace?.name}</strong>?
          </p>
          <div className="flex justify-end gap-2.5 pt-2 border-t border-border/40">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)} className="h-8 text-xs cursor-pointer">
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => deleteWorkspaceMutation.mutate()}
              className="h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white border-transparent hover:text-white cursor-pointer"
              isLoading={deleteWorkspaceMutation.isPending}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Dialog>

      {/* INVITE MEMBER MODAL */}
      <Dialog isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite Colleague to Workspace">
        <form onSubmit={handleInviteMember} className="space-y-4">
          <FormField>
            <FormLabel required>User Email Address</FormLabel>
            <Input
              type="email"
              placeholder="colleague@domain.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
          </FormField>
          <FormField>
            <FormLabel required>Workspace Role Level</FormLabel>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full bg-background border border-border/80 hover:border-border rounded-xl text-xs py-2 px-3 text-foreground focus:outline-none transition-all cursor-pointer shadow-sm"
            >
              <option value="admin">Admin (Modify team setup & invite members)</option>
              <option value="manager">Manager (Create projects & edit tasks)</option>
              <option value="developer">Developer (Collaborate, view comments & edit tasks)</option>
              <option value="viewer">Viewer (Read-only observation)</option>
            </select>
          </FormField>
          <div className="flex justify-end gap-2.5 pt-2 border-t border-border/40">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsInviteOpen(false)} className="h-8 text-xs cursor-pointer">
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm" 
              className="h-8 text-xs font-semibold cursor-pointer"
              isLoading={inviteMemberMutation.isPending}
            >
              Send Invitation
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
