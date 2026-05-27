"use client";

import { trpc } from "~/trpc/client";

type AdminDeleteUserMutationOpts = Parameters<typeof trpc.admin.deleteUser.useMutation>[0];

export const useAdminDeleteUser = (opts?: AdminDeleteUserMutationOpts) => {
  const {
    mutate: adminDeleteUser,
    mutateAsync: adminDeleteUserAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.admin.deleteUser.useMutation(opts);

  return { adminDeleteUser, adminDeleteUserAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
