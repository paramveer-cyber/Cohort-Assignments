"use client";

import { trpc } from "~/trpc/client";

export interface AdminForm {
  id: string;
  title: string;
  slug: string | null;
  status: string;
  responseCount: number | null;
  isTemplate: boolean | null;
}

type AdminFormsQueryOpts = Parameters<typeof trpc.admin.listForms.useQuery>[1];

export const useAdminForms = (opts?: AdminFormsQueryOpts) => {
  const { data, isLoading, error, isError, isSuccess, refetch } = trpc.admin.listForms.useQuery(
    undefined,
    { staleTime: 10_000, ...opts },
  );

  const forms = data as AdminForm[] | undefined;

  return { forms, isLoading, error, isError, isSuccess, refetch };
};
