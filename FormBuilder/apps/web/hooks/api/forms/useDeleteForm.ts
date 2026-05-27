"use client";

import { trpc } from "~/trpc/client";

type DeleteFormMutationOpts = Parameters<typeof trpc.forms.delete.useMutation>[0];

export const useDeleteForm = (opts?: DeleteFormMutationOpts) => {
  const {
    mutate: deleteForm,
    mutateAsync: deleteFormAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.forms.delete.useMutation(opts);

  return { deleteForm, deleteFormAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
