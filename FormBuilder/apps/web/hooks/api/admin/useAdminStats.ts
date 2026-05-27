"use client";

import { trpc } from "~/trpc/client";

export interface AdminStats {
  totalUsers: number;
  totalForms: number;
  publishedForms: number;
  totalResponses: number;
}

type AdminStatsQueryOpts = Parameters<typeof trpc.admin.stats.useQuery>[1];

export const useAdminStats = (opts?: AdminStatsQueryOpts) => {
  const { data, isLoading, error, isError, isSuccess } = trpc.admin.stats.useQuery(undefined, {
    staleTime: 30_000,
    ...opts,
  });

  const stats = data as AdminStats | undefined;

  return { stats, isLoading, error, isError, isSuccess };
};
