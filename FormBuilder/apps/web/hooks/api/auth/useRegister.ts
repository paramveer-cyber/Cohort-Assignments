"use client";

import { trpc } from "~/trpc/client";

type RegisterMutationOpts = Parameters<typeof trpc.auth.register.useMutation>[0];

export const useRegister = (opts?: RegisterMutationOpts) => {
  const {
    mutate: register,
    mutateAsync: registerAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.auth.register.useMutation(opts);

  return { register, registerAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
