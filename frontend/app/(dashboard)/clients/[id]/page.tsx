"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Building,
  User,
  Mail,
  Phone,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { api, Client } from "@/lib/api";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error } = useToast();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    primary_contact: "",
    contact_email: "",
    contact_phone: "",
    industry: "IT Services",
    address: "",
    churn_risk_level: "LOW",
  });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/clients/${id}`);
        setClient(res.data);
        setFormData({
          company_name: res.data.company_name,
          primary_contact: res.data.primary_contact,
          contact_email: res.data.contact_email,
          contact_phone: res.data.contact_phone || "",
          industry: res.data.industry,
          address: res.data.address || "",
          churn_risk_level: res.data.churn_risk_level,
        });
      } catch (err: any) {
        error("Failed to load client details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchClient();
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
      const res = await api.patch(`/clients/${id}`, formData);
      setClient(res.data);
      success("Client account updated successfully in database.");
    } catch (err: any) {
      error(err.response?.data?.detail || "Failed to update client account.");
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

  if (!client) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <p className="text-base font-semibold text-slate-800">Client not found</p>
        <Link href="/clients">
          <Button variant="outline" size="sm">
            Return to Clients
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {client.company_name}
          </h2>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
            <span>Primary Contact: <strong>{client.primary_contact}</strong></span>
            <span>•</span>
            <span>Industry: <strong>{client.industry}</strong></span>
          </p>
        </div>
        <div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
              client.churn_risk_level === "HIGH"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : client.churn_risk_level === "MEDIUM"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {client.churn_risk_level} Churn Risk
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Client Account</CardTitle>
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
                label="Primary Contact Person"
                name="primary_contact"
                required
                value={formData.primary_contact}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Corporate Email"
                type="email"
                name="contact_email"
                required
                value={formData.contact_email}
                onChange={handleChange}
              />
              <Input
                label="Phone Number"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Industry Vertical
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                  <option value="Financial Technology">Financial Technology (Fintech)</option>
                  <option value="Healthcare & Biotech">Healthcare & Biotech</option>
                  <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                  <option value="Supply Chain & Logistics">Supply Chain & Logistics</option>
                  <option value="Enterprise SaaS">Enterprise SaaS</option>
                  <option value="EdTech">EdTech</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Churn Risk Level
                </label>
                <select
                  name="churn_risk_level"
                  value={formData.churn_risk_level}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                  <option value="LOW">Low Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="HIGH">High Risk</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Corporate Headquarters Address
              </label>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link href="/clients">
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
