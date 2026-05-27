"use client";

import { trpc } from "~/trpc/client";

type CloneFormMutationOpts = Parameters<typeof trpc.forms.clone.useMutation>[0];

export const useCloneForm = (opts?: CloneFormMutationOpts) => {
  const {
    mutate: cloneForm,
    mutateAsync: cloneFormAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.forms.clone.useMutation(opts);

  return { cloneForm, cloneFormAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
