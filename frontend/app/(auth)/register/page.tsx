"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  Building,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [agencyName, setAgencyName] = useState("");
  const [agencySlug, setAgencySlug] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAgencyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAgencyName(val);
    setAgencySlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        agency_name: agencyName.trim(),
        agency_slug: agencySlug.trim() || undefined,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      const { access_token, user } = res.data;
      localStorage.setItem("intellicrm_token", access_token);
      localStorage.setItem("intellicrm_user", JSON.stringify(user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to register agency workspace. Please check your inputs."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f9] flex flex-col justify-between items-center px-4 py-8 sm:py-12 selection:bg-blue-100 font-sans">
      <div className="w-full flex-1 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white rounded-[28px] border border-[#e1e3e1] shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)] flex flex-col overflow-hidden">
          
          <div className="p-8 sm:p-12 md:p-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
              
              {/* Left Column: Branding & Value Proposition */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-[#1f1f1f]">
                      IntelliCRM <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">AI</span>
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-normal text-[#1f1f1f] tracking-tight mb-3">
                    Register Agency
                  </h1>
                  <p className="text-sm sm:text-base text-[#444746] font-normal leading-relaxed mb-6">
                    Create a dedicated multi-tenant agency workspace. As the founder, your account is automatically provisioned with <strong>SuperAdmin / Admin</strong> permissions.
                  </p>

                  <div className="space-y-3 pt-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Dedicated PostgreSQL Schema & Data Isolation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Automated 6-Stage Kanban Sales Pipeline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Predictive AI Lead Scoring Engine (0-100%)</span>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block pt-8 text-xs text-[#5e5e5e]">
                  Shaheed Zulfiqar Ali Bhutto Institute of Science and Technology (SZABIST) — FYP-I
                </div>
              </div>

              {/* Right Column: Registration Form */}
              <div className="flex flex-col justify-center">
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Agency Name */}
                  <div>
                    <label className="block text-xs font-medium text-[#444746] mb-1">
                      Agency / Software House Name *
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={agencyName}
                        onChange={handleAgencyNameChange}
                        placeholder="e.g. Apex Software Solutions"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#747775] hover:border-[#1f1f1f] rounded-lg text-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Admin Full Name */}
                  <div>
                    <label className="block text-xs font-medium text-[#444746] mb-1">
                      Admin Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Kelash Kumar"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#747775] hover:border-[#1f1f1f] rounded-lg text-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Admin Email */}
                  <div>
                    <label className="block text-xs font-medium text-[#444746] mb-1">
                      Admin Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@agency.com"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#747775] hover:border-[#1f1f1f] rounded-lg text-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#444746] mb-1">
                        Password (8+ chars) *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-[#747775] hover:border-[#1f1f1f] rounded-lg text-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#444746] mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm"
                          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#747775] hover:border-[#1f1f1f] rounded-lg text-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Register & Launch Workspace <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>
          </div>

          <div className="px-8 sm:px-12 md:px-14 py-4 bg-slate-50 border-t border-[#e1e3e1] flex items-center justify-between text-xs">
            <span className="text-slate-500">Already registered?</span>
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
            >
              Sign in to Workspace <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
