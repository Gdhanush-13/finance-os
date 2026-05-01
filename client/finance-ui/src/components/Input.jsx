import { forwardRef } from "react";
import { Input as ShadcnInput } from "./ui/input";

const Input = forwardRef(function Input(
  { label, error, className, hint, ...rest },
  ref
) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-sm font-medium text-slate-700">
          {label}
        </span>
      )}
      <ShadcnInput
        ref={ref}
        className={className}
        style={error ? { borderColor: "var(--destructive)" } : {}}
        {...rest}
      />
      {error && (
        <span className="mt-1 block text-xs text-rose-600">{error}</span>
      )}
      {hint && !error && (
        <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      )}
    </label>
  );
});

export default Input;
