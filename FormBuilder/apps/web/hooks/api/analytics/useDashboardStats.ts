"use client";

import { trpc } from "~/trpc/client";

export interface DashboardStats {
  totalForms: number;
  publishedForms: number;
  totalResponses: number;
  totalViews: number;
  forms: {
    id: string;
    title: string;
    status: string;
    responseCount: number | null;
    viewCount: number | null;
  }[];
}

type DashboardStatsQueryOpts = Parameters<typeof trpc.analytics.dashboard.useQuery>[1];

export const useDashboardStats = (opts?: DashboardStatsQueryOpts) => {
  const { data, isLoading, error, isError, isSuccess } = trpc.analytics.dashboard.useQuery(
    undefined,
    { staleTime: 30_000, ...opts },
  );

  const stats = data as DashboardStats | undefined;

  return { stats, isLoading, error, isError, isSuccess };
};
