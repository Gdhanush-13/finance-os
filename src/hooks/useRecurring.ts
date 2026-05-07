import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { RecurringRule } from "@/types";

export const recurringKeys = { all: ["recurring"] as const };

export function useRecurring() {
  return useQuery({
    queryKey: recurringKeys.all,
    queryFn: async () => (await api.get("/recurring")).data.data as RecurringRule[],
  });
}

export function useCreateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) =>
      (await api.post("/recurring", payload)).data.data as RecurringRule,
    onSuccess: () => qc.invalidateQueries({ queryKey: recurringKeys.all }),
  });
}

export function useUpdateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      (await api.patch(`/recurring/${id}`, payload)).data.data as RecurringRule,
    onSuccess: () => qc.invalidateQueries({ queryKey: recurringKeys.all }),
  });
}

export function useDeleteRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/recurring/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: recurringKeys.all }),
  });
}

export function useRunRecurringNow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post("/recurring/run-now")).data.data as { transactionsCreated?: number },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recurring"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
