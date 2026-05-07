"use client";

import type { ReactNode } from "react";
import { Wallet } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const [first, second] = APP_CONFIG.tagline.split(",");
  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex"
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 0, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0, transparent 40%)",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            {APP_CONFIG.name}
          </span>
        </div>
        <div className="relative">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            {first?.trim()},
            <br /> {second?.trim()}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/80">
            {APP_CONFIG.description}
          </p>
        </div>
        <p className="relative text-xs text-primary-foreground/70">
          © {APP_CONFIG.year} {APP_CONFIG.company}
        </p>
      </aside>
      <main className="flex flex-1 items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
