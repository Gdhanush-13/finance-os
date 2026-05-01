import { Outlet } from "react-router-dom";
import { Wallet } from "lucide-react";

import { APP_CONFIG } from "../config";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-white">
      <div className="hidden flex-1 flex-col justify-between bg-indigo-600 p-10 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">{APP_CONFIG.name}</span>
        </div>
        <div>
          <h2 className="text-3xl font-semibold leading-snug">
            {APP_CONFIG.tagline.split(",")[0]},
            <br /> {APP_CONFIG.tagline.split(",")[1]}
          </h2>
          <p className="mt-3 max-w-md text-sm text-indigo-100">
            {APP_CONFIG.description}
          </p>
        </div>
        <p className="text-xs text-indigo-100/80">
          (c) {APP_CONFIG.year} {APP_CONFIG.company}
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
