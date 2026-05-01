import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Tags } from "lucide-react";
import { toast } from "sonner";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "../hooks/useCategories";
import { Card, CardBody, CardHeader } from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import { apiError } from "../lib/api";

const schema = z.object({
  name: z.string().min(1),
  kind: z.enum(["income", "expense"]),
  color: z.string().optional(),
});

export default function Categories() {
  const categories = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("expense");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", kind: "expense", color: "#6366f1" },
  });

  const onCreate = async (values) => {
    try {
      await createCategory.mutateAsync(values);
      toast.success("Category added");
      setOpen(false);
      reset();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteCategory.mutateAsync(id);
      toast.success("Category deleted");
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  if (categories.isLoading) return <LoadingScreen />;

  const filtered = (categories.data || []).filter((c) => c.kind === tab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Categories</h2>
          <p className="text-sm text-slate-500">
            Organize your transactions for clearer reports.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New category
        </Button>
      </div>

      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
        {["expense", "income"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${
              tab === t ? "bg-indigo-600 text-white" : "text-slate-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Tags}
          title={`No ${tab} categories`}
          description="Add categories to organize your transactions."
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <li key={c._id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ background: c.color || "#6366f1" }}
                    />
                    <span className="text-sm font-medium text-slate-900">{c.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(c._id)}
                    className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New category">
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <Input label="Name" error={errors.name?.message} {...register("name")} />
          <Select label="Kind" {...register("kind")}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
          <Input label="Color" type="color" {...register("color")} />
          <Button type="submit" className="w-full" loading={createCategory.isPending}>
            Save
          </Button>
        </form>
      </Modal>
    </div>
  );
}
