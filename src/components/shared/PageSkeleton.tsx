import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border/70 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="border-b border-border/60 px-5 py-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-1.5 h-3 w-40" />
      </div>
      <div className="flex h-72 items-end gap-3 p-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="text-right space-y-1.5">
        <Skeleton className="ml-auto h-3.5 w-16" />
        <Skeleton className="ml-auto h-4 w-12 rounded-full" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="border-b border-border/60 px-5 py-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-1.5 h-3 w-48" />
      </div>
      <div className="divide-y divide-border px-5">
        {Array.from({ length: rows }).map((_, i) => (
          <ListRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function GridCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-6 w-12 rounded" />
      </div>
      <Skeleton className="mt-4 h-6 w-28" />
      <Skeleton className="mt-3 h-2 w-full rounded-full" />
      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <ChartSkeleton />
      </div>
      <ListSkeleton rows={5} />
    </div>
  );
}

export function TablePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>
      <ListSkeleton rows={8} />
    </div>
  );
}

export function GridPageSkeleton({ cols = 3 }: { cols?: number }) {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>
      <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-${cols}`}>
        {Array.from({ length: cols * 2 }).map((_, i) => (
          <GridCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
