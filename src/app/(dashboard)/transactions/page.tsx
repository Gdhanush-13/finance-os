"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardHeader, CardBody } from "@/components/shared/AppCard";
import AppButton from "@/components/shared/AppButton";
import AppInput from "@/components/shared/AppInput";
import AppSelect from "@/components/shared/AppSelect";
import Modal from "@/components/shared/Modal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { TablePageSkeleton, ListRowSkeleton } from "@/components/shared/PageSkeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { apiError } from "@/lib/api";
import { cleanPayload } from "@/lib/cleanPayload";
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import type { Transaction } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

const schema = z.object({
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
  account: z.string().min(1, "Account is required"),
  toAccount: z.string().optional(),
  category: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [typeFilter, setTypeFilter] = useState("");
  const params: Record<string, unknown> = { page, limit: 20 };
  if (debouncedSearch) params.search = debouncedSearch;
  if (typeFilter) params.type = typeFilter;

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const txns = useTransactions(params);
  const accounts = useAccounts();
  const cats = useCategories();
  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
  const deleteTx = useDeleteTransaction();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const watchType = watch("type");

  const openAdd = () => {
    setEditing(null);
    reset({ type: "expense", amount: 0, date: new Date().toISOString().slice(0, 10), description: "", account: "", toAccount: "", category: "" });
    setModalOpen(true);
  };

  const openEdit = (tx: Transaction) => {
    setEditing(tx);
    reset({
      type: tx.type,
      amount: tx.amount,
      date: tx.date?.slice(0, 10),
      description: tx.description || "",
      account: tx.account?._id || "",
      toAccount: tx.toAccount?._id || "",
      category: tx.category?._id || "",
    });
    setModalOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = cleanPayload(values);
      if (editing) {
        await updateTx.mutateAsync({ id: editing._id, ...payload });
        toast.success("Transaction updated");
      } else {
        await createTx.mutateAsync(payload);
        toast.success("Transaction created");
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTx.mutateAsync(deleteId);
      toast.success("Transaction deleted");
      setDeleteId(null);
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  if (txns.isLoading) return <TablePageSkeleton />;
  if (txns.isError) return <ErrorState message={apiError(txns.error)} onRetry={() => txns.refetch()} />;

  const data = txns.data?.data || [];
  const meta = txns.data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Transactions</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage your income and expenses.</p>
        </div>
        <AppButton onClick={openAdd}><Plus className="h-4 w-4" /> Add transaction</AppButton>
      </div>

      <Card>
        <CardHeader
          title="All Transactions"
          subtitle={meta ? `${meta.total} total` : undefined}
        />
        <div className="flex flex-wrap gap-2 border-b border-border/60 px-5 pb-4">
          <div className="relative flex-1 min-w-[140px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-card pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-md border border-input bg-card px-2 text-sm text-foreground"
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>
        <CardBody>
          {data.length === 0 ? (
            <EmptyState title="No transactions yet" description="Add your first transaction to get started." action={<AppButton onClick={openAdd} size="sm"><Plus className="h-4 w-4" /> Add</AppButton>} />
          ) : (
            <>
              <div className="divide-y divide-border">
                {data.map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between gap-2 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${tx.type === "income" ? "bg-income-soft text-income" : tx.type === "expense" ? "bg-expense-soft text-expense" : "bg-muted text-transfer"}`}>
                        {tx.type === "income" ? "+" : tx.type === "expense" ? "−" : "⇄"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{tx.description || tx.category?.name || tx.type}</p>
                        <p className="truncate text-xs text-muted-foreground">{tx.account?.name} · {formatDate(tx.date)}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 sm:gap-3">
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${tx.type === "income" ? "text-income" : tx.type === "expense" ? "text-expense" : "text-foreground"}`}>
                          {tx.type === "income" ? "+" : tx.type === "expense" ? "−" : ""}{formatCurrency(tx.amount)}
                        </p>
                        <Badge variant="secondary" className="text-[10px]">{tx.type}</Badge>
                      </div>
                      <AppButton size="icon" variant="ghost" onClick={() => openEdit(tx)}><Pencil className="h-3.5 w-3.5" /></AppButton>
                      <AppButton size="icon" variant="ghost" onClick={() => setDeleteId(tx._id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></AppButton>
                    </div>
                  </div>
                ))}
              </div>
              {meta && meta.pages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <AppButton size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</AppButton>
                  <span className="text-xs text-muted-foreground">Page {meta.page} of {meta.pages}</span>
                  <AppButton size="sm" variant="outline" disabled={page >= meta.pages} onClick={() => setPage(page + 1)}>Next</AppButton>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
        title="Delete transaction?"
        description="This will permanently remove this transaction and update your account balance."
        loading={deleteTx.isPending}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Transaction" : "New Transaction"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AppSelect label="Type" error={errors.type?.message} {...register("type")}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="transfer">Transfer</option>
          </AppSelect>
          <AppInput label="Amount" type="number" step="0.01" error={errors.amount?.message} {...register("amount")} />
          <AppInput label="Date" type="date" error={errors.date?.message} {...register("date")} />
          <AppInput label="Description" error={errors.description?.message} {...register("description")} />
          <AppSelect label="Account" error={errors.account?.message} {...register("account")}>
            <option value="">Select account</option>
            {(accounts.data || []).map((a) => (<option key={a._id} value={a._id}>{a.name}</option>))}
          </AppSelect>
          {watchType === "transfer" && (
            <AppSelect label="To Account" {...register("toAccount")}>
              <option value="">Select account</option>
              {(accounts.data || []).map((a) => (<option key={a._id} value={a._id}>{a.name}</option>))}
            </AppSelect>
          )}
          {watchType !== "transfer" && (
            <AppSelect label="Category" {...register("category")}>
              <option value="">No category</option>
              {(cats.data || []).filter((c) => c.kind === watchType).map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
            </AppSelect>
          )}
          <div className="flex justify-end gap-2">
            <AppButton variant="secondary" onClick={() => setModalOpen(false)}>Cancel</AppButton>
            <AppButton type="submit" loading={createTx.isPending || updateTx.isPending}>{editing ? "Update" : "Create"}</AppButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
