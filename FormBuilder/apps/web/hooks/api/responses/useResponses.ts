"use client";

import { trpc } from "~/trpc/client";

type ResponsesQueryInput = Parameters<typeof trpc.responses.list.useQuery>[0];
type ResponsesQueryOpts = Parameters<typeof trpc.responses.list.useQuery>[1];

export const useResponses = (input: ResponsesQueryInput, opts?: ResponsesQueryOpts) => {
  const { data: responses, isLoading, error, isError, isSuccess, refetch } = trpc.responses.list.useQuery(
    input,
    { staleTime: 10_000, ...opts }
  );

  return { responses, isLoading, error, isError, isSuccess, refetch };
};
