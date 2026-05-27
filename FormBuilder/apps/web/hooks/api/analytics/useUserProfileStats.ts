"use client";

import { trpc } from "~/trpc/client";

export interface ResponseByDay {
  date: string;
  count: number;
}

export interface RecentActivityItem {
  formId: string;
  formTitle: string;
  responseCount: number;
  lastResponseAt: string | null;
}

export interface UserProfileStats {
  totalForms: number;
  publishedForms: number;
  totalResponses: number;
  totalViews: number;
  avgResponseRate: number;
  responsesByDay: ResponseByDay[];
  recentActivity: RecentActivityItem[];
}

type UserProfileStatsQueryOpts = Parameters<typeof trpc.analytics.userProfile.useQuery>[1];

export const useUserProfileStats = (opts?: UserProfileStatsQueryOpts) => {
  const { data, isLoading, error, isError, isSuccess } = trpc.analytics.userProfile.useQuery(
    undefined,
    { staleTime: 30_000, ...opts },
  );

  const stats = data as UserProfileStats | undefined;

  return { stats, isLoading, error, isError, isSuccess };
};
