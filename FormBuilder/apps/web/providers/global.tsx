"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState, useEffect, useRef } from "react";
import { Toaster } from "~/components/ui/sonner";
import { trpc } from "~/trpc/client";
import { createTRPCHttpBatchClientClient, tryRefresh } from "~/trpc/create-client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { env } from "~/env.js";
import { useLenis } from "~/hooks/use-lenis";
import { registerGsap } from "~/lib/gsap-utils";

function AppInit() {
  useLenis();
  useEffect(() => { registerGsap(); }, []);
  return null;
}

export const GlobalProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
  }));
  const [trpcClient] = useState(() =>
    trpc.createClient({ links: [createTRPCHttpBatchClientClient()] }),
  );
  const [refreshDone, setRefreshDone] = useState(false);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;
    tryRefresh().finally(() => setRefreshDone(true));
  }, []);

  return (
    <GoogleOAuthProvider clientId={env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}>
      <QueryClientProvider client={queryClient}>
        <trpc.Provider queryClient={queryClient} client={trpcClient}>
          <AppInit />
          {refreshDone ? children : (
            <div style={{
              minHeight: "100vh", display: "flex", alignItems: "center",
              justifyContent: "center", background: "#111",
              fontFamily: "var(--font-mc)", color: "#5aaa38",
              fontSize: "14px", letterSpacing: "0.1em",
            }}>
              Loading world...
            </div>
          )}
          <Toaster />
        </trpc.Provider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};
