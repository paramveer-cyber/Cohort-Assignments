"use client";

import { trpc } from "~/trpc/client";

type LoginMutationOpts = Parameters<typeof trpc.auth.login.useMutation>[0];

export const useLogin = (opts?: LoginMutationOpts) => {
  const {
    mutate: login,
    mutateAsync: loginAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.auth.login.useMutation(opts);

  return { login, loginAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
