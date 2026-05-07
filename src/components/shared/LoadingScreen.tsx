import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  label?: string;
}

export default function LoadingScreen({ label = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="flex h-full min-h-[60vh] w-full items-center justify-center text-muted-foreground">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}
