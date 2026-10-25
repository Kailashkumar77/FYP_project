import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
          variants[variant],
          className
        )
      )}
    >
      {children}
    </span>
  );
}

export function StageBadge({ stage }: { stage: string }) {
  const lower = stage.toLowerCase();
  if (lower === "won") return <Badge variant="success">Won</Badge>;
  if (lower === "lost") return <Badge variant="danger">Lost</Badge>;
  if (lower === "negotiation") return <Badge variant="purple">Negotiation</Badge>;
  if (lower === "proposal sent") return <Badge variant="info">Proposal Sent</Badge>;
  if (lower === "contacted") return <Badge variant="warning">Contacted</Badge>;
  return <Badge variant="default">{stage}</Badge>;
}

export function ScoreBadge({ score }: { score: number }) {
  if (score >= 80) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        {score.toFixed(0)}% • Hot
      </span>
    );
  }
  if (score >= 60) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {score.toFixed(0)}% • Warm
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      {score.toFixed(0)}% • Cold
    </span>
  );
}
