"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ArrowLeft, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
      if (res.data?.reset_link) {
        setResetLink(res.data.reset_link);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "An error occurred while requesting the password reset. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between items-center px-4 py-8 sm:py-12 font-sans">
      <div className="w-full flex-1 flex items-center justify-center">
        <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col overflow-hidden">
          
          <div className="p-8 sm:p-10 md:p-12">
            {/* Header Brand */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center p-2 shadow-xs shrink-0">
                <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
                  <path
                    d="M16 6L25 11V21L16 26L7 21V11L16 6Z"
                    stroke="#FFFFFF"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 6V16M16 16L25 21M16 16L7 21"
                    stroke="#FFFFFF"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="16" cy="16" r="2.2" fill="#FFFFFF" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                IntelliCRM <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">AI</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight mb-2">
              Reset your password
            </h1>
            <p className="text-sm text-slate-600 font-normal leading-relaxed mb-6">
              Enter your username or email address, and we'll generate your password reset link.
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Username or Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="superAdmin or your@agency.com"
                      className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50/50 border border-slate-300 hover:border-slate-400 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:bg-white transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    For superAdmin, test reset email is routed to sahilkhiyatani25@gmail.com
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all border border-amber-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Reset Instructions <ArrowRight className="w-4 h-4 text-white" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Reset instructions dispatched
                  </div>
                  <p className="leading-relaxed">
                    A password reset link has been dispatched to the account email.
                  </p>
                </div>

                {resetLink && (
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-2">
                    <p className="font-semibold text-amber-900">Development / Local Link:</p>
                    <a
                      href={resetLink}
                      className="inline-block font-semibold text-amber-800 hover:text-amber-950 underline break-all text-xs"
                    >
                      {resetLink}
                    </a>
                  </div>
                )}

                <div className="pt-2">
                  <Link
                    href="/login"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-all"
                  >
                    Return to Login
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="px-8 sm:px-10 md:px-12 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-slate-900 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
            <Link
              href="/register"
              className="font-medium text-slate-500 hover:text-slate-800"
            >
              Register Agency
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
