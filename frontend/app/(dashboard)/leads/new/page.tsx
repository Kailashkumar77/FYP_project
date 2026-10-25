"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Sparkles, Building, User, Mail, Phone, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";

export default function NewLeadPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    budget: "35000",
    domain_fit: 4,
    requirement_clarity: 4,
    lead_source: "Inbound Website",
    stage: "New",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/leads", {
        ...formData,
        budget: parseFloat(formData.budget) || 0,
        domain_fit: parseInt(formData.domain_fit.toString()),
        requirement_clarity: parseInt(formData.requirement_clarity.toString()),
      });

      success(`Lead for '${formData.company_name}' created successfully.`);
      router.push("/leads");
    } catch (err: any) {
      error(err.response?.data?.detail || "Failed to create lead. Please verify all fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/leads"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Leads
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Sales Lead</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record a new prospect in PostgreSQL with automated heuristic scoring.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company & Contact Card */}
        <Card>
          <CardHeader>
            <CardTitle>Organization & Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company / Prospect Name *"
                name="company_name"
                required
                value={formData.company_name}
                onChange={handleChange}
                placeholder="e.g. Acme Health Technologies"
              />
              <Input
                label="Contact Person Name *"
                name="contact_name"
                required
                value={formData.contact_name}
                onChange={handleChange}
                placeholder="e.g. Jane Doe"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Contact Email *"
                type="email"
                name="contact_email"
                required
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="jane@acme.com"
              />
              <Input
                label="Contact Phone"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Opportunity & Scoring Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Opportunity Budget & Domain Alignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Estimated Budget ($) *"
                type="number"
                name="budget"
                required
                min="0"
                step="500"
                value={formData.budget}
                onChange={handleChange}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Initial Pipeline Stage
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
                  Lead Acquisition Source
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Software Agency Domain Fit (1 to 5)
                </label>
                <select
                  name="domain_fit"
                  value={formData.domain_fit}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                  <option value="1">1 - Poor Match (Out of Agency Stack)</option>
                  <option value="2">2 - Fair Match</option>
                  <option value="3">3 - Moderate Match</option>
                  <option value="4">4 - High Match (Core Competency)</option>
                  <option value="5">5 - Perfect Match (Primary Agency Expertise)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Requirement Clarity (1 to 5)
                </label>
                <select
                  name="requirement_clarity"
                  value={formData.requirement_clarity}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                  <option value="1">1 - Extremely Vague Idea</option>
                  <option value="2">2 - Basic Feature List</option>
                  <option value="3">3 - Well-defined Scope</option>
                  <option value="4">4 - Detailed Specifications</option>
                  <option value="5">5 - Full PRD / Wireframes Ready</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Notes & Project Scope Description
              </label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Enter scope details, technical stack preferences, or meeting notes..."
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/leads">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={loading}>
            <Save className="w-4 h-4 mr-1.5" /> Save Lead to Database
          </Button>
        </div>
      </form>
    </div>
  );
}
