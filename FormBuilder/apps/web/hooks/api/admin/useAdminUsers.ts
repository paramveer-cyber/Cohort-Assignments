"use client";

import { trpc } from "~/trpc/client";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: string | null;
}

type AdminUsersQueryOpts = Parameters<typeof trpc.admin.listUsers.useQuery>[1];

export const useAdminUsers = (opts?: AdminUsersQueryOpts) => {
  const { data, isLoading, error, isError, isSuccess, refetch } = trpc.admin.listUsers.useQuery(
    undefined,
    { staleTime: 10_000, ...opts },
  );

  const users = data as AdminUser[] | undefined;

  return { users, isLoading, error, isError, isSuccess, refetch };
};
