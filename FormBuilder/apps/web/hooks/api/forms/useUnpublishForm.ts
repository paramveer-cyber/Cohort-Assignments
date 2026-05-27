"use client";

import { trpc } from "~/trpc/client";

type UnpublishFormMutationOpts = Parameters<typeof trpc.forms.unpublish.useMutation>[0];

export const useUnpublishForm = (opts?: UnpublishFormMutationOpts) => {
  const {
    mutate: unpublishForm,
    mutateAsync: unpublishFormAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.forms.unpublish.useMutation(opts);

  return { unpublishForm, unpublishFormAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
