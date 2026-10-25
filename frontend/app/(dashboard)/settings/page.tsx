"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  Shield,
  Database,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [health, setHealth] = useState<any>(null);
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const [hRes, dbRes] = await Promise.all([
        api.get("/health"),
        api.get("/health/db"),
      ]);
      setHealth(hRes.data);
      setDbHealth(dbRes.data);
    } catch (err) {
      console.error("Health check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-slate-700" /> Workspace Settings & Architecture
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review system health diagnostics, database connectivity, and planned FYP-I features.
        </p>
      </div>

      {/* Workspace Information */}
      <Card>
        <CardHeader>
          <CardTitle>Agency Workspace Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 font-semibold uppercase block mb-1">
                Workspace Name
              </span>
              <p className="font-bold text-slate-900 text-sm">
                Apex Software Solutions
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 font-semibold uppercase block mb-1">
                Tenant Slug
              </span>
              <p className="font-bold text-slate-900 text-sm">
                apex-software
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 font-semibold uppercase block mb-1">
                Subscription Plan
              </span>
              <p className="font-bold text-blue-600 text-sm">
                PRO • B2B Multi-Tenant
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health Diagnostics */}
      <Card>
        <CardHeader>
          <CardTitle>System & Database Diagnostics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200/90 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">FastAPI Application Service</p>
                <p className="text-slate-500 mt-0.5">Status: <span className="text-emerald-600 font-semibold">{health?.status || "Running"}</span></p>
                <p className="text-slate-400 text-[11px] mt-1">Environment: {health?.environment || "Development"}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/90 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">Database Engine Connectivity</p>
                <p className="text-slate-500 mt-0.5">Status: <span className="text-emerald-600 font-semibold">{dbHealth?.database || "Connected"}</span></p>
                <p className="text-slate-400 text-[11px] mt-1">Engine: {dbHealth?.engine || "PostgreSQL / SQLite"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Roadmap (FYP-I Post-Midterm) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <CardTitle>Google Gemini AI Roadmap (Post-Midterm)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            The foundation and backend adapter for Google Gemini are decoupled and configured via <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">GEMINI_MODEL=gemini-2.5-flash</code>. Post-midterm features include:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <p className="font-bold text-slate-900">1. Predictive Lead Scoring</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Conversion probability (0–100%) and feature attribution breakdown.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <p className="font-bold text-slate-900">2. Sentiment & Churn Analysis</p>
              <p className="text-[11px] text-slate-500 mt-1">
                DistilBERT / Gemini sentiment classification and manager churn warnings.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <p className="font-bold text-slate-900">3. Meeting Summaries & Drafts</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Transcript-to-task synthesis and tone-selectable client follow-up drafting.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
