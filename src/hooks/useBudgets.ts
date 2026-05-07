import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Budget } from "@/types";

export const budgetKeys = { all: ["budgets"] as const };

export function useBudgets() {
  return useQuery({
    queryKey: budgetKeys.all,
    queryFn: async () => (await api.get("/budgets")).data.data as Budget[],
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) =>
      (await api.post("/budgets", payload)).data.data as Budget,
    onSuccess: () => qc.invalidateQueries({ queryKey: budgetKeys.all }),
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      (await api.patch(`/budgets/${id}`, payload)).data.data as Budget,
    onSuccess: () => qc.invalidateQueries({ queryKey: budgetKeys.all }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/budgets/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: budgetKeys.all }),
  });
}
