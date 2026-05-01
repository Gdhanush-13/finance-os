import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export const goalKeys = { all: ["goals"] };

export function useGoals() {
  return useQuery({
    queryKey: goalKeys.all,
    queryFn: async () => (await api.get("/goals")).data.data,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) =>
      (await api.post("/goals", payload)).data.data,
    onSuccess: () => qc.invalidateQueries({ queryKey: goalKeys.all }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) =>
      (await api.patch(`/goals/${id}`, payload)).data.data,
    onSuccess: () => qc.invalidateQueries({ queryKey: goalKeys.all }),
  });
}

export function useContributeGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount }) =>
      (await api.post(`/goals/${id}/contribute`, { amount })).data.data,
    onSuccess: () => qc.invalidateQueries({ queryKey: goalKeys.all }),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.delete(`/goals/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: goalKeys.all }),
  });
}
