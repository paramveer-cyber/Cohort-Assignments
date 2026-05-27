"use client";

import { trpc } from "~/trpc/client";

type PublishFormMutationOpts = Parameters<typeof trpc.forms.publish.useMutation>[0];

export const usePublishForm = (opts?: PublishFormMutationOpts) => {
  const {
    mutate: publishForm,
    mutateAsync: publishFormAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.forms.publish.useMutation(opts);

  return { publishForm, publishFormAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
