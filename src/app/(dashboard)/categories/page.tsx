"use client";

import { useState } from "react";
import { Plus, Trash2, Tags } from "lucide-react";
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
import LoadingScreen from "@/components/shared/LoadingScreen";
import { Badge } from "@/components/ui/badge";
import { apiError } from "@/lib/api";
import { useCategories, useCreateCategory, useDeleteCategory } from "@/hooks/useCategories";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  kind: z.enum(["income", "expense"]),
  color: z.string().optional(),
  icon: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CategoriesPage() {
  const cats = useCategories();
  const createCat = useCreateCategory();
  const deleteCat = useDeleteCategory();
  const [tab, setTab] = useState<"expense" | "income">("expense");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const openAdd = () => { reset({ name: "", kind: tab, color: "", icon: "" }); setModalOpen(true); };

  const onSubmit = async (values: FormValues) => {
    try { await createCat.mutateAsync(values); toast.success("Category created"); setModalOpen(false); }
    catch (err) { toast.error(apiError(err)); }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try { await deleteCat.mutateAsync(deleteId); toast.success("Category deleted"); setDeleteId(null); }
    catch (err) { toast.error(apiError(err)); }
  };

  if (cats.isLoading) return <LoadingScreen />;
  if (cats.isError) return <ErrorState message={apiError(cats.error)} onRetry={() => cats.refetch()} />;

  const filtered = (cats.data || []).filter((c) => c.kind === tab);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Categories</h2>
          <p className="mt-1 text-sm text-muted-foreground">Organize your transactions by category.</p>
        </div>
        <AppButton onClick={openAdd}><Plus className="h-4 w-4" /> Add category</AppButton>
      </div>

      <div className="flex gap-2">
        <AppButton variant={tab === "expense" ? "primary" : "outline"} size="sm" onClick={() => setTab("expense")}>Expense</AppButton>
        <AppButton variant={tab === "income" ? "primary" : "outline"} size="sm" onClick={() => setTab("income")}>Income</AppButton>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Tags} title={`No ${tab} categories`} description={`Add a ${tab} category to organize your transactions.`} action={<AppButton onClick={openAdd} size="sm"><Plus className="h-4 w-4" /> Add</AppButton>} />
      ) : (
        <Card>
          <CardBody>
            <div className="divide-y divide-border">
              {filtered.map((c) => (
                <div key={c._id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    {c.color && <div className="h-3 w-3 rounded-full" style={{ background: c.color }} />}
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                    <Badge variant="secondary" className="text-[10px]">{c.kind}</Badge>
                  </div>
                  <AppButton size="icon" variant="ghost" onClick={() => setDeleteId(c._id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></AppButton>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
        title="Delete category?"
        description="Transactions using this category will become uncategorized."
        loading={deleteCat.isPending}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Category">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AppInput label="Name" error={errors.name?.message} {...register("name")} />
          <AppSelect label="Kind" error={errors.kind?.message} {...register("kind")}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </AppSelect>
          <AppInput label="Color (hex)" placeholder="#6366f1" {...register("color")} />
          <AppInput label="Icon" placeholder="shopping-cart" {...register("icon")} />
          <div className="flex justify-end gap-2">
            <AppButton variant="secondary" onClick={() => setModalOpen(false)}>Cancel</AppButton>
            <AppButton type="submit" loading={createCat.isPending}>Create</AppButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
