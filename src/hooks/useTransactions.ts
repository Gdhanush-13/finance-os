import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { TransactionsResponse, Transaction } from "@/types";

export const transactionKeys = {
  all: ["transactions"] as const,
  list: (params: Record<string, unknown>) => ["transactions", params] as const,
};

function invalidateAll(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: ["transactions"] });
  qc.invalidateQueries({ queryKey: ["analytics"] });
  qc.invalidateQueries({ queryKey: ["accounts"] });
  qc.invalidateQueries({ queryKey: ["budgets"] });
}

export function useTransactions(params: Record<string, unknown>) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: async () =>
      (await api.get("/transactions", { params })).data as TransactionsResponse,
    placeholderData: (prev: TransactionsResponse | undefined) => prev,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) =>
      (await api.post("/transactions", payload)).data.data as Transaction,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      (await api.patch(`/transactions/${id}`, payload)).data.data as Transaction,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/transactions/${id}`)).data,
    onSuccess: () => invalidateAll(qc),
  });
}
