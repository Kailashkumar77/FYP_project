"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  KanbanSquare,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StageBadge, ScoreBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { api, Lead } from "@/lib/api";

const STAGES = ["All", "New", "Contacted", "Proposal Sent", "Negotiation", "Won", "Lost"];

export default function LeadsPage() {
  const { success, error } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStage, setSelectedStage] = useState("All");

  // Delete modal state
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (selectedStage !== "All") params.stage = selectedStage;

      const res = await api.get("/leads", { params });
      setLeads(res.data.items);
      setTotal(res.data.total);
    } catch (err: any) {
      error("Failed to load leads from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [selectedStage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleDelete = async () => {
    if (!leadToDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/leads/${leadToDelete.id}`);
      success(`Lead '${leadToDelete.company_name}' archived successfully.`);
      setLeadToDelete(null);
      fetchLeads();
    } catch (err: any) {
      error(err.response?.data?.detail || "Failed to delete lead.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <KanbanSquare className="w-6 h-6 text-blue-600" /> Lead Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse, search, edit, and qualify B2B sales leads stored in PostgreSQL.
          </p>
        </div>
        <Link href="/leads/new">
          <Button size="sm">
            <Plus className="w-4 h-4" /> Add New Lead
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by company or contact name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
          </form>

          {/* Stage Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {STAGES.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStage(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedStage === st
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Active Prospects ({total})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Company</th>
                  <th className="py-3 px-6">Primary Contact</th>
                  <th className="py-3 px-6">Budget</th>
                  <th className="py-3 px-6">Stage</th>
                  <th className="py-3 px-6">Predicted Score</th>
                  <th className="py-3 px-6">Source</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                      Loading leads from database...
                    </td>
                  </tr>
                ) : leads.length > 0 ? (
                  leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/75 transition-colors group"
                    >
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {lead.company_name}
                      </td>
                      <td className="py-4 px-6 text-xs">
                        <p className="font-medium text-slate-800">{lead.contact_name}</p>
                        <p className="text-slate-400 text-[11px]">{lead.contact_email}</p>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-900 text-xs">
                        ${lead.budget.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <StageBadge stage={lead.stage} />
                      </td>
                      <td className="py-4 px-6">
                        <ScoreBadge score={lead.score} />
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {lead.lead_source}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit details"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setLeadToDelete(lead)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Archive / Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                      No matching leads found in this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!leadToDelete}
        onClose={() => setLeadToDelete(null)}
        title="Confirm Lead Deletion"
        description="Are you sure you want to archive this lead?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Soft-Deletion / Archive</p>
              <p className="mt-1 text-rose-700">
                Archiving <strong>{leadToDelete?.company_name}</strong> will remove it from active lists and dashboard calculations while preserving historical audit logs.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLeadToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleting}
              onClick={handleDelete}
            >
              Confirm Archive
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
