"use client";

import { trpc } from "~/trpc/client";

type FormThemesQueryOpts = Parameters<typeof trpc.forms.listThemes.useQuery>[1];

export const useFormThemes = (opts?: FormThemesQueryOpts) => {
  const { data: themes, isLoading, error, isError, isSuccess } = trpc.forms.listThemes.useQuery(
    undefined,
    { staleTime: 60_000, ...opts }
  );

  return { themes, isLoading, error, isError, isSuccess };
};
