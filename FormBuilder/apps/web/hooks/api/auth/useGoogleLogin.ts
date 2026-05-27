"use client";

import { trpc } from "~/trpc/client";

type GoogleLoginMutationOpts = Parameters<typeof trpc.auth.googleLogin.useMutation>[0];

export const useGoogleLogin = (opts?: GoogleLoginMutationOpts) => {
  const {
    mutate: googleLogin,
    mutateAsync: googleLoginAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.auth.googleLogin.useMutation(opts);

  return { googleLogin, googleLoginAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
