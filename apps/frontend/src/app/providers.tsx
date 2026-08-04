import React from "react";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "@/features/auth/auth-provider";
import { WorkspaceProvider } from "@/features/workspaces/context/WorkspaceContext";
import { AIProvider } from "@/context/AIContext";
import { Toaster } from "sonner";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="system" storageKey="forgepm-ui-theme">
        <AuthProvider>
          <WorkspaceProvider>
            <AIProvider>
              {children}
              <Toaster closeButton position="top-right" richColors />
            </AIProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
