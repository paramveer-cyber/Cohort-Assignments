"use client";

import { trpc } from "~/trpc/client";

type DeleteAccountMutationOpts = Parameters<typeof trpc.auth.deleteAccount.useMutation>[0];

export const useDeleteAccount = (opts?: DeleteAccountMutationOpts) => {
  const {
    mutate,
    mutateAsync: deleteAccountAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.auth.deleteAccount.useMutation(opts);

  const deleteAccount = () => mutate(undefined as never);

  return {
    deleteAccount,
    deleteAccountAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  };
};
