import { useState } from "react";
import { Download, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { useAccounts } from "../hooks/useAccounts";
import { Card, CardBody, CardHeader } from "../components/Card";
import Button from "../components/Button";
import Select from "../components/Select";
import LoadingScreen from "../components/LoadingScreen";
import { api, apiError, getToken } from "../lib/api";

export default function ImportExport() {
  const accounts = useAccounts();
  const [accountId, setAccountId] = useState("");
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const onImport = async (e) => {
    e.preventDefault();
    if (!file || !accountId) return;
    setImporting(true);
    setResult(null);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("accountId", accountId);
      const res = await api.post("/transactions-io/csv", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data.data);
      toast.success(`Imported ${res.data.data.imported} transactions`);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setImporting(false);
    }
  };

  const onExport = async () => {
    try {
      const res = await api.get("/transactions-io/csv", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `finance-os-transactions-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const onTemplate = () => {
    const base = (import.meta.env.VITE_API_BASE_URL || "") + "/api/transactions-io/template";
    const token = getToken();
    fetch(base, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((b) => {
        const url = window.URL.createObjectURL(b);
        const a = document.createElement("a");
        a.href = url;
        a.download = "finance-os-template.csv";
        a.click();
        window.URL.revokeObjectURL(url);
      });
  };

  if (accounts.isLoading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Import / Export</h2>
        <p className="text-sm text-slate-500">
          Bring in transactions from CSV or download a backup of your data.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Import CSV" subtitle="Upload a CSV to bulk add transactions" />
          <CardBody>
            <form onSubmit={onImport} className="space-y-4">
              <Select
                label="Target account"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                <option value="">Select account</option>
                {(accounts.data || []).map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </Select>
              <label className="block text-sm font-medium text-slate-700">
                CSV file
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </label>
              <div className="flex gap-2">
                <Button type="submit" loading={importing} disabled={!file || !accountId}>
                  <Upload className="h-4 w-4" /> Import
                </Button>
                <Button type="button" variant="secondary" onClick={onTemplate}>
                  <FileText className="h-4 w-4" /> Download template
                </Button>
              </div>
            </form>

            {result && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                <p className="font-medium text-slate-900">
                  Imported {result.imported}, skipped {result.skipped}
                </p>
                {result.errors?.length > 0 && (
                  <ul className="mt-2 max-h-40 overflow-y-auto text-xs text-rose-600">
                    {result.errors.slice(0, 20).map((e, i) => (
                      <li key={i}>
                        Row {e.row}: {e.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Export CSV" subtitle="Download all your transactions" />
          <CardBody>
            <p className="text-sm text-slate-600">
              Export all of your transactions as a CSV file. Useful for taxes, backups
              or importing into another tool.
            </p>
            <Button className="mt-4" onClick={onExport}>
              <Download className="h-4 w-4" /> Download all transactions
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
