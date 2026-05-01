import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
} from "lucide-react";
import dayjs from "dayjs";
import { toast } from "sonner";
import {
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
  useUpdateTransaction,
} from "../hooks/useTransactions";
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
import { apiError } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";

const schema = z
  .object({
    type: z.enum(["income", "expense", "transfer"]),
    account: z.string().min(1, "Required"),
    toAccount: z.string().optional(),
    category: z.string().optional(),
    amount: z.coerce.number().positive(),
    currency: z.string().min(3).max(3),
    description: z.string().optional(),
    notes: z.string().optional(),
    date: z.string().min(1),
    tags: z.string().optional(),
  })
  .refine(
    (v) =>
      v.type !== "transfer" || (v.toAccount && v.toAccount !== v.account),
    { message: "Pick a different destination account", path: ["toAccount"] }
  );

function TxForm({ defaultValues, onSubmit, submitting }) {
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
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium capitalize ${
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
        <Input
          label="Amount"
          type="number"
          step="0.01"
          error={errors.amount?.message}
          {...register("amount")}
        />
        <Input label="Date" type="date" error={errors.date?.message} {...register("date")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Account" error={errors.account?.message} {...register("account")}>
          <option value="">Select account</option>
          {(accounts.data || []).map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </Select>
        {type === "transfer" ? (
          <Select label="To account" error={errors.toAccount?.message} {...register("toAccount")}>
            <option value="">Select destination</option>
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

      <Input label="Description" placeholder="What's this for?" {...register("description")} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Currency" maxLength={3} {...register("currency")} />
        <Input label="Tags" placeholder="comma,separated" {...register("tags")} />
      </div>

      <Button type="submit" className="w-full" loading={submitting}>
        Save transaction
      </Button>
    </form>
  );
}

function typeIcon(type) {
  if (type === "income") return ArrowUpRight;
  if (type === "expense") return ArrowDownRight;
  return ArrowLeftRight;
}

export default function Transactions() {
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    sort: "-date",
    search: "",
    type: "",
    account: "",
    category: "",
  });

  const cleaned = useMemo(() => {
    const p = { ...params };
    Object.keys(p).forEach((k) => p[k] === "" && delete p[k]);
    return p;
  }, [params]);

  const tx = useTransactions(cleaned);
  const accounts = useAccounts();
  const categories = useCategories();
  const create = useCreateTransaction();
  const update = useUpdateTransaction();
  const remove = useDeleteTransaction();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const buildPayload = (values) => ({
    ...values,
    amount: Number(values.amount),
    date: new Date(values.date).toISOString(),
    tags: values.tags
      ? values.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [],
    toAccount: values.type === "transfer" ? values.toAccount : null,
    category: values.type === "transfer" ? null : values.category || null,
  });

  const onCreate = async (values) => {
    try {
      await create.mutateAsync(buildPayload(values));
      toast.success("Transaction added");
      setOpen(false);
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const onEdit = async (values) => {
    try {
      await update.mutateAsync({ id: editing._id, ...buildPayload(values) });
      toast.success("Transaction updated");
      setEditing(null);
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Deleted");
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const items = tx.data?.data || [];
  const meta = tx.data?.meta || { page: 1, pages: 1, total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Transactions</h2>
          <p className="text-sm text-slate-500">
            {meta.total} total - filter, search, sort and edit your transactions.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          disabled={(accounts.data || []).length === 0}
        >
          <Plus className="mr-2 h-4 w-4" /> Add transaction
        </Button>
      </div>

      <Card>
        <CardBody className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={params.search}
                onChange={(e) => setParams({ ...params, page: 1, search: e.target.value })}
                placeholder="Search description, notes, tags..."
                className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
          <Select
            value={params.type}
            onChange={(e) => setParams({ ...params, page: 1, type: e.target.value })}
          >
            <option value="">All types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="transfer">Transfer</option>
          </Select>
          <Select
            value={params.account}
            onChange={(e) => setParams({ ...params, page: 1, account: e.target.value })}
          >
            <option value="">All accounts</option>
            {(accounts.data || []).map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </Select>
          <Select
            value={params.category}
            onChange={(e) => setParams({ ...params, page: 1, category: e.target.value })}
          >
            <option value="">All categories</option>
            {(categories.data || []).map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>
        </CardBody>
      </Card>

      {tx.isLoading ? (
        <LoadingScreen />
      ) : items.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="Try adjusting filters, or add your first transaction."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add transaction
            </Button>
          }
        />
      ) : (
        <Card>
          <CardBody className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((t) => {
                  const Icon = typeIcon(t.type);
                  return (
                    <TableRow key={t._id}>
                      <TableCell className="font-medium whitespace-nowrap text-slate-600">
                        {formatDate(t.date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                              t.type === "income"
                                ? "bg-emerald-100 text-emerald-600"
                                : t.type === "expense"
                                ? "bg-rose-100 text-rose-600"
                                : "bg-slate-100 text-slate-600"
                            }`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col space-y-1">
                            <span className="font-semibold text-slate-900">
                              {t.description || t.category?.name || "Transaction"}
                            </span>
                            {t.tags?.length > 0 && (
                              <div className="flex gap-1">
                                {t.tags.map((tg) => (
                                  <Badge key={tg} variant="secondary" className="text-[10px] py-0">{tg}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {t.account?.name}
                        {t.toAccount ? ` -> ${t.toAccount.name}` : ""}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {t.category ? (
                           <Badge variant="outline" style={{ borderColor: t.category.color, color: t.category.color }}>
                             {t.category.name}
                           </Badge>
                        ) : "-"}
                      </TableCell>
                      <TableCell
                        className={
                          "whitespace-nowrap text-right font-bold " +
                          (t.type === "income"
                            ? "text-emerald-600"
                            : t.type === "expense"
                            ? "text-rose-600"
                            : "text-slate-700")
                        }
                      >
                        {t.type === "expense" ? "-" : t.type === "income" ? "+" : ""}
                        {formatCurrency(t.amount, t.currency || currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditing(t)}
                          className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(t._id)}
                          className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
              <span>
                Page {meta.page} of {meta.pages} ({meta.total} total)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => setParams({ ...params, page: meta.page - 1 })}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={meta.page >= meta.pages}
                  onClick={() => setParams({ ...params, page: meta.page + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New transaction" size="lg">
        <TxForm
          defaultValues={{
            type: "expense",
            account: (accounts.data || [])[0]?._id || "",
            toAccount: "",
            category: "",
            amount: "",
            currency: (accounts.data || [])[0]?.currency || currency,
            description: "",
            notes: "",
            date: dayjs().format("YYYY-MM-DD"),
            tags: "",
          }}
          onSubmit={onCreate}
          submitting={create.isPending}
        />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit transaction"
        size="lg"
      >
        {editing && (
          <TxForm
            defaultValues={{
              type: editing.type,
              account: editing.account?._id || "",
              toAccount: editing.toAccount?._id || "",
              category: editing.category?._id || "",
              amount: editing.amount,
              currency: editing.currency || currency,
              description: editing.description || "",
              notes: editing.notes || "",
              date: dayjs(editing.date).format("YYYY-MM-DD"),
              tags: (editing.tags || []).join(","),
            }}
            onSubmit={onEdit}
            submitting={update.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
