import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export const transactionKeys = {
  all: ["transactions"],
  list: (params) => ["transactions", params],
};

function invalidateAll(qc) {
  qc.invalidateQueries({ queryKey: ["transactions"] });
  qc.invalidateQueries({ queryKey: ["analytics"] });
  qc.invalidateQueries({ queryKey: ["accounts"] });
  qc.invalidateQueries({ queryKey: ["budgets"] });
}

export function useTransactions(params) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: async () =>
      (await api.get("/transactions", { params })).data,
    keepPreviousData: true,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) =>
      (await api.post("/transactions", payload)).data.data,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) =>
      (await api.patch(`/transactions/${id}`, payload)).data.data,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.delete(`/transactions/${id}`)).data,
    onSuccess: () => invalidateAll(qc),
  });
}
