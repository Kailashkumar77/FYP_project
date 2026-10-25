"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Building,
  User,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StageBadge, ScoreBadge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { api, Lead } from "@/lib/api";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error } = useToast();
  const id = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    budget: 0,
    stage: "New",
    domain_fit: 3,
    requirement_clarity: 3,
    lead_source: "Direct",
    notes: "",
  });

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/leads/${id}`);
        setLead(res.data);
        setFormData({
          company_name: res.data.company_name,
          contact_name: res.data.contact_name,
          contact_email: res.data.contact_email,
          contact_phone: res.data.contact_phone || "",
          budget: res.data.budget,
          stage: res.data.stage,
          domain_fit: res.data.domain_fit,
          requirement_clarity: res.data.requirement_clarity,
          lead_source: res.data.lead_source,
          notes: res.data.notes || "",
        });
      } catch (err: any) {
        error("Failed to load lead details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLead();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch(`/leads/${id}`, {
        ...formData,
        budget: parseFloat(formData.budget.toString()) || 0,
        domain_fit: parseInt(formData.domain_fit.toString()),
        requirement_clarity: parseInt(formData.requirement_clarity.toString()),
      });
      setLead(res.data);
      success("Lead updated successfully in database.");
    } catch (err: any) {
      error(err.response?.data?.detail || "Failed to update lead.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-40 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <p className="text-base font-semibold text-slate-800">Lead not found</p>
        <Link href="/leads">
          <Button variant="outline" size="sm">
            Return to Leads
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/leads"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Leads
        </Link>
        <div className="flex items-center gap-2">
          <StageBadge stage={lead.stage} />
          <ScoreBadge score={lead.score} />
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {lead.company_name}
          </h2>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
            <span>Primary Contact: <strong>{lead.contact_name}</strong></span>
            <span>•</span>
            <span>Source: <strong>{lead.lead_source}</strong></span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-medium">Deal Budget</p>
          <p className="text-xl font-bold text-slate-900">
            ${lead.budget.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Editable Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Lead Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                name="company_name"
                required
                value={formData.company_name}
                onChange={handleChange}
              />
              <Input
                label="Contact Person"
                name="contact_name"
                required
                value={formData.contact_name}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Contact Email"
                type="email"
                name="contact_email"
                required
                value={formData.contact_email}
                onChange={handleChange}
              />
              <Input
                label="Contact Phone"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <Input
                label="Budget ($)"
                type="number"
                name="budget"
                min="0"
                step="500"
                value={formData.budget}
                onChange={handleChange}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Pipeline Stage
                </label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Lead Source
                </label>
                <select
                  name="lead_source"
                  value={formData.lead_source}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                  <option value="Inbound Website">Inbound Website</option>
                  <option value="Referral">Client Referral</option>
                  <option value="LinkedIn Outreach">LinkedIn Outreach</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Cold Call">Cold Outreach</option>
                  <option value="Partner">Tech Partner</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Project Scope & Discovery Notes
              </label>
              <textarea
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/leads">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={saving}>
            <Save className="w-4 h-4 mr-1.5" /> Save Changes to PostgreSQL
          </Button>
        </div>
      </form>
    </div>
  );
}
