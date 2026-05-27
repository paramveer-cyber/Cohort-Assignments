"use client";

import { trpc } from "~/trpc/client";

type FormStatsQueryInput = Parameters<typeof trpc.analytics.formStats.useQuery>[0];
type FormStatsQueryOpts = Parameters<typeof trpc.analytics.formStats.useQuery>[1];

export const useFormStats = (input: FormStatsQueryInput, opts?: FormStatsQueryOpts) => {
  const { data: stats, isLoading, error, isError, isSuccess } = trpc.analytics.formStats.useQuery(
    input,
    { staleTime: 30_000, ...opts }
  );

  return { stats, isLoading, error, isError, isSuccess };
};
