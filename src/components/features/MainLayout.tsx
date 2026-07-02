"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Wallet,
  PiggyBank,
  Target,
  Repeat,
  Tags,
  Upload,
  LogOut,
  Menu,
  X,
  User,
  Sun,
  Moon,
  BarChart2,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/config";
import { useTheme } from "@/hooks/useTheme";
import FloatingActionButton from "@/components/shared/FloatingActionButton";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "Transactions", icon: ArrowRightLeft },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/budgets", label: "Budgets", icon: PiggyBank },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/recurring", label: "Recurring", icon: Repeat },
  { to: "/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/import-export", label: "Import / Export", icon: Upload },
  { to: "/docs", label: "Docs", icon: BookOpen },
];

function isActive(pathname: string, to: string, end?: boolean) {
  if (end) return pathname === to;
  return pathname.startsWith(to);
}

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [openMobile, setOpenMobile] = useState(false);
  const { dark, toggleTheme } = useTheme();

  useEffect(() => {
    document.body.style.overflow = openMobile ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [openMobile]);

  const prefetch = useCallback(
    (href: string) => router.prefetch(href),
    [router]
  );

  const onLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const currentLabel =
    navItems.find((n) => isActive(pathname, n.to, n.end))?.label || "Profile";

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar transition-transform lg:static lg:translate-x-0",
          openMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
              {APP_CONFIG.name}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpenMobile(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(pathname, item.to, item.end);
              return (
                <li key={item.to}>
                  <Link
                    href={item.to}
                    prefetch={true}
                    onClick={() => setOpenMobile(false)}
                    onMouseEnter={() => prefetch(item.to)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
              pathname === "/profile"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </div>
            <div className="flex min-w-0 flex-col text-left">
              <span className="truncate text-xs font-semibold text-sidebar-foreground">
                {user?.name || "Account"}
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {user?.email}
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      {openMobile && (
        <div
          className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={() => setOpenMobile(false)}
        />
      )}

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpenMobile(true)}
              className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {currentLabel}
              </p>
              <h1 className="text-sm font-semibold tracking-tight text-foreground lg:text-base">
                Welcome back, {user?.name?.split(" ")[0] || "there"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:block">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-md p-2 text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <main className={cn("flex-1 px-4 py-6 lg:px-8 lg:py-8", pathname !== "/transactions" ? "pb-28 lg:pb-8" : "pb-6 lg:pb-8")}>
          <div className="mx-auto w-full max-w-7xl animate-in fade-in duration-200">{children}</div>
        </main>
      </div>
      
      {/* Floating Action Button for adding transactions */}
      {pathname !== "/transactions" && (
        <FloatingActionButton
          onClick={() => router.push("/transactions")}
          label="Add Transaction"
        />
      )}
    </div>
  );
}
