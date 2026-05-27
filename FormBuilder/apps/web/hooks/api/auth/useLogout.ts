"use client";

import { trpc } from "~/trpc/client";

type LogoutMutationOpts = Parameters<typeof trpc.auth.logout.useMutation>[0];

export const useLogout = (opts?: LogoutMutationOpts) => {
  const {
    mutate: logout,
    mutateAsync: logoutAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.auth.logout.useMutation(opts);

  return { logout, logoutAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
