"use client";

import { trpc } from "~/trpc/client";

type SubmitFormMutationOpts = Parameters<typeof trpc.public.submitForm.useMutation>[0];

export const useSubmitForm = (opts?: SubmitFormMutationOpts) => {
  const {
    mutate: submitForm,
    mutateAsync: submitFormAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.public.submitForm.useMutation(opts);

  return { submitForm, submitFormAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
