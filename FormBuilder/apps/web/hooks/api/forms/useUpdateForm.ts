"use client";

import { trpc } from "~/trpc/client";

type UpdateFormMutationOpts = Parameters<typeof trpc.forms.update.useMutation>[0];

export const useUpdateForm = (opts?: UpdateFormMutationOpts) => {
  const {
    mutate: updateForm,
    mutateAsync: updateFormAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.forms.update.useMutation(opts);

  return { updateForm, updateFormAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
