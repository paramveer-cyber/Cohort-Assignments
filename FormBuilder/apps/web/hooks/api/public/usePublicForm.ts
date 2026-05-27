"use client";

import { trpc } from "~/trpc/client";

type PublicFormQueryInput = Parameters<typeof trpc.public.getForm.useQuery>[0];
type PublicFormQueryOpts = Parameters<typeof trpc.public.getForm.useQuery>[1];

export const usePublicForm = (input: PublicFormQueryInput, opts?: PublicFormQueryOpts) => {
  const { data: form, isLoading, error, isError, isSuccess } = trpc.public.getForm.useQuery(
    input,
    { staleTime: 30_000, ...opts }
  );

  return { form, isLoading, error, isError, isSuccess };
};
