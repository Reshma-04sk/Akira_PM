import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/features/auth/auth-hooks";
import { workspacesApi, Workspace } from "@/services/api/workspaces.api";
import { toast } from "sonner";

interface WorkspaceContextProps {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  userRole: string | null;
  isLoading: boolean;
  switchWorkspace: (id: string) => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<Workspace | null>;
  refetchWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, status } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWorkspacesList = async () => {
    if (status !== "Authenticated" || !user) return;
    setIsLoading(true);
    try {
      const res = await workspacesApi.list();
      const list: Workspace[] = Array.isArray(res.data) 
        ? res.data 
        : ((res.data as any)?.items ? (res.data as any).items : []);
      setWorkspaces(list);

      if (list.length > 0) {
        // Resolve active workspace from localStorage or default to first
        const storedId = localStorage.getItem("akira_active_workspace_id");
        const found = list.find((w) => w.id === storedId) || list[0];
        setActiveWorkspace(found);
        localStorage.setItem("akira_active_workspace_id", found.id);
      } else {
        setActiveWorkspace(null);
        setUserRole(null);
      }
    } catch (err: any) {
      console.error("Failed to load workspaces:", err);
      toast.error("Failed to load workspaces");
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch when authenticated user changes
  useEffect(() => {
    if (status === "Authenticated" && user) {
      fetchWorkspacesList();
    } else {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setUserRole(null);
    }
  }, [status, user]);

  // Fetch role when activeWorkspace changes
  useEffect(() => {
    const fetchRole = async () => {
      if (!activeWorkspace || !user) return;
      try {
        const res = await workspacesApi.getMembers(activeWorkspace.id);
        const me = res.data.find((m) => m.user_id === user.id);
        if (me) {
          setUserRole(me.role);
        } else {
          setUserRole(null);
        }
      } catch (err) {
        console.error("Failed to resolve workspace role:", err);
        setUserRole(null);
      }
    };
    fetchRole();
  }, [activeWorkspace, user]);

  const switchWorkspace = async (id: string) => {
    const found = workspaces.find((w) => w.id === id);
    if (found) {
      setActiveWorkspace(found);
      localStorage.setItem("akira_active_workspace_id", id);
      toast.success(`Switched to workspace: ${found.name}`);
      // Refresh page content by triggering full refetch or location reload
      setTimeout(() => window.location.reload(), 150);
    }
  };

  const createWorkspace = async (name: string, description?: string) => {
    try {
      const res = await workspacesApi.create({ name, description });
      const newWs = res.data;
      toast.success("Workspace created successfully");
      await fetchWorkspacesList();
      await switchWorkspace(newWs.id);
      return newWs;
    } catch (err: any) {
      toast.error(err.message || "Failed to create workspace");
      return null;
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        userRole,
        isLoading,
        switchWorkspace,
        createWorkspace,
        refetchWorkspaces: fetchWorkspacesList,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
