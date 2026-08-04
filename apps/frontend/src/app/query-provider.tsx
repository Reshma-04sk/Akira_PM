import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type QueryProviderProps = {
  children: React.ReactNode;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30 * 1000, // 30 seconds for responsive, real-time feel
    },
  },
});

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
