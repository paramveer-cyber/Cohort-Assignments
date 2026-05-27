"use client";

import { trpc } from "~/trpc/client";

type FormTemplatesQueryOpts = Parameters<typeof trpc.forms.listTemplates.useQuery>[1];

export const useFormTemplates = (opts?: FormTemplatesQueryOpts) => {
  const { data: templates, isLoading, error, isError, isSuccess } = trpc.forms.listTemplates.useQuery(
    undefined,
    { staleTime: 60_000, ...opts }
  );

  return { templates, isLoading, error, isError, isSuccess };
};
