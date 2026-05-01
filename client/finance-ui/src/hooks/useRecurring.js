import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export const recurringKeys = { all: ["recurring"] };

export function useRecurring() {
  return useQuery({
    queryKey: recurringKeys.all,
    queryFn: async () => (await api.get("/recurring")).data.data,
  });
}

export function useCreateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) =>
      (await api.post("/recurring", payload)).data.data,
    onSuccess: () => qc.invalidateQueries({ queryKey: recurringKeys.all }),
  });
}

export function useUpdateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) =>
      (await api.patch(`/recurring/${id}`, payload)).data.data,
    onSuccess: () => qc.invalidateQueries({ queryKey: recurringKeys.all }),
  });
}

export function useDeleteRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.delete(`/recurring/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: recurringKeys.all }),
  });
}

export function useRunRecurringNow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post("/recurring/run-now")).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recurring"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
