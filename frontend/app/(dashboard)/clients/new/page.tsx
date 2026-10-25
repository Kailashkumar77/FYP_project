"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Building, User, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";

export default function NewClientPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    primary_contact: "",
    contact_email: "",
    contact_phone: "",
    industry: "Financial Technology",
    address: "",
    churn_risk_level: "LOW",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/clients", formData);
      success(`Client account '${formData.company_name}' registered successfully.`);
      router.push("/clients");
    } catch (err: any) {
      error(err.response?.data?.detail || "Failed to create client account.");
    } finally {
      setLoading(false);
    }
  };

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

      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Register Client Account</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Establish an active corporate client relationship in PostgreSQL.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company & Stakeholder Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Name *"
                name="company_name"
                required
                value={formData.company_name}
                onChange={handleChange}
                placeholder="e.g. Nexus Financial Inc"
              />
              <Input
                label="Primary Contact Person *"
                name="primary_contact"
                required
                value={formData.primary_contact}
                onChange={handleChange}
                placeholder="e.g. Robert Sterling"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Corporate Email *"
                type="email"
                name="contact_email"
                required
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="billing@nexusfin.com"
              />
              <Input
                label="Phone Number"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
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
                  Initial Churn Risk Rating
                </label>
                <select
                  name="churn_risk_level"
                  value={formData.churn_risk_level}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                  <option value="LOW">Low Risk (Healthy Account)</option>
                  <option value="MEDIUM">Medium Risk (Watchlist)</option>
                  <option value="HIGH">High Risk (Escalated)</option>
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
                placeholder="Suite, Street Address, City, State, ZIP..."
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/clients">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={loading}>
            <Save className="w-4 h-4 mr-1.5" /> Save Client to Database
          </Button>
        </div>
      </form>
    </div>
  );
}
