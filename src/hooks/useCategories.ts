import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Category } from "@/types";

export const categoryKeys = {
  all: ["categories"] as const,
  byKind: (kind: string) => ["categories", { kind }] as const,
};

export function useCategories(kind?: "income" | "expense") {
  return useQuery({
    queryKey: kind ? categoryKeys.byKind(kind) : categoryKeys.all,
    queryFn: async () =>
      (await api.get("/categories", { params: kind ? { kind } : {} })).data.data as Category[],
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Category>) =>
      (await api.post("/categories", payload)).data.data as Category,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Category> & { id: string }) =>
      (await api.patch(`/categories/${id}`, payload)).data.data as Category,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/categories/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}
