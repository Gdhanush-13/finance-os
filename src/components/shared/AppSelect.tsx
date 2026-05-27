"use client";

import { forwardRef, type SelectHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  error?: string;
  children: ReactNode;
}

const AppSelect = forwardRef<HTMLSelectElement, AppSelectProps>(function AppSelect(
  { label, error, className, children, ...rest },
  ref
) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-foreground">{label}</span>
      )}
      <select
        ref={ref}
        className={cn(
          "flex h-9 w-full appearance-none rounded-md border border-input bg-card px-3 py-1 text-sm text-foreground shadow-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive/30",
          className
        )}
        {...rest}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
});

export default AppSelect;
