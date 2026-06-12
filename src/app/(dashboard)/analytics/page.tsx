"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Card, CardHeader, CardBody } from "@/components/shared/AppCard";
import ErrorState from "@/components/shared/ErrorState";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatCurrency } from "@/lib/format";
import { apiError } from "@/lib/api";
import type { CategoryBreakdown } from "@/types";
import { CalendarDays, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export default function AnalyticsPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const from = new Date(year, month - 1, 1).toISOString();
  const to = new Date(year, month, 0, 23, 59, 59).toISOString();
  const { summary, cashflow, categoryBreakdown, isLoading, error } = useAnalytics({ from, to });

  if (error) return <ErrorState message={apiError(error)} onRetry={() => window.location.reload()} />;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-96 rounded-xl bg-muted" />
          <div className="h-96 rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track your financial performance and trends.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="h-9 rounded-md border border-input bg-card px-2 text-sm text-foreground"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-9 rounded-md border border-input bg-card px-2 text-sm text-foreground"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Balance</p>
                <p className="text-lg font-semibold text-foreground">
                  {summary ? formatCurrency(summary.totalBalance) : "$0.00"}
                </p>
              </div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Income</p>
                <p className="text-lg font-semibold text-income">
                  {summary ? formatCurrency(summary.income) : "$0.00"}
                </p>
              </div>
              <TrendingUp className="h-4 w-4 text-income" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Expenses</p>
                <p className="text-lg font-semibold text-expense">
                  {summary ? formatCurrency(summary.expense) : "$0.00"}
                </p>
              </div>
              <TrendingDown className="h-4 w-4 text-expense" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Savings Rate</p>
                <p className="text-lg font-semibold text-foreground">
                  {summary ? `${(summary.savingsRate * 100).toFixed(1)}%` : "0%"}
                </p>
              </div>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income vs Expenses Bar Chart */}
        <Card>
          <CardHeader title="Income vs Expenses" subtitle="Last 6 months" />
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashflow || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px"
                    }}
                  />
                  <Bar dataKey="income" fill="hsl(var(--income))" />
                  <Bar dataKey="expense" fill="hsl(var(--expense))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Category Breakdown Pie Chart */}
        <Card>
          <CardHeader title="Spending by Category" subtitle="This month" />
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {(categoryBreakdown || []).map((_entry: CategoryBreakdown, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Cash Flow Line Chart */}
      <Card>
        <CardHeader title="Cash Flow Trend" subtitle="Daily income and expenses this month" />
        <CardBody>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashflow || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px"
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="hsl(var(--income))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--income))" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="hsl(var(--expense))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--expense))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
