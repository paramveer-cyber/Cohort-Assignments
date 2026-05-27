"use client";

import { trpc } from "~/trpc/client";

type ForgotPasswordMutationOpts = Parameters<typeof trpc.auth.forgotPassword.useMutation>[0];

export const useForgotPassword = (opts?: ForgotPasswordMutationOpts) => {
  const {
    mutate: forgotPassword,
    mutateAsync: forgotPasswordAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.auth.forgotPassword.useMutation(opts);

  return { forgotPassword, forgotPasswordAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
