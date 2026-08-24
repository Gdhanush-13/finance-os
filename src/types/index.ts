export interface User {
  _id: string;
  name: string;
  email: string;
  currency?: string;
  avatarColor?: string;
  createdAt?: string;
  timezone?: string;
  avatarUrl?: string;
}

export interface Account {
  _id: string;
  name: string;
  type: string;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  color?: string;
  icon?: string;
  institution?: string;
  isArchived?: boolean;
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  kind: "income" | "expense";
  color?: string;
  icon?: string;
}

export interface Transaction {
  _id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  currency?: string;
  date: string;
  description?: string;
  notes?: string;
  tags?: string[];
  account?: Account | null;
  toAccount?: Account | null;
  category?: Category | null;
}

export interface TransactionsResponse {
  data: Transaction[];
  meta: { page: number; pages: number; total: number; limit: number };
}

export interface Budget {
  _id: string;
  name: string;
  amount: number;
  currency: string;
  period: "weekly" | "monthly" | "yearly";
  startDate: string;
  alertThreshold?: number;
  category?: Category | null;
  spent?: number;
  remaining?: number;
  progress?: number;
  windowStart?: string;
  windowEnd?: string;
}

export interface Goal {
  _id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline?: string;
  color?: string;
  note?: string;
  progress?: number;
  isAchieved?: boolean;
}

export interface RecurringRule {
  _id: string;
  name: string;
  amount: number;
  currency: string;
  type: "income" | "expense" | "transfer";
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  startDate: string;
  endDate?: string;
  nextRunAt?: string;
  nextRunDate?: string;
  lastRunAt?: string;
  active?: boolean;
  isActive?: boolean;
  account?: Account | null;
  toAccount?: Account | null;
  category?: Category | null;
  description?: string;
}

export interface SummaryData {
  totalBalance: number;
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
  accountCount: number;
  budgetCount?: number;
  goalCount?: number;
  goalsCompleted?: number;
  currency: string;
  hasMixedCurrencies?: boolean;
  balancesByCurrency?: Array<{ currency: string; amount: number }>;
  incomeByCurrency?: Array<{ currency: string; amount: number }>;
  expenseByCurrency?: Array<{ currency: string; amount: number }>;
}

export interface CashflowPoint {
  label: string;
  income: number;
  expense: number;
}

export interface CategoryBreakdown {
  name: string;
  total: number;
  share: number;
  color?: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors?: string[];
}
