import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  PiggyBank,
  Target,
  Plus,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import {
  useCashflow,
  useCategoryBreakdown,
  useRecentTransactions,
  useSummary,
} from "../hooks/useAnalytics";
import { Card, CardBody, CardHeader } from "../components/Card";
import { formatCurrency, formatDate } from "../lib/format";
import LoadingScreen from "../components/LoadingScreen";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";

function StatCard({ label, value, icon: Icon, accent, hint }) {
  return (
    <Card>
      <CardBody className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardBody>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const currency = user?.currency || "USD";

  const summary = useSummary();
  const cashflow = useCashflow(6);
  const categories = useCategoryBreakdown({ type: "expense" });
  const recent = useRecentTransactions(8);

  if (summary.isLoading) return <LoadingScreen label="Loading dashboard..." />;

  const s = summary.data || {};

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total balance"
          value={formatCurrency(s.totalBalance, currency)}
          icon={Wallet}
          accent="bg-indigo-100 text-indigo-700"
          hint={`${s.accountCount || 0} accounts`}
        />
        <StatCard
          label="Income (last 6 mo)"
          value={formatCurrency(s.income, currency)}
          icon={ArrowUpRight}
          accent="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          label="Expense (last 6 mo)"
          value={formatCurrency(s.expense, currency)}
          icon={ArrowDownRight}
          accent="bg-rose-100 text-rose-700"
        />
        <StatCard
          label="Net savings"
          value={formatCurrency(s.net, currency)}
          icon={PiggyBank}
          accent="bg-amber-100 text-amber-700"
          hint={`Savings rate ${(Math.max(s.savingsRate || 0, 0) * 100).toFixed(0)}%`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Cashflow"
            subtitle="Monthly income vs expense"
          />
          <CardBody>
            {cashflow.isLoading ? (
              <div className="h-72" />
            ) : (cashflow.data || []).length === 0 ? (
              <EmptyState title="No data yet" description="Add transactions to see your cashflow." />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashflow.data}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} width={70} />
                    <Tooltip
                      formatter={(v) => formatCurrency(v, currency)}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      fill="url(#incomeGrad)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="#f43f5e"
                      fill="url(#expenseGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Spending by category" subtitle="Last 6 months" />
          <CardBody>
            {categories.isLoading ? (
              <div className="h-72" />
            ) : (categories.data || []).length === 0 ? (
              <EmptyState title="No expenses yet" description="Track an expense to see breakdown." />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories.data}
                      dataKey="total"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {categories.data.map((c, idx) => (
                        <Cell key={idx} fill={c.color || "#6366f1"} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, _n, p) =>
                        `${formatCurrency(v, currency)} (${(p.payload.share * 100).toFixed(1)}%)`
                      }
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent transactions"
            action={
              <Link to="/transactions">
                <Button variant="secondary" size="sm">
                  View all
                </Button>
              </Link>
            }
          />
          <CardBody className="p-0">
            {recent.isLoading ? (
              <div className="p-6 text-sm text-slate-500">Loading...</div>
            ) : (recent.data || []).length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No transactions yet"
                  description="Add your first transaction to start tracking."
                  action={
                    <Link to="/transactions">
                      <Button size="sm">
                        <Plus className="h-4 w-4" /> Add transaction
                      </Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recent.data.map((t) => (
                  <li key={t._id} className="flex items-center gap-3 px-5 py-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-white text-xs font-semibold"
                      style={{
                        background: t.category?.color || t.account?.color || "#6366f1",
                      }}
                    >
                      {(t.category?.name || t.account?.name || "?")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {t.description || t.category?.name || "Transaction"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t.account?.name} - {formatDate(t.date)}
                      </p>
                    </div>
                    <div
                      className={
                        t.type === "income"
                          ? "text-sm font-semibold text-emerald-600"
                          : t.type === "expense"
                          ? "text-sm font-semibold text-rose-600"
                          : "text-sm font-semibold text-slate-600"
                      }
                    >
                      {t.type === "expense" ? "-" : t.type === "income" ? "+" : ""}
                      {formatCurrency(t.amount, t.currency || currency)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Quick stats" subtitle="At a glance" />
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Accounts</p>
                  <p className="text-xs text-slate-500">All wallets</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-slate-900">
                {s.accountCount || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <PiggyBank className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Active budgets</p>
                  <p className="text-xs text-slate-500">Across categories</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-slate-900">
                {s.budgetCount || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Goals</p>
                  <p className="text-xs text-slate-500">
                    {s.goalsCompleted || 0} completed
                  </p>
                </div>
              </div>
              <span className="text-lg font-semibold text-slate-900">
                {s.goalCount || 0}
              </span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
