"use client";

import { trpc } from "~/trpc/client";

type ResetPasswordMutationOpts = Parameters<typeof trpc.auth.resetPassword.useMutation>[0];

export const useResetPassword = (opts?: ResetPasswordMutationOpts) => {
  const {
    mutate: resetPassword,
    mutateAsync: resetPasswordAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.auth.resetPassword.useMutation(opts);

  return { resetPassword, resetPasswordAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
