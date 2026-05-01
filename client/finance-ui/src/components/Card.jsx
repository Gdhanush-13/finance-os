import { classNames } from "../lib/format";
import {
  Card as ShadcnCard,
  CardHeader as ShadcnCardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";

export function Card({ className, children }) {
  return <ShadcnCard className={className}>{children}</ShadcnCard>;
}

export function CardHeader({ title, action, subtitle }) {
  return (
    <ShadcnCardHeader className="flex flex-row items-start justify-between border-b border-slate-100 px-5 py-4">
      <div className="space-y-1">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {subtitle && <CardDescription className="text-xs">{subtitle}</CardDescription>}
      </div>
      {action && <div>{action}</div>}
    </ShadcnCardHeader>
  );
}

export function CardBody({ className, children }) {
  return <CardContent className={classNames("p-5", className)}>{children}</CardContent>;
}
