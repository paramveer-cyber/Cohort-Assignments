"use client";

import { trpc } from "~/trpc/client";

type CloneTemplateMutationOpts = Parameters<typeof trpc.forms.cloneTemplate.useMutation>[0];

export const useCloneTemplate = (opts?: CloneTemplateMutationOpts) => {
  const {
    mutate: cloneTemplate,
    mutateAsync: cloneTemplateAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.forms.cloneTemplate.useMutation(opts);

  return { cloneTemplate, cloneTemplateAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
