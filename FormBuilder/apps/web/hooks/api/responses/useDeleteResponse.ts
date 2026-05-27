"use client";

import { trpc } from "~/trpc/client";

type DeleteResponseMutationOpts = Parameters<typeof trpc.responses.deleteOne.useMutation>[0];

export const useDeleteResponse = (opts?: DeleteResponseMutationOpts) => {
  const {
    mutate: deleteResponse,
    mutateAsync: deleteResponseAsync,
    isPending,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
    failureCount,
  } = trpc.responses.deleteOne.useMutation(opts);

  return { deleteResponse, deleteResponseAsync, isPending, error, isError, isIdle, isSuccess, status, failureCount };
};
