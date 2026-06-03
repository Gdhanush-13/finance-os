import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Account } from "@/types";

export const accountKeys = { all: ["accounts"] as const };

export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.all,
    queryFn: async () => (await api.get("/accounts")).data.data as Account[],
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Account>) =>
      (await api.post("/accounts", payload)).data.data as Account,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.all });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Account> & { id: string }) =>
      (await api.patch(`/accounts/${id}`, payload)).data.data as Account,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.all });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/accounts/${id}`)).data,
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: accountKeys.all });
      const snapshot = qc.getQueryData<Account[]>(accountKeys.all);
      qc.setQueryData<Account[]>(accountKeys.all, (old) =>
        old ? old.filter((a) => a._id !== id) : old
      );
      return { snapshot };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(accountKeys.all, ctx.snapshot);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: accountKeys.all });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
