"use client";

import { trpc } from "~/trpc/client";

type UpdateFormFieldsMutationOpts = Parameters<typeof trpc.forms.updateFields.useMutation>[0];

export const useUpdateFormFields = (opts?: UpdateFormFieldsMutationOpts) => {
  const {
    mutate: updateFormFields,
    mutateAsync: updateFormFieldsAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.forms.updateFields.useMutation(opts);

  return { updateFormFields, updateFormFieldsAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
