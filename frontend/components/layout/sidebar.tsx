"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  UserCheck,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: KanbanSquare },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "My Profile", href: "/profile", icon: UserCheck },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 text-slate-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
            IntelliCRM <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">AI</span>
          </span>
          <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">B2B Agency Platform</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          CRM Core
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
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              <Icon
                className={clsx(
                  "w-5 h-5 shrink-0 transition-colors",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                )}
              />
              {item.name}
            </Link>
          );
        })}

        <div className="pt-6 px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Planned GenAI (FYP-I)
        </div>
        <div className="px-3 py-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-400 space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold">
            <Zap className="w-4 h-4" /> Gemini GenAI Engine
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Post-midterm modules: Sentiment analysis, meeting summaries & auto-email follow-ups.
          </p>
        </div>
      </nav>

      {/* Workspace Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800/50">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
            AP
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">Apex Software</p>
            <p className="text-[10px] text-emerald-400 font-medium">PostgreSQL Connected</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
