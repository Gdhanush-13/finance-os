import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  CashflowPoint,
  CategoryBreakdown,
  SummaryData,
  Transaction,
} from "@/types";

export const analyticsKeys = {
  summary: (params: Record<string, unknown>) => ["analytics", "summary", params] as const,
  cashflow: (months: number) => ["analytics", "cashflow", { months }] as const,
  categories: (params: Record<string, unknown>) => ["analytics", "categories", params] as const,
  recent: (limit: number) => ["analytics", "recent", { limit }] as const,
};

export function useSummary(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: analyticsKeys.summary(params),
    queryFn: async () =>
      (await api.get("/analytics/summary", { params })).data.data as SummaryData,
  });
}

export function useCashflow(months = 6) {
  return useQuery({
    queryKey: analyticsKeys.cashflow(months),
    queryFn: async () =>
      (await api.get("/analytics/cashflow", { params: { months } })).data.data as CashflowPoint[],
  });
}

export function useCategoryBreakdown(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: analyticsKeys.categories(params),
    queryFn: async () =>
      (await api.get("/analytics/categories", { params })).data.data as CategoryBreakdown[],
  });
}

export function useRecentTransactions(limit = 8) {
  return useQuery({
    queryKey: analyticsKeys.recent(limit),
    queryFn: async () =>
      (await api.get("/analytics/recent", { params: { limit } })).data.data as Transaction[],
  });
}

// Combined hook for analytics page
export function useAnalytics(params: Record<string, unknown> = {}) {
  const summary = useSummary(params);
  const cashflow = useCashflow(6);
  const categoryBreakdown = useCategoryBreakdown(params);
  
  return {
    summary: summary.data,
    cashflow: cashflow.data,
    categoryBreakdown: categoryBreakdown.data,
    isLoading: summary.isLoading || cashflow.isLoading || categoryBreakdown.isLoading,
    error: summary.error || cashflow.error || categoryBreakdown.error,
  };
}
