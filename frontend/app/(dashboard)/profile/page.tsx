"use client";

import React, { useEffect, useState } from "react";
import { User, Shield, Mail, Phone, Calendar, Building, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { api, UserProfile } from "@/lib/api";

export default function ProfilePage() {
  const { success, error } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/me");
      setProfile(res.data);
      setFormData({
        full_name: res.data.full_name || "",
        phone: res.data.phone || "",
      });
    } catch (err: any) {
      error("Failed to load user profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch("/users/me", formData);
      setProfile(res.data);

      // Update localStorage cached user
      const raw = localStorage.getItem("intellicrm_user");
      if (raw) {
        const u = JSON.parse(raw);
        localStorage.setItem(
          "intellicrm_user",
          JSON.stringify({ ...u, full_name: res.data.full_name, phone: res.data.phone })
        );
      }

      success("Profile updated successfully in PostgreSQL database!");
    } catch (err: any) {
      error(err.response?.data?.detail || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          User Profile & Security
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account credentials, contact information, and workspace role.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-blue-500/20">
            {profile?.full_name ? profile.full_name[0].toUpperCase() : "U"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {profile?.full_name}
            </h3>
            <p className="text-xs text-slate-500 font-medium">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Shield className="w-3.5 h-3.5" />
                {profile?.role?.replace("_", " ")}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified Account
              </span>
            </div>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6 text-xs text-slate-500 space-y-1">
          <p>
            Agency Workspace: <strong className="text-slate-800">Apex Software Solutions</strong>
          </p>
          <p>
            Database Mode: <strong className="text-emerald-600 font-semibold">PostgreSQL</strong>
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                name="full_name"
                required
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                }
              />
              <Input
                label="Contact Phone"
                name="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="+92 300 1234567"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Email Address (Fixed)
                </label>
                <input
                  type="text"
                  disabled
                  value={profile?.email || ""}
                  className="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Assigned RBAC Role (Fixed)
                </label>
                <input
                  type="text"
                  disabled
                  value={profile?.role || ""}
                  className="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end">
          <Button type="submit" isLoading={saving}>
            <Save className="w-4 h-4 mr-1.5" /> Save Changes to PostgreSQL
          </Button>
        </div>
      </form>
    </div>
  );
}
