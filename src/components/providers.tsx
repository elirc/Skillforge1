"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RewardToaster } from "@/components/reward-toaster";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applySystemTheme = () => {
      document.documentElement.classList.toggle("dark", mediaQuery.matches);
    };

    applySystemTheme();
    mediaQuery.addEventListener("change", applySystemTheme);
    return () => mediaQuery.removeEventListener("change", applySystemTheme);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <RewardToaster />
    </QueryClientProvider>
  );
}
