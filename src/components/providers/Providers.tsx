"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/auth/AuthContext";

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 5 * 60_000,
        gcTime: 10 * 60_000,
        refetchOnWindowFocus: false,
        refetchOnMount: "always",
      },
    },
  });

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster position="top-right" richColors />
        <AuthProvider>{children}</AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
