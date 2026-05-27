"use client";

import { trpc } from "~/trpc/client";

type DeleteAllResponsesMutationOpts = Parameters<typeof trpc.responses.deleteAll.useMutation>[0];

export const useDeleteAllResponses = (opts?: DeleteAllResponsesMutationOpts) => {
  const {
    mutate: deleteAllResponses,
    mutateAsync: deleteAllResponsesAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.responses.deleteAll.useMutation(opts);

  return { deleteAllResponses, deleteAllResponsesAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
