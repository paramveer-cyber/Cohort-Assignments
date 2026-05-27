"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "~/lib/auth";
import { trpc } from "~/trpc/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const error = searchParams.get("error");

    if (error || !accessToken) {
      router.replace(`/login?error=${error ?? "unknown"}`);
      return;
    }

    setToken(accessToken);
    utils.auth.me.invalidate();
    router.replace("/dashboard");
  }, [searchParams, router, utils]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
      Signing you in...
    </div>
  );
}
