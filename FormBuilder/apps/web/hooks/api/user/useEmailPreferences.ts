"use client";

import { trpc } from "~/trpc/client";

type EmailPreferencesQueryOpts = Parameters<typeof trpc.user.getEmailPreferences.useQuery>[1];

export const useEmailPreferences = (opts?: EmailPreferencesQueryOpts) => {
  const { data: prefs, isLoading, error, isError, isSuccess } = trpc.user.getEmailPreferences.useQuery(
    undefined,
    { staleTime: 30_000, ...opts }
  );

  return { prefs, isLoading, error, isError, isSuccess };
};
