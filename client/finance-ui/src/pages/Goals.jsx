import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Target, Check } from "lucide-react";
import { toast } from "sonner";
import {
  useGoals,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  useContributeGoal,
} from "../hooks/useGoals";
import { Card, CardBody } from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import { formatCurrency, formatDate } from "../lib/format";
import { useAuth } from "../auth/AuthContext";
import { apiError } from "../lib/api";

const schema = z.object({
  name: z.string().min(1),
  targetAmount: z.coerce.number().positive(),
  currentAmount: z.coerce.number().min(0).optional(),
  currency: z.string().min(3).max(3),
  deadline: z.string().optional(),
  color: z.string().optional(),
  note: z.string().optional(),
});

function GoalForm({ defaultValues, onSubmit, submitting }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Name" error={errors.name?.message} {...register("name")} />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Target amount"
          type="number"
          step="0.01"
          error={errors.targetAmount?.message}
          {...register("targetAmount")}
        />
        <Input
          label="Current amount"
          type="number"
          step="0.01"
          {...register("currentAmount")}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Currency" maxLength={3} {...register("currency")} />
        <Input label="Deadline" type="date" {...register("deadline")} />
      </div>
      <Input label="Color" type="color" {...register("color")} />
      <Input label="Note" {...register("note")} />
      <Button type="submit" className="w-full" loading={submitting}>
        Save
      </Button>
    </form>
  );
}

export default function Goals() {
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const goals = useGoals();
  const create = useCreateGoal();
  const update = useUpdateGoal();
  const remove = useDeleteGoal();
  const contribute = useContributeGoal();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [contributing, setContributing] = useState(null);
  const [contribAmount, setContribAmount] = useState("");

  const onCreate = async (values) => {
    try {
      await create.mutateAsync({
        ...values,
        deadline: values.deadline ? new Date(values.deadline).toISOString() : null,
      });
      toast.success("Goal created");
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
        deadline: values.deadline ? new Date(values.deadline).toISOString() : null,
      });
      toast.success("Goal updated");
      setEditing(null);
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this goal?")) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Deleted");
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const onContribute = async () => {
    try {
      await contribute.mutateAsync({
        id: contributing._id,
        amount: Number(contribAmount),
      });
      toast.success("Contribution added");
      setContributing(null);
      setContribAmount("");
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  if (goals.isLoading) return <LoadingScreen />;
  const items = goals.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Goals</h2>
          <p className="text-sm text-slate-500">Save toward what matters.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New goal
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Create your first goal to start saving."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Create goal
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((g) => {
            const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
            return (
              <Card key={g._id}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                        style={{ background: g.color || "#10b981" }}
                      >
                        {g.isAchieved ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Target className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{g.name}</p>
                        {g.deadline && (
                          <p className="text-xs text-slate-500">
                            By {formatDate(g.deadline)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(g)}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(g._id)}
                        className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <p className="text-2xl font-semibold text-slate-900">
                      {formatCurrency(g.currentAmount, g.currency || currency)}
                    </p>
                    <p className="text-xs text-slate-500">
                      of {formatCurrency(g.targetAmount, g.currency || currency)}
                    </p>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {g.note && (
                    <p className="mt-2 text-xs text-slate-500">{g.note}</p>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => setContributing(g)}
                  >
                    Add contribution
                  </Button>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New goal">
        <GoalForm
          defaultValues={{
            name: "",
            targetAmount: "",
            currentAmount: 0,
            currency,
            deadline: "",
            color: "#10b981",
            note: "",
          }}
          onSubmit={onCreate}
          submitting={create.isPending}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit goal">
        {editing && (
          <GoalForm
            defaultValues={{
              name: editing.name,
              targetAmount: editing.targetAmount,
              currentAmount: editing.currentAmount,
              currency: editing.currency,
              deadline: editing.deadline
                ? new Date(editing.deadline).toISOString().slice(0, 10)
                : "",
              color: editing.color,
              note: editing.note,
            }}
            onSubmit={onEdit}
            submitting={update.isPending}
          />
        )}
      </Modal>

      <Modal
        open={!!contributing}
        onClose={() => setContributing(null)}
        title={`Contribute to ${contributing?.name || ""}`}
      >
        <div className="space-y-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={contribAmount}
            onChange={(e) => setContribAmount(e.target.value)}
          />
          <Button
            className="w-full"
            loading={contribute.isPending}
            onClick={onContribute}
            disabled={!contribAmount}
          >
            Save contribution
          </Button>
        </div>
      </Modal>
    </div>
  );
}
