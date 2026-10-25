"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Users,
  AlertTriangle,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { api, Client } from "@/lib/api";

export default function ClientsPage() {
  const { success, error } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;

      const res = await api.get("/clients", { params });
      setClients(res.data.items);
      setTotal(res.data.total);
    } catch (err: any) {
      error("Failed to load clients from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients();
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/clients/${clientToDelete.id}`);
      success(`Client '${clientToDelete.company_name}' archived successfully.`);
      setClientToDelete(null);
      fetchClients();
    } catch (err: any) {
      error(err.response?.data?.detail || "Failed to delete client.");
    } finally {
      setDeleting(false);
    }
  };

  const renderChurnBadge = (level: string) => {
    if (level === "HIGH") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          High Churn Risk
        </span>
      );
    }
    if (level === "MEDIUM") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Medium Risk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Low Churn Risk
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600" /> Client Account Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain active client contracts, key stakeholders, and churn risk status in PostgreSQL.
          </p>
        </div>
        <Link href="/clients/new">
          <Button size="sm">
            <Plus className="w-4 h-4" /> Add New Client
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by company, primary contact, or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Client Directory ({total})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Company</th>
                  <th className="py-3 px-6">Primary Contact</th>
                  <th className="py-3 px-6">Industry</th>
                  <th className="py-3 px-6">Churn Risk Level</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                      Loading clients from database...
                    </td>
                  </tr>
                ) : clients.length > 0 ? (
                  clients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-50/75 transition-colors group"
                    >
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {client.company_name}
                      </td>
                      <td className="py-4 px-6 text-xs">
                        <p className="font-medium text-slate-800">{client.primary_contact}</p>
                        <p className="text-slate-400 text-[11px]">{client.contact_email}</p>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                        {client.industry}
                      </td>
                      <td className="py-4 px-6">
                        {renderChurnBadge(client.churn_risk_level)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/clients/${client.id}`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit details"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setClientToDelete(client)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Archive client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                      No matching clients found in this view.
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
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        title="Confirm Client Archival"
        description="Are you sure you want to archive this client record?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Soft-Deletion / Archive</p>
              <p className="mt-1 text-rose-700">
                Archiving <strong>{clientToDelete?.company_name}</strong> will remove it from active directory lists while preserving linked project invoices and communication history.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClientToDelete(null)}
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
