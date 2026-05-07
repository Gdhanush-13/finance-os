"use client";

import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Card, CardHeader, CardBody } from "@/components/shared/AppCard";
import LoadingScreen from "@/components/shared/LoadingScreen";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  useSummary,
  useCashflow,
  useCategoryBreakdown,
  useRecentTransactions,
} from "@/hooks/useAnalytics";
import { Badge } from "@/components/ui/badge";

const PIE_COLORS = [
  "hsl(234,73%,56%)",
  "hsl(152,60%,40%)",
  "hsl(350,78%,55%)",
  "hsl(38,92%,50%)",
  "hsl(271,67%,55%)",
  "hsl(199,89%,48%)",
];

export default function DashboardPage() {
  const summary = useSummary();
  const cashflow = useCashflow(6);
  const categories = useCategoryBreakdown({ type: "expense" });
  const recent = useRecentTransactions(8);

  if (summary.isLoading) return <LoadingScreen />;

  const s = summary.data;

  const stats = [
    {
      label: "Total Balance",
      value: formatCurrency(s?.totalBalance),
      icon: Wallet,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Income",
      value: formatCurrency(s?.income),
      icon: TrendingUp,
      color: "text-income",
      bg: "bg-income-soft",
    },
    {
      label: "Expenses",
      value: formatCurrency(s?.expense),
      icon: TrendingDown,
      color: "text-expense",
      bg: "bg-expense-soft",
    },
    {
      label: "Savings Rate",
      value: `${(s?.savingsRate ?? 0).toFixed(1)}%`,
      icon: PiggyBank,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">An overview of your financial health.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((st) => (
          <Card key={st.label}>
            <CardBody className="flex items-center gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${st.bg}`}>
                <st.icon className={`h-5 w-5 ${st.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{st.label}</p>
                <p className="text-lg font-semibold tracking-tight text-foreground">{st.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Cashflow" subtitle="Income vs expenses over time" />
          <CardBody className="h-72">
            {cashflow.isLoading ? (
              <LoadingScreen label="Loading chart..." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashflow.data || []} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <RTooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="income" fill="hsl(var(--income))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Spending Breakdown" subtitle="By category" />
          <CardBody className="h-72">
            {categories.isLoading ? (
              <LoadingScreen label="Loading chart..." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories.data || []}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={2}
                    label={({ name }) => name}
                    labelLine={false}
                  >
                    {(categories.data || []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RTooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent Transactions" subtitle="Your latest activity" />
        <CardBody>
          {recent.isLoading ? (
            <LoadingScreen label="Loading..." />
          ) : (
            <div className="divide-y divide-border">
              {(recent.data || []).map((tx) => (
                <div key={tx._id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${
                        tx.type === "income"
                          ? "bg-income-soft text-income"
                          : tx.type === "expense"
                          ? "bg-expense-soft text-expense"
                          : "bg-muted text-transfer"
                      }`}
                    >
                      {tx.type === "income" ? "+" : tx.type === "expense" ? "−" : "⇄"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {tx.description || tx.category?.name || tx.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.account?.name} · {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        tx.type === "income" ? "text-income" : tx.type === "expense" ? "text-expense" : "text-foreground"
                      }`}
                    >
                      {tx.type === "income" ? "+" : tx.type === "expense" ? "−" : ""}
                      {formatCurrency(tx.amount)}
                    </p>
                    <Badge variant="secondary" className="mt-0.5 text-[10px]">
                      {tx.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
