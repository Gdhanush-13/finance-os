"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Wallet } from "lucide-react";
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
import { formatCurrency } from "@/lib/format";
import { apiError } from "@/lib/api";
import { cleanPayload } from "@/lib/cleanPayload";
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from "@/hooks/useAccounts";
import type { Account } from "@/types";
import { useAuth } from "@/auth/AuthContext";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  openingBalance: z.coerce.number(),
  currency: z.string().min(3).max(3),
  institution: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AccountsPage() {
  const accounts = useAccounts();
  const { user } = useAuth();
  const createAcct = useCreateAccount();
  const updateAcct = useUpdateAccount();
  const deleteAcct = useDeleteAccount();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const openAdd = () => {
    setEditing(null);
    reset({ name: "", type: "bank", openingBalance: 0, currency: user?.currency || "USD", institution: "" });
    setModalOpen(true);
  };

  const openEdit = (acct: Account) => {
    setEditing(acct);
    reset({
      name: acct.name,
      type: acct.type,
      openingBalance: acct.openingBalance ?? 0,
      currency: acct.currency || "USD",
      institution: acct.institution || "",
    });
    setModalOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = cleanPayload(values);
      if (editing) {
        await updateAcct.mutateAsync({ id: editing._id, ...payload });
        toast.success("Account updated");
      } else {
        await createAcct.mutateAsync(payload);
        toast.success("Account created");
      }
      setModalOpen(false);
    } catch (err) { toast.error(apiError(err)); }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAcct.mutateAsync(deleteId);
      toast.success("Account deleted");
      setDeleteId(null);
    } catch (err) { toast.error(apiError(err)); }
  };

  if (accounts.isLoading) return <GridPageSkeleton />;
  if (accounts.isError) return <ErrorState message={apiError(accounts.error)} onRetry={() => accounts.refetch()} />;

  const data = accounts.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Accounts</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage your bank accounts and wallets.</p>
        </div>
        <AppButton onClick={openAdd}><Plus className="h-4 w-4" /> Add account</AppButton>
      </div>

      {data.length === 0 ? (
        <EmptyState icon={Wallet} title="No accounts yet" description="Create your first account to start tracking." action={<AppButton onClick={openAdd} size="sm"><Plus className="h-4 w-4" /> Add</AppButton>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((acct) => (
            <Card key={acct._id}>
              <CardHeader
                title={acct.name}
                subtitle={acct.type}
                action={
                  <div className="flex gap-1">
                    <AppButton size="icon" variant="ghost" onClick={() => openEdit(acct)}><Pencil className="h-3.5 w-3.5" /></AppButton>
                    <AppButton size="icon" variant="ghost" onClick={() => setDeleteId(acct._id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></AppButton>
                  </div>
                }
              />
              <CardBody>
                <p className="text-2xl font-semibold tracking-tight text-foreground">{formatCurrency(acct.currentBalance ?? 0, acct.currency)}</p>
                {acct.institution && <p className="mt-1 text-xs text-muted-foreground">{acct.institution}</p>}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
        title="Delete account?"
        description="If this account has no transactions it will be deleted. Otherwise, archive it from the edit form."
        loading={deleteAcct.isPending}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Account" : "New Account"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AppInput label="Name" error={errors.name?.message} {...register("name")} />
          <AppSelect label="Type" error={errors.type?.message} {...register("type")}>
            <option value="bank">Bank</option>
            <option value="cash">Cash</option>
            <option value="credit_card">Credit Card</option>
            <option value="investment">Investment</option>
            <option value="loan">Loan</option>
            <option value="wallet">Wallet</option>
            <option value="other">Other</option>
          </AppSelect>
          <AppInput label="Opening Balance" type="number" step="0.01" error={errors.openingBalance?.message} {...register("openingBalance")} />
          <AppInput label="Currency" maxLength={3} error={errors.currency?.message} {...register("currency")} />
          <AppInput label="Institution" {...register("institution")} />
          <div className="flex justify-end gap-2">
            <AppButton variant="secondary" onClick={() => setModalOpen(false)}>Cancel</AppButton>
            <AppButton type="submit" loading={createAcct.isPending || updateAcct.isPending}>{editing ? "Update" : "Create"}</AppButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
