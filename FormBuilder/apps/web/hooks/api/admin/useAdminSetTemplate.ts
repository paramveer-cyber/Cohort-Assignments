"use client";

import { trpc } from "~/trpc/client";

type AdminSetTemplateMutationOpts = Parameters<typeof trpc.admin.setTemplate.useMutation>[0];

export const useAdminSetTemplate = (opts?: AdminSetTemplateMutationOpts) => {
  const {
    mutate: adminSetTemplate,
    mutateAsync: adminSetTemplateAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.admin.setTemplate.useMutation(opts);

  return { adminSetTemplate, adminSetTemplateAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
