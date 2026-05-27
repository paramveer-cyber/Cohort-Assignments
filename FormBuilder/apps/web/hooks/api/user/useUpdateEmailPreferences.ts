"use client";

import { trpc } from "~/trpc/client";

type UpdateEmailPreferencesMutationOpts = Parameters<typeof trpc.user.updateEmailPreferences.useMutation>[0];

export const useUpdateEmailPreferences = (opts?: UpdateEmailPreferencesMutationOpts) => {
  const {
    mutate: updateEmailPreferences,
    mutateAsync: updateEmailPreferencesAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.user.updateEmailPreferences.useMutation(opts);

  return { updateEmailPreferences, updateEmailPreferencesAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
