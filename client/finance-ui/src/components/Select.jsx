import { forwardRef } from "react";
import { classNames } from "../lib/format";

const Select = forwardRef(function Select(
  { label, error, className, children, ...rest },
  ref
) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-sm font-medium text-slate-700">
          {label}
        </span>
      )}
      <select
        ref={ref}
        className={classNames(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          error ? "border-destructive focus-visible:ring-destructive" : "",
          className
        )}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <span className="mt-1 block text-xs text-destructive">{error}</span>
      )}
    </label>
  );
});

export default Select;
