"use client";

import { trpc } from "~/trpc/client";

type CreateFormMutationOpts = Parameters<typeof trpc.forms.create.useMutation>[0];

export const useCreateForm = (opts?: CreateFormMutationOpts) => {
  const {
    mutate: createForm,
    mutateAsync: createFormAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.forms.create.useMutation(opts);

  return { createForm, createFormAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
