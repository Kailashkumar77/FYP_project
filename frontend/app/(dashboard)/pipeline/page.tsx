"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  KanbanSquare,
  Plus,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Building,
  User,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScoreBadge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { api, Lead } from "@/lib/api";

const STAGE_ORDER = [
  "New",
  "Contacted",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];

const STAGE_COLORS: Record<string, { bg: string; border: string; text: string; headerBg: string }> = {
  New: { bg: "bg-blue-50/50", border: "border-blue-200", text: "text-blue-700", headerBg: "bg-blue-100/60" },
  Contacted: { bg: "bg-purple-50/50", border: "border-purple-200", text: "text-purple-700", headerBg: "bg-purple-100/60" },
  "Proposal Sent": { bg: "bg-amber-50/50", border: "border-amber-200", text: "text-amber-700", headerBg: "bg-amber-100/60" },
  Negotiation: { bg: "bg-indigo-50/50", border: "border-indigo-200", text: "text-indigo-700", headerBg: "bg-indigo-100/60" },
  Won: { bg: "bg-emerald-50/50", border: "border-emerald-200", text: "text-emerald-700", headerBg: "bg-emerald-100/60" },
  Lost: { bg: "bg-rose-50/50", border: "border-rose-200", text: "text-rose-700", headerBg: "bg-rose-100/60" },
};

export default function PipelinePage() {
  const { success, error } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get("/leads", { params: { limit: 100 } });
      setLeads(res.data.items);
    } catch (err: any) {
      error("Failed to load sales pipeline leads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const moveStage = async (lead: Lead, direction: "next" | "prev") => {
    const currentIndex = STAGE_ORDER.indexOf(lead.stage);
    if (currentIndex === -1) return;

    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0 || newIndex >= STAGE_ORDER.length) return;

    const targetStage = STAGE_ORDER[newIndex];
    setUpdatingLeadId(lead.id);

    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, stage: targetStage } : l))
    );

    try {
      await api.patch(`/leads/${lead.id}`, { stage: targetStage });
      success(`Moved '${lead.company_name}' to ${targetStage}`);
    } catch (err: any) {
      error("Failed to transition pipeline stage. Rolling back.");
      fetchLeads();
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.budget || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <KanbanSquare className="w-6 h-6 text-indigo-600" /> Kanban Sales Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visual pipeline representation across stages. Real-time stage progression & AI predictive win scoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 shadow-sm">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-900">
              ${totalPipelineValue.toLocaleString()}
            </span>{" "}
            total deal volume
          </div>

          <Link href="/leads/new">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold border border-amber-500 shadow-xs flex items-center gap-2">
              <Plus className="w-4 h-4 text-white" /> Add Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* Kanban Board Columns */}
      {loading ? (
        <div className="p-16 text-center text-sm text-slate-400">Loading pipeline board...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-6">
          {STAGE_ORDER.map((stageName, stageIdx) => {
            const stageLeads = leads.filter(
              (l) => l.stage.toLowerCase() === stageName.toLowerCase()
            );
            const stageValue = stageLeads.reduce((acc, l) => acc + (l.budget || 0), 0);
            const colors = STAGE_COLORS[stageName] || STAGE_COLORS.New;

            return (
              <div
                key={stageName}
                className="flex flex-col bg-slate-100/70 border border-slate-200/80 rounded-2xl p-3 min-w-[240px] max-w-full"
              >
                {/* Column Header */}
                <div className={`p-2.5 rounded-xl ${colors.headerBg} border ${colors.border} mb-3`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${colors.text} uppercase tracking-wider`}>
                      {stageName}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 shadow-xs">
                      {stageLeads.length}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-600 mt-1">
                    ${stageValue.toLocaleString()}
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 min-h-[300px]">
                  {stageLeads.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 p-3 text-center">
                      No deals in {stageName}
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/leads/${lead.id}`}
                              className="font-semibold text-xs text-slate-900 group-hover:text-blue-600 line-clamp-1"
                            >
                              {lead.company_name}
                            </Link>
                            <ScoreBadge score={lead.score} />
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{lead.contact_name}</span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                            <span className="font-bold text-slate-800">
                              ${lead.budget?.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                              Fit: {lead.domain_fit}/5
                            </span>
                          </div>
                        </div>

                        {/* Interactive Move Stage Controls */}
                        <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                          <button
                            type="button"
                            disabled={stageIdx === 0 || updatingLeadId === lead.id}
                            onClick={() => moveStage(lead, "prev")}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move to previous stage"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>

                          <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">
                            Move Deal
                          </span>

                          <button
                            type="button"
                            disabled={stageIdx === STAGE_ORDER.length - 1 || updatingLeadId === lead.id}
                            onClick={() => moveStage(lead, "next")}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Advance to next stage"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
