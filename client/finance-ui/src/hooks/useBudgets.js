import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export const budgetKeys = { all: ["budgets"] };

export function useBudgets() {
  return useQuery({
    queryKey: budgetKeys.all,
    queryFn: async () => (await api.get("/budgets")).data.data,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) =>
      (await api.post("/budgets", payload)).data.data,
    onSuccess: () => qc.invalidateQueries({ queryKey: budgetKeys.all }),
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) =>
      (await api.patch(`/budgets/${id}`, payload)).data.data,
    onSuccess: () => qc.invalidateQueries({ queryKey: budgetKeys.all }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.delete(`/budgets/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: budgetKeys.all }),
  });
}
