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
          <Settings className="w-6 h-6 text-slate-700" /> Workspace Settings
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review system health diagnostics, database connectivity, and planned FYP-I features.
        </p>
      </div>

    

      {/* AI Roadmap (FYP-I Post-Midterm) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <CardTitle>Google Gemini AI Roadmap </CardTitle>
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
