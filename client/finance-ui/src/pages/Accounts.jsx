import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import {
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from "../hooks/useAccounts";
import { Card, CardBody, CardHeader } from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import { formatCurrency } from "../lib/format";
import { useAuth } from "../auth/AuthContext";
import { apiError } from "../lib/api";

const ACCOUNT_TYPES = [
  "cash",
  "bank",
  "credit_card",
  "investment",
  "loan",
  "wallet",
  "other",
];

const schema = z.object({
  name: z.string().min(1, "Required"),
  type: z.enum(ACCOUNT_TYPES),
  currency: z.string().min(3).max(3),
  openingBalance: z.coerce.number(),
  institution: z.string().optional(),
  color: z.string().optional(),
});

function AccountForm({ defaultValues, onSubmit, submitting }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Name" placeholder="e.g. Main Checking" error={errors.name?.message} {...register("name")} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Type" error={errors.type?.message} {...register("type")}>
          {ACCOUNT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace("_", " ")}
            </option>
          ))}
        </Select>
        <Input
          label="Currency"
          placeholder="USD"
          maxLength={3}
          error={errors.currency?.message}
          {...register("currency")}
        />
      </div>
      <Input
        label="Opening balance"
        type="number"
        step="0.01"
        error={errors.openingBalance?.message}
        {...register("openingBalance")}
      />
      <Input label="Institution" placeholder="(optional)" {...register("institution")} />
      <Input label="Color" type="color" {...register("color")} />
      <Button type="submit" loading={submitting} className="w-full">
        Save account
      </Button>
    </form>
  );
}

export default function Accounts() {
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const accounts = useAccounts();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const onCreate = async (values) => {
    try {
      await createAccount.mutateAsync(values);
      toast.success("Account created");
      setOpen(false);
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const onEdit = async (values) => {
    try {
      await updateAccount.mutateAsync({ id: editing._id, ...values });
      toast.success("Account updated");
      setEditing(null);
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this account? Transactions must be empty.")) return;
    try {
      await deleteAccount.mutateAsync(id);
      toast.success("Account deleted");
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  if (accounts.isLoading) return <LoadingScreen />;

  const items = accounts.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Accounts</h2>
          <p className="text-sm text-slate-500">
            Manage your wallets, bank accounts and balances.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New account
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No accounts yet"
          description="Add your first account to start tracking transactions."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Add account
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((a) => (
            <Card key={a._id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                      style={{ background: a.color || "#6366f1" }}
                    >
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{a.name}</p>
                      <p className="text-xs text-slate-500 capitalize">
                        {a.type.replace("_", " ")}
                        {a.institution ? ` - ${a.institution}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing(a)}
                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                      aria-label="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(a._id)}
                      className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="mt-4 text-2xl font-semibold text-slate-900">
                  {formatCurrency(a.currentBalance, a.currency || currency)}
                </p>
                <p className="text-xs text-slate-500">Current balance</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New account">
        <AccountForm
          defaultValues={{
            name: "",
            type: "bank",
            currency,
            openingBalance: 0,
            institution: "",
            color: "#6366f1",
          }}
          onSubmit={onCreate}
          submitting={createAccount.isPending}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit account">
        {editing && (
          <AccountForm
            defaultValues={{
              name: editing.name,
              type: editing.type,
              currency: editing.currency,
              openingBalance: editing.openingBalance,
              institution: editing.institution,
              color: editing.color,
            }}
            onSubmit={onEdit}
            submitting={updateAccount.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
