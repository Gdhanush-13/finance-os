import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { classNames } from "../lib/format";
import { APP_CONFIG } from "../config";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "Transactions", icon: ArrowRightLeft },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/budgets", label: "Budgets", icon: PiggyBank },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/recurring", label: "Recurring", icon: Repeat },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/import-export", label: "Import / Export", icon: Upload },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openMobile, setOpenMobile] = useState(false);

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside
        className={classNames(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0",
          openMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold text-slate-900">
              {APP_CONFIG.name}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpenMobile(false)}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpenMobile(false)}
                  className={({ isActive }) =>
                    classNames(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-100"
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-slate-100 p-3">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              classNames(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              )
            }
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-600">
              <User className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900">
                {user?.name}
              </span>
              <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                {user?.email}
              </span>
            </div>
          </NavLink>
          <button
            type="button"
            onClick={onLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {openMobile && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpenMobile(false)}
        />
      )}

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpenMobile(true)}
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold text-slate-900 lg:text-base">
              Welcome back, {user?.name?.split(" ")[0] || "there"}
            </h1>
          </div>
          <div className="hidden text-xs text-slate-500 sm:block">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
