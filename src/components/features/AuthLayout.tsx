"use client";

import type { ReactNode } from "react";
import { Wallet, Sun, Moon, TrendingUp, Shield, PieChart } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";
import { useTheme } from "@/hooks/useTheme";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { dark, toggleTheme } = useTheme();
  const [first, second] = APP_CONFIG.tagline.split(",");

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel — brand / illustration */}
      <aside className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 p-10 text-primary-foreground lg:flex">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 shadow-lg backdrop-blur-sm">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            {APP_CONFIG.name}
          </span>
        </div>

        {/* Tagline */}
        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
            {first?.trim()},
            <br />
            {second?.trim()}
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-primary-foreground/75">
            {APP_CONFIG.description}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 pt-2">
            {[
              { icon: TrendingUp, text: "Smart Analytics" },
              { icon: Shield, text: "Secure & Private" },
              { icon: PieChart, text: "Budget Tracking" },
            ].map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5" />
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-primary-foreground/50">
          &copy; {APP_CONFIG.year} {APP_CONFIG.company}
        </p>
      </aside>

      {/* Right panel — form */}
      <main className="relative flex flex-1 flex-col bg-background">
        {/* Theme toggle — top right */}
        <div className="flex justify-end p-4 lg:p-6">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-border bg-card p-2.5 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        {/* Centered form */}
        <div className="flex flex-1 items-center justify-center px-6 pb-10 lg:px-10">
          <div className="w-full max-w-[420px] pb-safe-bottom">
            {/* Mobile logo */}
            <div className="mb-8 flex items-center gap-2.5 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="text-base font-semibold tracking-tight text-foreground">
                {APP_CONFIG.name}
              </span>
            </div>

            {children}

            {/* Mobile copyright */}
            <p className="mt-8 text-center text-xs text-muted-foreground lg:hidden">
              &copy; {APP_CONFIG.year} {APP_CONFIG.company}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
