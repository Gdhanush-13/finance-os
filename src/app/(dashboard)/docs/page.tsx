"use client";

import { Card, CardHeader, CardBody } from "@/components/shared/AppCard";
import { BookOpen, TrendingUp, Shield, ArrowRightLeft, Wallet, PiggyBank, Target, Repeat, BarChart2, Tags, Upload } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Documentation</h2>
        <p className="mt-1 text-sm text-muted-foreground">Learn how to use Finance OS to manage your finances effectively.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader title={<div className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Getting Started</div>} />
          <CardBody className="space-y-3 text-sm text-muted-foreground">
            <p>Finance OS is a personal finance management tool designed to help you track income, expenses, and savings goals.</p>
            <p className="font-medium text-foreground">Key Features:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Track multiple accounts (bank, cash, credit cards)</li>
              <li>Categorize transactions for better insights</li>
              <li>Set budgets and monitor spending</li>
              <li>Create savings goals and track progress</li>
              <li>Automate recurring transactions</li>
              <li>Visualize financial trends with analytics</li>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={<div className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Dashboard</div>} />
          <CardBody className="space-y-3 text-sm text-muted-foreground">
            <p>The dashboard provides an overview of your financial health at a glance.</p>
            <p className="font-medium text-foreground">What you&apos;ll see:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Total balance across all accounts</li>
              <li>Income vs expenses summary</li>
              <li>Savings rate calculation</li>
              <li>Cashflow chart over time</li>
              <li>Spending breakdown by category</li>
              <li>Recent transactions list</li>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={<div className="flex items-center gap-2"><ArrowRightLeft className="h-4 w-4" /> Transactions</div>} />
          <CardBody className="space-y-3 text-sm text-muted-foreground">
            <p>Track every money movement with detailed transaction records.</p>
            <p className="font-medium text-foreground">Transaction types:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Income:</strong> Money coming in (salary, gifts, refunds)</li>
              <li><strong>Expense:</strong> Money going out (bills, groceries, entertainment)</li>
              <li><strong>Transfer:</strong> Moving money between your accounts</li>
            </ul>
            <p className="font-medium text-foreground">Tips:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Add categories for better tracking</li>
              <li>Use search to find specific transactions</li>
              <li>Edit or delete transactions as needed</li>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={<div className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Accounts</div>} />
          <CardBody className="space-y-3 text-sm text-muted-foreground">
            <p>Manage all your financial accounts in one place.</p>
            <p className="font-medium text-foreground">Account types:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Bank accounts (checking, savings)</li>
              <li>Cash wallets</li>
              <li>Credit cards</li>
              <li>Investment accounts</li>
              <li>Loans</li>
            </ul>
            <p className="font-medium text-foreground">Best practices:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Set opening balances for accurate tracking</li>
              <li>Archive old accounts instead of deleting</li>
              <li>Use currency codes for multi-currency support</li>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={<div className="flex items-center gap-2"><PiggyBank className="h-4 w-4" /> Budgets</div>} />
          <CardBody className="space-y-3 text-sm text-muted-foreground">
            <p>Set spending limits by category to stay on track financially.</p>
            <p className="font-medium text-foreground">How budgets work:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Create budgets for specific time periods (weekly, monthly, yearly)</li>
              <li>Assign budgets to categories or leave uncategorized</li>
              <li>Set alert thresholds to get notified when nearing limits</li>
              <li>Track progress with visual indicators</li>
            </ul>
            <p className="font-medium text-foreground">Tips:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Start with essential categories (food, housing, transport)</li>
              <li>Review and adjust budgets monthly</li>
              <li>Use past spending data to set realistic limits</li>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={<div className="flex items-center gap-2"><Target className="h-4 w-4" /> Goals</div>} />
          <CardBody className="space-y-3 text-sm text-muted-foreground">
            <p>Set financial goals and track your progress toward achieving them.</p>
            <p className="font-medium text-foreground">Goal examples:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Emergency fund ($10,000)</li>
              <li>Vacation savings ($3,000)</li>
              <li>New car down payment ($5,000)</li>
              <li>Debt payoff ($2,000)</li>
            </ul>
            <p className="font-medium text-foreground">Features:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Set target amounts and deadlines</li>
              <li>Make one-time or recurring contributions</li>
              <li>Track progress with visual indicators</li>
              <li>Mark goals as achieved when complete</li>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={<div className="flex items-center gap-2"><Repeat className="h-4 w-4" /> Recurring</div>} />
          <CardBody className="space-y-3 text-sm text-muted-foreground">
            <p>Automate regular transactions to save time and ensure consistency.</p>
            <p className="font-medium text-foreground">Use cases:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Monthly rent payments</li>
              <li>Weekly grocery budget</li>
              <li>Bi-weekly salary deposits</li>
              <li>Annual subscription renewals</li>
            </ul>
            <p className="font-medium text-foreground">Setup options:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Choose frequency (daily, weekly, monthly, yearly)</li>
              <li>Set custom intervals (every 2 weeks, every 3 months)</li>
              <li>Define start and end dates</li>
              <li>Pause or delete rules as needed</li>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={<div className="flex items-center gap-2"><BarChart2 className="h-4 w-4" /> Analytics</div>} />
          <CardBody className="space-y-3 text-sm text-muted-foreground">
            <p>Gain insights into your financial patterns with detailed analytics.</p>
            <p className="font-medium text-foreground">Available charts:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Income vs expenses over time</li>
              <li>Spending by category breakdown</li>
              <li>Cash flow trends</li>
              <li>Monthly comparisons</li>
            </ul>
            <p className="font-medium text-foreground">Tips:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Filter by month and year for specific periods</li>
              <li>Use insights to identify spending patterns</li>
              <li>Compare months to track progress</li>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={<div className="flex items-center gap-2"><Tags className="h-4 w-4" /> Categories</div>} />
          <CardBody className="space-y-3 text-sm text-muted-foreground">
            <p>Organize transactions with custom categories for better tracking.</p>
            <p className="font-medium text-foreground">Category types:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Income:</strong> Salary, freelance, gifts, refunds</li>
              <li><strong>Expense:</strong> Food, housing, transport, entertainment</li>
            </ul>
            <p className="font-medium text-foreground">Customization:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Add custom colors for visual distinction</li>
              <li>Assign icons for quick recognition</li>
              <li>Create as many categories as needed</li>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={<div className="flex items-center gap-2"><Upload className="h-4 w-4" /> Import / Export</div>} />
          <CardBody className="space-y-3 text-sm text-muted-foreground">
            <p>Import transactions from other tools or export your data for backup.</p>
            <p className="font-medium text-foreground">Import:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Upload CSV files with transaction data</li>
              <li>Link transactions to existing accounts</li>
              <li>Review import results and errors</li>
            </ul>
            <p className="font-medium text-foreground">Export:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Download all transactions as CSV</li>
              <li>Use for backup or analysis in spreadsheets</li>
              <li>Includes all transaction details</li>
            </ul>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title={<div className="flex items-center gap-2"><Shield className="h-4 w-4" /> Security & Privacy</div>} />
        <CardBody className="space-y-3 text-sm text-muted-foreground">
          <p>Your financial data is secure with Finance OS.</p>
          <p className="font-medium text-foreground">Security features:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Secure authentication with JWT tokens</li>
            <li>Password encryption with bcrypt</li>
            <li>Rate limiting to prevent brute force attacks</li>
            <li>CORS protection for API endpoints</li>
          </ul>
          <p className="font-medium text-foreground">Privacy:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Your data is stored in your own MongoDB database</li>
            <li>No third-party data sharing</li>
            <li>Full control over your financial information</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
