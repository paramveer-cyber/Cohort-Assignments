"use client";

import { trpc } from "~/trpc/client";

export interface Form {
  id: string;
  title: string;
  status: string;
  responseCount: number | null;
  viewCount: number | null;
}

type FormListQueryOpts = Parameters<typeof trpc.forms.list.useQuery>[1];

export const useFormList = (opts?: FormListQueryOpts) => {
  const { data, isLoading, error, isError, isSuccess, refetch } = trpc.forms.list.useQuery(
    undefined,
    { staleTime: 10_000, ...opts },
  );

  const forms = data as Form[] | undefined;

  return { forms, isLoading, error, isError, isSuccess, refetch };
};
