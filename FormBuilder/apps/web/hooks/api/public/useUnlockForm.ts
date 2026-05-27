"use client";

import { trpc } from "~/trpc/client";

type UnlockFormMutationOpts = Parameters<typeof trpc.public.unlockForm.useMutation>[0];

export const useUnlockForm = (opts?: UnlockFormMutationOpts) => {
  const {
    mutate: unlockForm,
    mutateAsync: unlockFormAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.public.unlockForm.useMutation(opts);

  return { unlockForm, unlockFormAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
