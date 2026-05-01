import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export const analyticsKeys = {
  summary: (params) => ["analytics", "summary", params],
  cashflow: (months) => ["analytics", "cashflow", { months }],
  categories: (params) => ["analytics", "categories", params],
  recent: (limit) => ["analytics", "recent", { limit }],
};

export function useSummary(params = {}) {
  return useQuery({
    queryKey: analyticsKeys.summary(params),
    queryFn: async () => (await api.get("/analytics/summary", { params })).data.data,
  });
}

export function useCashflow(months = 6) {
  return useQuery({
    queryKey: analyticsKeys.cashflow(months),
    queryFn: async () =>
      (await api.get("/analytics/cashflow", { params: { months } })).data.data,
  });
}

export function useCategoryBreakdown(params = {}) {
  return useQuery({
    queryKey: analyticsKeys.categories(params),
    queryFn: async () =>
      (await api.get("/analytics/categories", { params })).data.data,
  });
}

export function useRecentTransactions(limit = 8) {
  return useQuery({
    queryKey: analyticsKeys.recent(limit),
    queryFn: async () =>
      (await api.get("/analytics/recent", { params: { limit } })).data.data,
  });
}
