"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Repeat, Play } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { apiError } from "@/lib/api";
import { cleanPayload } from "@/lib/cleanPayload";
import { useRecurring, useCreateRecurring, useUpdateRecurring, useDeleteRecurring, useRunRecurringNow } from "@/hooks/useRecurring";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import type { RecurringRule } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().positive(),
  type: z.enum(["income", "expense", "transfer"]),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  interval: z.coerce.number().int().positive().default(1),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  account: z.string().min(1),
  toAccount: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function RecurringPage() {
  const rules = useRecurring();
  const accounts = useAccounts();
  const cats = useCategories();
  const createRule = useCreateRecurring();
  const updateRule = useUpdateRecurring();
  const deleteRule = useDeleteRecurring();
  const runNow = useRunRecurringNow();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringRule | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const watchType = watch("type");
  const watchAccount = watch("account");
  const selectedAccountCurrency = (accounts.data || []).find((account) => account._id === watchAccount)?.currency
    || editing?.account?.currency
    || editing?.currency
    || "USD";

  const openAdd = () => {
    setEditing(null);
    reset({ name: "", amount: 0, type: "expense", frequency: "monthly", interval: 1, startDate: new Date().toISOString().slice(0, 10), endDate: "", account: "", toAccount: "", category: "", description: "" });
    setModalOpen(true);
  };

  const openEdit = (r: RecurringRule) => {
    setEditing(r);
    reset({ name: r.name, amount: r.amount, type: r.type, frequency: r.frequency, interval: r.interval, startDate: r.startDate?.slice(0, 10), endDate: r.endDate?.slice(0, 10) || "", account: r.account?._id || "", toAccount: r.toAccount?._id || "", category: r.category?._id || "", description: r.description || "" });
    setModalOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = cleanPayload(values);
      if (editing) { await updateRule.mutateAsync({ id: editing._id, ...payload }); toast.success("Rule updated"); }
      else { await createRule.mutateAsync(payload); toast.success("Rule created"); }
      setModalOpen(false);
    } catch (err) { toast.error(apiError(err)); }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try { await deleteRule.mutateAsync(deleteId); toast.success("Rule deleted"); setDeleteId(null); }
    catch (err) { toast.error(apiError(err)); }
  };

  const onRunNow = async () => {
    try {
      const res = await runNow.mutateAsync();
      toast.success(`Created ${res.transactionsCreated ?? 0} transaction(s)`);
    } catch (err) { toast.error(apiError(err)); }
  };

  if (rules.isLoading) return <GridPageSkeleton />;
  if (rules.isError) return <ErrorState message={apiError(rules.error)} onRetry={() => rules.refetch()} />;
  const data = rules.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Recurring Rules</h2>
          <p className="mt-1 text-sm text-muted-foreground">Automate repeating transactions.</p>
        </div>
        <div className="flex gap-2">
          <AppButton variant="outline" onClick={onRunNow} loading={runNow.isPending}><Play className="h-4 w-4" /> Run due now</AppButton>
          <AppButton onClick={openAdd}><Plus className="h-4 w-4" /> Add rule</AppButton>
        </div>
      </div>

      {data.length === 0 ? (
        <EmptyState icon={Repeat} title="No recurring rules" description="Add a recurring rule to automate transactions." action={<AppButton onClick={openAdd} size="sm"><Plus className="h-4 w-4" /> Add</AppButton>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((r) => (
            <Card key={r._id}>
              <CardHeader
                title={r.name}
                subtitle={`${r.frequency} · every ${r.interval > 1 ? `${r.interval} ` : ""}${r.frequency.replace(/ly$/, "")}`}
                action={
                  <div className="flex gap-1">
                    <Badge variant={r.isActive ? "default" : "secondary"} className="text-[10px]">{r.isActive ? "Active" : "Paused"}</Badge>
                    <AppButton size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></AppButton>
                    <AppButton size="icon" variant="ghost" onClick={() => setDeleteId(r._id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></AppButton>
                  </div>
                }
              />
              <CardBody>
                <p className={`text-lg font-semibold ${r.type === "income" ? "text-income" : r.type === "expense" ? "text-expense" : "text-foreground"}`}>
                  {r.type === "income" ? "+" : r.type === "expense" ? "−" : ""}{formatCurrency(
                    r.amount,
                    r.account?.currency || r.currency || "USD"
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.account?.name}{r.toAccount ? ` → ${r.toAccount.name}` : ""}{r.category ? ` · ${r.category.name}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">Currency: {r.account?.currency || r.currency || "USD"}</p>
                <p className="text-xs text-muted-foreground">Next run: {formatDate(r.nextRunDate)}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
        title="Delete recurring rule?"
        description="This will permanently remove this recurring rule. Future transactions will no longer be created."
        loading={deleteRule.isPending}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Rule" : "New Recurring Rule"} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AppInput label="Name" error={errors.name?.message} {...register("name")} />
          <div className="grid grid-cols-2 gap-4">
            <AppSelect label="Type" {...register("type")}><option value="expense">Expense</option><option value="income">Income</option><option value="transfer">Transfer</option></AppSelect>
            <AppInput label="Amount" type="number" step="0.01" error={errors.amount?.message} {...register("amount")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AppSelect label="Frequency" {...register("frequency")}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></AppSelect>
            <AppInput label="Interval" type="number" min={1} {...register("interval")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AppInput label="Start date" type="date" error={errors.startDate?.message} {...register("startDate")} />
            <AppInput label="End date (optional)" type="date" {...register("endDate")} />
          </div>
          <AppSelect label="Account" error={errors.account?.message} {...register("account")}>
            <option value="">Select account</option>
            {(accounts.data || []).map((a) => (<option key={a._id} value={a._id}>{a.name}</option>))}
          </AppSelect>
          <AppInput label="Currency (from account)" value={selectedAccountCurrency} readOnly />
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
          <AppInput label="Description" {...register("description")} />
          <div className="flex justify-end gap-2">
            <AppButton variant="secondary" onClick={() => setModalOpen(false)}>Cancel</AppButton>
            <AppButton type="submit" loading={createRule.isPending || updateRule.isPending}>{editing ? "Update" : "Create"}</AppButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
