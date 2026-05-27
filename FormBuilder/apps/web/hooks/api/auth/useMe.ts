"use client";

import { trpc } from "~/trpc/client";

export interface Me {
  id: string;
  name: string;
  email: string;
  role: string | undefined;
  avatarUrl: string | null;
}

type MeQueryOpts = Parameters<typeof trpc.auth.me.useQuery>[1];

export const useMe = (opts?: MeQueryOpts) => {
  const { data, isLoading, error, isError, isSuccess, refetch } = trpc.auth.me.useQuery(undefined, {
    staleTime: 30_000,
    ...opts,
  });

  const user = data as Me | undefined;

  return { user, isLoading, error, isError, isSuccess, refetch };
};
