import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export const categoryKeys = {
  all: ["categories"],
  byKind: (kind) => ["categories", { kind }],
};

export function useCategories(kind) {
  return useQuery({
    queryKey: kind ? categoryKeys.byKind(kind) : categoryKeys.all,
    queryFn: async () =>
      (await api.get("/categories", { params: kind ? { kind } : {} })).data.data,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) =>
      (await api.post("/categories", payload)).data.data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) =>
      (await api.patch(`/categories/${id}`, payload)).data.data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.delete(`/categories/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}
