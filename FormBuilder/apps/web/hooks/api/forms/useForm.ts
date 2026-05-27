"use client";

import { trpc } from "~/trpc/client";

type FormQueryInput = Parameters<typeof trpc.forms.get.useQuery>[0];
type FormQueryOpts = Parameters<typeof trpc.forms.get.useQuery>[1];

export const useForm = (input: FormQueryInput, opts?: FormQueryOpts) => {
  const { data: form, isLoading, error, isError, isSuccess, refetch } = trpc.forms.get.useQuery(
    input,
    { staleTime: 10_000, ...opts }
  );

  return { form, isLoading, error, isError, isSuccess, refetch };
};
