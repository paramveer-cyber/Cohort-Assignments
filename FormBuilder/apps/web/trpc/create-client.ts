import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { env } from "~/env.js";
import { getToken, setToken, clearToken } from "~/lib/auth";

const API_URL = (env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000") + "/trpc";

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(API_URL + "/auth.refresh", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ json: null }),
    });
    if (!res.ok) return null;
    const raw = (await res.json()) as { result?: { data?: { accessToken?: string } } };
    return raw?.result?.data?.accessToken ?? null;
  } catch {
    return null;
  }
}

export async function tryRefresh(): Promise<boolean> {
  const token = await refreshAccessToken();
  if (!token) {
    clearToken();
    return false;
  }
  setToken(token);
  return true;
}

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  return c({
    url: API_URL,
    headers() {
      if (typeof window === "undefined") return {};
      const token = getToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    fetch(url, options) {
      return fetch(url, { ...options, credentials: "include" });
    },
  });
};
