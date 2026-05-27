"use client";

import { trpc } from "~/trpc/client";

type ExploreFormsQueryInput = Parameters<typeof trpc.public.exploreForms.useQuery>[0];
type ExploreFormsQueryOpts = Parameters<typeof trpc.public.exploreForms.useQuery>[1];

export const useExploreForms = (input: ExploreFormsQueryInput, opts?: ExploreFormsQueryOpts) => {
  const { data: forms, isLoading, error, isError, isSuccess } = trpc.public.exploreForms.useQuery(
    input,
    { staleTime: 30_000, ...opts }
  );

  return { forms, isLoading, error, isError, isSuccess };
};
