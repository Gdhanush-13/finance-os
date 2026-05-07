import type { ReactNode } from "react";
import {
  Card as ShadcnCard,
  CardHeader as ShadcnCardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <ShadcnCard
      className={cn(
        "border-border/70 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className
      )}
    >
      {children}
    </ShadcnCard>
  );
}

interface CardHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <ShadcnCardHeader
      className={cn(
        "flex flex-row items-start justify-between gap-3 space-y-0 border-b border-border/60 px-5 py-4",
        className
      )}
    >
      <div className="space-y-1">
        <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </CardTitle>
        {subtitle && (
          <CardDescription className="text-xs text-muted-foreground">
            {subtitle}
          </CardDescription>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </ShadcnCardHeader>
  );
}

export function CardBody({ className, children }: CardProps) {
  return <CardContent className={cn("p-5", className)}>{children}</CardContent>;
}
