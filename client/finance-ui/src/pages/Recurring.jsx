import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Repeat, Trash2, Pencil, Play } from "lucide-react";
import dayjs from "dayjs";
import { toast } from "sonner";
import {
  useRecurring,
  useCreateRecurring,
  useUpdateRecurring,
  useDeleteRecurring,
  useRunRecurringNow,
} from "../hooks/useRecurring";
import { useAccounts } from "../hooks/useAccounts";
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
  type: z.enum(["income", "expense", "transfer"]),
  account: z.string().min(1),
  toAccount: z.string().optional(),
  category: z.string().optional(),
  amount: z.coerce.number().positive(),
  currency: z.string().min(3).max(3),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  interval: z.coerce.number().int().min(1).default(1),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
});

function RecurringForm({ defaultValues, onSubmit, submitting }) {
  const accounts = useAccounts();
  const categories = useCategories();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues });
  const type = watch("type");
  const filteredCats = (categories.data || []).filter((c) =>
    type === "income" ? c.kind === "income" : c.kind === "expense"
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {["expense", "income", "transfer"].map((t) => (
          <label
            key={t}
            className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium capitalize ${
              type === t
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-slate-200 text-slate-600"
            }`}
          >
            <input type="radio" value={t} {...register("type")} className="sr-only" />
            {t}
          </label>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Amount" type="number" step="0.01" error={errors.amount?.message} {...register("amount")} />
        <Input label="Currency" maxLength={3} {...register("currency")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Account" {...register("account")}>
          <option value="">Select</option>
          {(accounts.data || []).map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </Select>
        {type === "transfer" ? (
          <Select label="To account" {...register("toAccount")}>
            <option value="">Select</option>
            {(accounts.data || []).map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </Select>
        ) : (
          <Select label="Category" {...register("category")}>
            <option value="">Uncategorized</option>
            {filteredCats.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>
        )}
      </div>
      <Input label="Description" {...register("description")} />
      <div className="grid grid-cols-3 gap-3">
        <Select label="Frequency" {...register("frequency")}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </Select>
        <Input label="Every" type="number" min="1" {...register("interval")} />
        <Input label="Start date" type="date" {...register("startDate")} />
      </div>
      <Input label="End date (optional)" type="date" {...register("endDate")} />
      <Button type="submit" className="w-full" loading={submitting}>
        Save
      </Button>
    </form>
  );
}

export default function Recurring() {
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const accounts = useAccounts();
  const recurring = useRecurring();
  const create = useCreateRecurring();
  const update = useUpdateRecurring();
  const remove = useDeleteRecurring();
  const runNow = useRunRecurringNow();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const buildPayload = (values) => ({
    ...values,
    amount: Number(values.amount),
    interval: Number(values.interval) || 1,
    startDate: new Date(values.startDate).toISOString(),
    endDate: values.endDate ? new Date(values.endDate).toISOString() : null,
    toAccount: values.type === "transfer" ? values.toAccount : null,
    category: values.type === "transfer" ? null : values.category || null,
  });

  const onCreate = async (values) => {
    try {
      await create.mutateAsync(buildPayload(values));
      toast.success("Recurring rule created");
      setOpen(false);
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const onEdit = async (values) => {
    try {
      await update.mutateAsync({ id: editing._id, ...buildPayload(values) });
      toast.success("Updated");
      setEditing(null);
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this recurring rule?")) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Deleted");
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const onRunNow = async () => {
    try {
      const r = await runNow.mutateAsync();
      toast.success(`Created ${r.transactionsCreated} transactions`);
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  if (recurring.isLoading) return <LoadingScreen />;
  const items = recurring.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Recurring</h2>
          <p className="text-sm text-slate-500">
            Automate income/expenses that repeat on a schedule.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" loading={runNow.isPending} onClick={onRunNow}>
            <Play className="h-4 w-4" /> Run due now
          </Button>
          <Button
            onClick={() => setOpen(true)}
            disabled={(accounts.data || []).length === 0}
          >
            <Plus className="h-4 w-4" /> New rule
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No recurring rules"
          description="Create a rule to automatically generate transactions."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Create rule
            </Button>
          }
        />
      ) : (
        <Card>
          <CardBody className="p-0 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Schedule</th>
                  <th className="px-4 py-3">Next run</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {r.description || r.category?.name || "Recurring"}
                      </p>
                      <p className="text-xs capitalize text-slate-500">
                        {r.type}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {r.account?.name}
                      {r.toAccount ? ` -> ${r.toAccount.name}` : ""}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      Every {r.interval} {r.frequency}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(r.nextRunDate)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(r.amount, r.currency || currency)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setEditing(r)}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(r._id)}
                        className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New recurring rule" size="lg">
        <RecurringForm
          defaultValues={{
            type: "expense",
            account: (accounts.data || [])[0]?._id || "",
            toAccount: "",
            category: "",
            amount: "",
            currency,
            description: "",
            frequency: "monthly",
            interval: 1,
            startDate: dayjs().format("YYYY-MM-DD"),
            endDate: "",
          }}
          onSubmit={onCreate}
          submitting={create.isPending}
        />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit recurring rule"
        size="lg"
      >
        {editing && (
          <RecurringForm
            defaultValues={{
              type: editing.type,
              account: editing.account?._id || "",
              toAccount: editing.toAccount?._id || "",
              category: editing.category?._id || "",
              amount: editing.amount,
              currency: editing.currency,
              description: editing.description,
              frequency: editing.frequency,
              interval: editing.interval,
              startDate: dayjs(editing.startDate).format("YYYY-MM-DD"),
              endDate: editing.endDate
                ? dayjs(editing.endDate).format("YYYY-MM-DD")
                : "",
            }}
            onSubmit={onEdit}
            submitting={update.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
