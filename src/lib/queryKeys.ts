export const queryKeys = {
  accounts: {
    all: ["accounts"] as const,
    list: () => ["accounts", "list"] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    list: (filters?: Record<string, unknown>) => ["transactions", "list", filters ?? {}] as const,
  },
  budgets: {
    all: ["budgets"] as const,
    list: () => ["budgets", "list"] as const,
  },
  goals: {
    all: ["goals"] as const,
    list: () => ["goals", "list"] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: () => ["categories", "list"] as const,
  },
  recurring: {
    all: ["recurring"] as const,
    list: () => ["recurring", "list"] as const,
  },
  analytics: {
    summary: (params: Record<string, unknown>) => ["analytics", "summary", params] as const,
    cashflow: (months: number) => ["analytics", "cashflow", months] as const,
    categories: (params: Record<string, unknown>) => ["analytics", "categories", params] as const,
    recent: (limit: number) => ["analytics", "recent", limit] as const,
  },
};
