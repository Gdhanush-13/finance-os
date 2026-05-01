import { Loader2 } from "lucide-react";

export default function LoadingScreen({ label = "Loading..." }) {
  return (
    <div className="flex h-full min-h-[60vh] w-full items-center justify-center text-slate-500">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}
