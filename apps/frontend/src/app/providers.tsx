import React from "react";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "@/features/auth/auth-provider";
import { Toaster } from "sonner";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="system" storageKey="forgepm-ui-theme">
        <AuthProvider>
          {children}
          <Toaster closeButton position="top-right" richColors />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
