"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  UserCheck,
  Building2,
  Settings,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pipeline", href: "/pipeline", icon: KanbanSquare },
  { name: "Leads", href: "/leads", icon: KanbanSquare },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Agency Sign Up", href: "/agency-registration", icon: Building2 },
  { name: "Team & Roles", href: "/team", icon: UserCheck },
  { name: "My Profile", href: "/profile", icon: UserCheck },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [agencyName, setAgencyName] = React.useState<string>("Apex Software");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("intellicrm_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.tenant?.name) {
            setAgencyName(parsed.tenant.name);
          }
        } catch {
          // ignore
        }
      }
    }
  }, []);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 text-slate-700 shadow-xs">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center p-1.5 shadow-xs shrink-0">
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
            <path
              d="M16 6L25 11V21L16 26L7 21V11L16 6Z"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 6V16M16 16L25 21M16 16L7 21"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="16" r="2.2" fill="#FFFFFF" />
          </svg>
        </div>
        <div>
          <span className="font-bold text-slate-900 text-base tracking-tight flex items-center gap-1.5">
            IntelliCRM <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">AI</span>
          </span>
          <span className="text-[10px] text-slate-500 block -mt-0.5 font-medium">B2B Agency Platform</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-amber-500 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              )}
            >
              <Icon
                className={clsx(
                  "w-5 h-5 shrink-0 transition-colors",
                  isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Workspace Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center font-bold text-xs uppercase">
            {agencyName.substring(0, 2)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-900 truncate">{agencyName}</p>
            <p className="text-[10px] text-emerald-600 font-medium">Connected</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
