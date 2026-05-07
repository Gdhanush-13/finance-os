"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

interface AppButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children?: ReactNode;
}

const variantMap: Record<Variant, "default" | "outline" | "destructive" | "ghost" | "secondary"> = {
  primary: "default",
  secondary: "secondary",
  outline: "outline",
  danger: "destructive",
  ghost: "ghost",
};

const sizeMap: Record<Size, "sm" | "default" | "lg" | "icon"> = {
  sm: "sm",
  md: "default",
  lg: "lg",
  icon: "icon",
};

const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(function AppButton(
  { variant = "primary", size = "md", loading = false, className, children, disabled, type = "button", ...rest },
  ref
) {
  return (
    <ShadcnButton
      ref={ref}
      type={type}
      disabled={disabled || loading}
      variant={variantMap[variant]}
      size={sizeMap[size]}
      className={cn("gap-2 font-medium", className)}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </ShadcnButton>
  );
});

export default AppButton;
