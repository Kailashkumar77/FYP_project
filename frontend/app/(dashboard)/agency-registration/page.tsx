"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  Plus,
  ShieldCheck,
  Globe,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building,
  Key,
  Users,
  Briefcase,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";

interface AgencyTenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
}

export default function AgencyRegistrationPage() {
  const { success, error } = useToast();
  const [agencies, setAgencies] = useState<AgencyTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields for dynamic agency registration
  const [agencyName, setAgencyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("Admin2026!");

  const fetchCurrentAgency = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/me");
      if (res.data?.tenant) {
        setAgencies([res.data.tenant]);
      }
    } catch (err: any) {
      error("Failed to load workspace data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentAgency();
  }, []);

  const handleRegisterAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.post("/auth/register", {
        agency_name: agencyName.trim(),
        full_name: adminName.trim(),
        email: adminEmail.trim().toLowerCase(),
        password: adminPassword,
      });

      success(`Agency '${agencyName}' and Admin account registered dynamically in PostgreSQL!`);
      setRegisterModalOpen(false);
      setAgencyName("");
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("Admin2026!");

      if (res.data?.tenant) {
        setAgencies((prev) => [res.data.tenant, ...prev]);
      }
    } catch (err: any) {
      error(err.response?.data?.detail || "Failed to register new agency workspace.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-indigo-600" /> Agency Registration 
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Multi-Tenant Workspace Provisioning: Dynamically register software house agencies & primary Admin accounts.
          </p>
        </div>

        <Button
          onClick={() => setRegisterModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold border border-amber-500 shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-white" /> Register New Agency
        </Button>
      </div>


      {/* Registered Agencies Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-semibold text-slate-800">
            Registered Agency Workspaces
          </CardTitle>
        
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400">Loading agency records...</div>
          ) : agencies.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">No agency registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Agency Workspace</th>
                    <th className="px-6 py-3.5">Workspace Slug</th>
                    <th className="px-6 py-3.5">Subscription Plan</th>
                    <th className="px-6 py-3.5">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {agencies.map((agency) => (
                    <tr key={agency.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
                            {agency.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{agency.name}</p>
                            <p className="text-xs text-slate-400">Enterprise Agency</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <code className="text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono">
                          {agency.slug}
                        </code>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {agency.plan || "PRO"}
                        </span>
                      </td>

                    

                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(agency.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for Registering a New Agency & Admin Dynamically */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Register New Agency & Admin"
      >
        <form onSubmit={handleRegisterAgency} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Agency Name *
            </label>
            <Input
              required
              placeholder="e.g. Nexus Software Solutions"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Founder / Primary Admin Full Name *
            </label>
            <Input
              required
              placeholder="e.g. Kelash Kumar"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Admin Email Address *
            </label>
            <Input
              required
              type="email"
              placeholder="e.g. kelash@nexus.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Initial Password *
            </label>
            <Input
              required
              minLength={8}
              type="text"
              placeholder="Minimum 8 characters"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRegisterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {submitting ? "Registering..." : "Register Agency"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
