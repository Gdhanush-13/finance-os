import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, PiggyBank } from "lucide-react";
import dayjs from "dayjs";
import { toast } from "sonner";
import {
  useBudgets,
  useCreateBudget,
  useDeleteBudget,
  useUpdateBudget,
} from "../hooks/useBudgets";
import { useCategories } from "../hooks/useCategories";
import { Card, CardBody } from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import { formatCurrency, formatDate } from "../lib/format";
import { useAuth } from "../auth/AuthContext";
import { apiError } from "../lib/api";

const schema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  amount: z.coerce.number().positive(),
  period: z.enum(["monthly", "weekly", "yearly"]),
  startDate: z.string().min(1),
  alertThreshold: z.coerce.number().min(0).max(1),
});

function BudgetForm({ defaultValues, onSubmit, submitting }) {
  const categories = useCategories("expense");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Name" placeholder="e.g. Groceries May" error={errors.name?.message} {...register("name")} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Amount" type="number" step="0.01" error={errors.amount?.message} {...register("amount")} />
        <Select label="Period" {...register("period")}>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="yearly">Yearly</option>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Start date" type="date" {...register("startDate")} />
        <Input
          label="Alert threshold (0-1)"
          type="number"
          step="0.05"
          min="0"
          max="1"
          {...register("alertThreshold")}
        />
      </div>
      <Select label="Category (optional)" {...register("category")}>
        <option value="">All expenses</option>
        {(categories.data || []).map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </Select>
      <Button type="submit" className="w-full" loading={submitting}>
        Save
      </Button>
    </form>
  );
}

export default function Budgets() {
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const budgets = useBudgets();
  const create = useCreateBudget();
  const update = useUpdateBudget();
  const remove = useDeleteBudget();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const onCreate = async (values) => {
    try {
      await create.mutateAsync({
        ...values,
        category: values.category || null,
        startDate: new Date(values.startDate).toISOString(),
      });
      toast.success("Budget created");
      setOpen(false);
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const onEdit = async (values) => {
    try {
      await update.mutateAsync({
        id: editing._id,
        ...values,
        category: values.category || null,
        startDate: new Date(values.startDate).toISOString(),
      });
      toast.success("Budget updated");
      setEditing(null);
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this budget?")) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Deleted");
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  if (budgets.isLoading) return <LoadingScreen />;

  const items = budgets.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Budgets</h2>
          <p className="text-sm text-slate-500">
            Set monthly limits and stay on track.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New budget
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No budgets yet"
          description="Create your first budget to monitor spending."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Create budget
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((b) => {
            const pct = Math.min((b.progress || 0) * 100, 100);
            const danger = b.progress >= 1;
            const warn = b.progress >= (b.alertThreshold || 0.8);
            return (
              <Card key={b._id}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{b.name}</p>
                      <p className="text-xs text-slate-500">
                        {b.category?.name || "All expenses"} - {b.period}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(b)}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(b._id)}
                        className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <p className="text-2xl font-semibold text-slate-900">
                      {formatCurrency(b.spent || 0, currency)}
                    </p>
                    <p className="text-xs text-slate-500">
                      of {formatCurrency(b.amount, currency)}
                    </p>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${
                        danger ? "bg-rose-500" : warn ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {danger
                      ? `Over budget by ${formatCurrency(b.spent - b.amount, currency)}`
                      : `${formatCurrency(b.remaining, currency)} remaining`}
                    {" - window "}
                    {formatDate(b.windowStart)} {"->"} {formatDate(b.windowEnd)}
                  </p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New budget">
        <BudgetForm
          defaultValues={{
            name: "",
            category: "",
            amount: 0,
            period: "monthly",
            startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
            alertThreshold: 0.8,
          }}
          onSubmit={onCreate}
          submitting={create.isPending}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit budget">
        {editing && (
          <BudgetForm
            defaultValues={{
              name: editing.name,
              category: editing.category?._id || "",
              amount: editing.amount,
              period: editing.period,
              startDate: dayjs(editing.startDate).format("YYYY-MM-DD"),
              alertThreshold: editing.alertThreshold ?? 0.8,
            }}
            onSubmit={onEdit}
            submitting={update.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
