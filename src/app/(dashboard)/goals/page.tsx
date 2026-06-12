"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Target } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardHeader, CardBody } from "@/components/shared/AppCard";
import AppButton from "@/components/shared/AppButton";
import AppInput from "@/components/shared/AppInput";
import Modal from "@/components/shared/Modal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { GridPageSkeleton } from "@/components/shared/PageSkeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { apiError } from "@/lib/api";
import { cleanPayload } from "@/lib/cleanPayload";
import { useGoals, useCreateGoal, useUpdateGoal, useContributeGoal, useDeleteGoal } from "@/hooks/useGoals";
import type { Goal } from "@/types";

const goalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetAmount: z.coerce.number().positive("Target amount must be positive"),
  currency: z.string().min(3).max(3).default("USD"),
  deadline: z.string().optional(),
  note: z.string().optional(),
});

type GoalValues = z.infer<typeof goalSchema>;

export default function GoalsPage() {
  const goals = useGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const contribute = useContributeGoal();
  const deleteGoal = useDeleteGoal();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [contribModal, setContribModal] = useState<string | null>(null);
  const [contribAmt, setContribAmt] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<GoalValues>({ resolver: zodResolver(goalSchema) });

  const openAdd = () => { setEditing(null); reset({ name: "", targetAmount: 0, currency: "USD", deadline: "", note: "" }); setModalOpen(true); };
  const openEdit = (g: Goal) => { setEditing(g); reset({ name: g.name, targetAmount: g.targetAmount, currency: g.currency, deadline: g.deadline?.slice(0, 10) || "", note: g.note || "" }); setModalOpen(true); };

  const onSubmit = async (values: GoalValues) => {
    try {
      const payload = cleanPayload(values);
      if (editing) { await updateGoal.mutateAsync({ id: editing._id, ...payload }); toast.success("Goal updated"); }
      else { await createGoal.mutateAsync(payload); toast.success("Goal created"); }
      setModalOpen(false);
    } catch (err) { toast.error(apiError(err)); }
  };

  const onContribute = async () => {
    if (!contribModal || !contribAmt) return;
    try { await contribute.mutateAsync({ id: contribModal, amount: Number(contribAmt) }); toast.success("Contribution added"); setContribModal(null); setContribAmt(""); }
    catch (err) { toast.error(apiError(err)); }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try { await deleteGoal.mutateAsync(deleteId); toast.success("Goal deleted"); setDeleteId(null); }
    catch (err) { toast.error(apiError(err)); }
  };

  if (goals.isLoading) return <GridPageSkeleton />;
  if (goals.isError) return <ErrorState message={apiError(goals.error)} onRetry={() => goals.refetch()} />;
  const data = goals.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Goals</h2>
          <p className="mt-1 text-sm text-muted-foreground">Track your savings goals.</p>
        </div>
        <AppButton onClick={openAdd}><Plus className="h-4 w-4" /> Add goal</AppButton>
      </div>

      {data.length === 0 ? (
        <EmptyState icon={Target} title="No goals yet" description="Create a savings goal to start tracking." action={<AppButton onClick={openAdd} size="sm"><Plus className="h-4 w-4" /> Add</AppButton>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((g) => {
            const pct = Math.min(g.progress ?? ((g.currentAmount / g.targetAmount) * 100), 100);
            return (
              <Card key={g._id}>
                <CardHeader
                  title={g.name}
                  subtitle={g.deadline ? `Due ${formatDate(g.deadline)}` : undefined}
                  action={
                    <div className="flex gap-1">
                      {g.isAchieved && <Badge className="bg-success text-success-foreground text-[10px]">Achieved</Badge>}
                      <AppButton size="icon" variant="ghost" onClick={() => openEdit(g)}><Pencil className="h-3.5 w-3.5" /></AppButton>
                      <AppButton size="icon" variant="ghost" onClick={() => setDeleteId(g._id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></AppButton>
                    </div>
                  }
                />
                <CardBody>
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-semibold text-foreground">{formatCurrency(g.currentAmount, g.currency)}</span>
                    <span className="text-xs text-muted-foreground">of {formatCurrency(g.targetAmount, g.currency)}</span>
                  </div>
                  <Progress value={pct} className="mt-2 h-2" />
                  <p className="mt-1 text-xs text-muted-foreground">{pct.toFixed(0)}% complete</p>
                  <AppButton className="mt-3 w-full" size="sm" variant="outline" onClick={() => { setContribModal(g._id); setContribAmt(""); }}>
                    + Contribute
                  </AppButton>
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
        title="Delete goal?"
        description="This will permanently remove this savings goal."
        loading={deleteGoal.isPending}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Goal" : "New Goal"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AppInput label="Name" error={errors.name?.message} {...register("name")} />
          <AppInput label="Target amount" type="number" step="0.01" error={errors.targetAmount?.message} {...register("targetAmount")} />
          <AppInput label="Currency" maxLength={3} error={errors.currency?.message} {...register("currency")} />
          <AppInput label="Deadline" type="date" {...register("deadline")} />
          <AppInput label="Note" {...register("note")} />
          <div className="flex justify-end gap-2">
            <AppButton variant="secondary" onClick={() => setModalOpen(false)}>Cancel</AppButton>
            <AppButton type="submit" loading={createGoal.isPending || updateGoal.isPending}>{editing ? "Update" : "Create"}</AppButton>
          </div>
        </form>
      </Modal>

      <Modal open={!!contribModal} onClose={() => setContribModal(null)} title="Contribute to Goal" size="sm">
        <div className="space-y-4">
          <AppInput label="Amount" type="number" step="0.01" value={contribAmt} onChange={(e) => setContribAmt(e.target.value)} />
          <div className="flex justify-end gap-2">
            <AppButton variant="secondary" onClick={() => setContribModal(null)}>Cancel</AppButton>
            <AppButton onClick={onContribute} loading={contribute.isPending} disabled={!contribAmt}>Contribute</AppButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
