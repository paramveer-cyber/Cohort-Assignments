"use client";

import { trpc } from "~/trpc/client";

type ArchiveFormMutationOpts = Parameters<typeof trpc.forms.archive.useMutation>[0];

export const useArchiveForm = (opts?: ArchiveFormMutationOpts) => {
  const {
    mutate: archiveForm,
    mutateAsync: archiveFormAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.forms.archive.useMutation(opts);

  return { archiveForm, archiveFormAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
