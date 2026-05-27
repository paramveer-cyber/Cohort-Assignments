"use client";

import { trpc } from "~/trpc/client";

type AdminDeleteFormMutationOpts = Parameters<typeof trpc.admin.deleteForm.useMutation>[0];

export const useAdminDeleteForm = (opts?: AdminDeleteFormMutationOpts) => {
  const {
    mutate: adminDeleteForm,
    mutateAsync: adminDeleteFormAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.admin.deleteForm.useMutation(opts);

  return { adminDeleteForm, adminDeleteFormAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
