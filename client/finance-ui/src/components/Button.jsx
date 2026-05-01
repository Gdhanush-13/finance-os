import { Loader2 } from "lucide-react";
import { Button as ShadcnButton } from "./ui/button";

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...rest
}) {
  const variantMap = {
    primary: "default",
    secondary: "outline",
    danger: "destructive",
    ghost: "ghost",
  };
  
  const sizeMap = {
    sm: "sm",
    md: "default",
    lg: "lg",
  };

  return (
    <ShadcnButton
      type="button"
      disabled={disabled || loading}
      variant={variantMap[variant] || "default"}
      size={sizeMap[size] || "default"}
      className={className}
      {...rest}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </ShadcnButton>
  );
}
