"use client";

import { useState, useRef } from "react";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardBody } from "@/components/shared/AppCard";
import AppButton from "@/components/shared/AppButton";
import AppSelect from "@/components/shared/AppSelect";
import EmptyState from "@/components/shared/EmptyState";
import { api, apiError } from "@/lib/api";
import { useAccounts } from "@/hooks/useAccounts";
import type { ImportResult } from "@/types";

export default function ImportExportPage() {
  const accounts = useAccounts();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [accountId, setAccountId] = useState("");
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const onImport = async () => {
    if (!file || !accountId) { toast.error("Select a file and account"); return; }
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("accountId", accountId);
      const res = await api.post("/transactions-io/import", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data.data);
      toast.success(`Imported ${res.data.data?.imported ?? 0} transaction(s)`);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setImporting(false);
    }
  };

  const onExport = async () => {
    setExporting(true);
    try {
      const res = await api.get("/transactions-io/export", { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported successfully");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Import / Export</h2>
        <p className="mt-1 text-sm text-muted-foreground">Import transactions from CSV or export your data.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Import CSV" subtitle="Upload a CSV file with transactions" />
          <CardBody className="space-y-4">
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <AppButton variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4" /> {file ? file.name : "Choose CSV file"}
              </AppButton>
            </div>
            <AppSelect
              label="Link to account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              <option value="">Select account</option>
              {(accounts.data || []).map((a) => (
                <option key={a._id} value={a._id}>{a.name}</option>
              ))}
            </AppSelect>
            <AppButton onClick={onImport} loading={importing} disabled={!file || !accountId}>
              <Upload className="h-4 w-4" /> Import
            </AppButton>

            {result && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
                <p><strong>Imported:</strong> {result.imported}</p>
                <p><strong>Skipped:</strong> {result.skipped}</p>
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-destructive">Errors:</p>
                    <ul className="list-disc pl-5 text-xs text-destructive">
                      {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Export CSV" subtitle="Download all transactions as CSV" />
          <CardBody>
            <EmptyState
              icon={FileSpreadsheet}
              title="Download your data"
              description="Export all transactions to a CSV file for backup or analysis."
              action={
                <AppButton onClick={onExport} loading={exporting}>
                  <Download className="h-4 w-4" /> Export CSV
                </AppButton>
              }
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
