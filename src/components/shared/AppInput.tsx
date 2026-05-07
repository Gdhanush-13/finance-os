"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { Input as ShadcnInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
  hint?: string;
}

const AppInput = forwardRef<HTMLInputElement, AppInputProps>(function AppInput(
  { label, error, hint, className, ...rest },
  ref
) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-foreground">{label}</span>
      )}
      <ShadcnInput
        ref={ref}
        className={cn(
          "h-9 bg-card",
          error && "border-destructive focus-visible:ring-destructive/30",
          className
        )}
        {...rest}
      />
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
      {hint && !error && (
        <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      )}
    </label>
  );
});

export default AppInput;
