"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, PiggyBank } from "lucide-react";
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
import { GridPageSkeleton } from "@/components/shared/PageSkeleton";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import { apiError } from "@/lib/api";
import { cleanPayload } from "@/lib/cleanPayload";
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { useAccounts } from "@/hooks/useAccounts";
import { useAuth } from "@/auth/AuthContext";
import type { Budget } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  period: z.enum(["weekly", "monthly", "yearly"]),
  category: z.string().optional(),
  alertThreshold: z.coerce.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function BudgetsPage() {
  const budgets = useBudgets();
  const cats = useCategories("expense");
  const accounts = useAccounts();
  const { user } = useAuth();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const openAdd = () => {
    setEditing(null);
    reset({ name: "", amount: 0, period: "monthly", category: "", alertThreshold: 80 });
    setModalOpen(true);
  };

  const openEdit = (b: Budget) => {
    setEditing(b);
    reset({ name: b.name, amount: b.amount, period: b.period, category: b.category?._id || "", alertThreshold: b.alertThreshold != null ? Math.round(b.alertThreshold * 100) : 80 });
    setModalOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: Record<string, unknown> = {
        ...cleanPayload(values),
        alertThreshold: values.alertThreshold != null ? values.alertThreshold / 100 : undefined,
        startDate: new Date().toISOString(),
      };
      if (editing) {
        await updateBudget.mutateAsync({ id: editing._id, ...payload });
        toast.success("Budget updated");
      } else {
        await createBudget.mutateAsync(payload);
        toast.success("Budget created");
      }
      setModalOpen(false);
    } catch (err) { toast.error(apiError(err)); }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try { await deleteBudget.mutateAsync(deleteId); toast.success("Budget deleted"); setDeleteId(null); }
    catch (err) { toast.error(apiError(err)); }
  };

  if (budgets.isLoading) return <GridPageSkeleton />;
  if (budgets.isError) return <ErrorState message={apiError(budgets.error)} onRetry={() => budgets.refetch()} />;
  const data = budgets.data || [];
  const accountCurrencies = Array.from(
    new Set((accounts.data || []).map((account) => account.currency).filter(Boolean))
  );
  const displayCurrency = accountCurrencies.length === 1
    ? accountCurrencies[0]
    : user?.currency || accountCurrencies[0] || "USD";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Budgets</h2>
          <p className="mt-1 text-sm text-muted-foreground">Set spending limits by category.</p>
        </div>
        <AppButton onClick={openAdd}><Plus className="h-4 w-4" /> Add budget</AppButton>
      </div>

      {data.length === 0 ? (
        <EmptyState icon={PiggyBank} title="No budgets yet" description="Create a budget to track your spending limits." action={<AppButton onClick={openAdd} size="sm"><Plus className="h-4 w-4" /> Add</AppButton>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((b) => {
            const pct = Math.min((b.progress ?? 0) * 100, 150);
            const threshold = (b.alertThreshold ?? 0.8) * 100;
            return (
              <Card key={b._id}>
                <CardHeader
                  title={b.name}
                  subtitle={`${b.period} · ${b.category?.name || "All"}`}
                  action={
                    <div className="flex gap-1">
                      <AppButton size="icon" variant="ghost" onClick={() => openEdit(b)}><Pencil className="h-3.5 w-3.5" /></AppButton>
                      <AppButton size="icon" variant="ghost" onClick={() => setDeleteId(b._id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></AppButton>
                    </div>
                  }
                />
                <CardBody>
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-semibold text-foreground">{formatCurrency(b.spent ?? 0, displayCurrency)}</span>
                    <span className="text-xs text-muted-foreground">of {formatCurrency(b.amount, displayCurrency)}</span>
                  </div>
                  <Progress value={Math.min(pct, 100)} className="mt-2 h-2" />
                  <p className={`mt-1 text-xs ${pct >= 100 ? "text-destructive" : pct >= threshold ? "text-warning" : "text-muted-foreground"}`}>
                    {pct.toFixed(0)}% used · {formatCurrency(b.remaining ?? 0, displayCurrency)} remaining
                  </p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
        title="Delete budget?"
        description="This will permanently remove this budget."
        loading={deleteBudget.isPending}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Budget" : "New Budget"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AppInput label="Name" error={errors.name?.message} {...register("name")} />
          <AppInput label="Amount" type="number" step="0.01" error={errors.amount?.message} {...register("amount")} />
          <AppSelect label="Period" error={errors.period?.message} {...register("period")}>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </AppSelect>
          <AppSelect label="Category" {...register("category")}>
            <option value="">All categories</option>
            {(cats.data || []).map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
          </AppSelect>
          <AppInput label="Alert threshold (%)" type="number" min={0} max={100} {...register("alertThreshold")} />
          <div className="flex justify-end gap-2">
            <AppButton variant="secondary" onClick={() => setModalOpen(false)}>Cancel</AppButton>
            <AppButton type="submit" loading={createBudget.isPending || updateBudget.isPending}>{editing ? "Update" : "Create"}</AppButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
