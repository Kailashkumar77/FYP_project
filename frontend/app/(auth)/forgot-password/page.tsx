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
    <div className="min-h-screen bg-[#f0f4f9] flex flex-col justify-between items-center px-4 py-8 sm:py-12 selection:bg-blue-100 font-sans">
      <div className="w-full flex-1 flex items-center justify-center">
        <div className="w-full max-w-xl bg-white rounded-[28px] border border-[#e1e3e1] shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)] flex flex-col overflow-hidden">
          
          <div className="p-8 sm:p-10 md:p-12">
            {/* Header Brand */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#1f1f1f]">
                IntelliCRM <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">AI</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1f1f1f] tracking-tight mb-2">
              Reset your password
            </h1>
            <p className="text-sm text-[#444746] font-normal leading-relaxed mb-6">
              Enter the email address or username associated with your workspace account, and we'll send a secure password reset link.
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
                  <label className="block text-xs font-medium text-[#444746] mb-1.5">
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
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-[#747775] hover:border-[#1f1f1f] rounded-lg text-[#1f1f1f] placeholder:text-[#8e918f] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    For superAdmin, test reset email is routed to sahilkhiyatani25@gmail.com
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Reset Instructions <ArrowRight className="w-4 h-4" />
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
                    A password reset link has been dispatched to the account email. If the email is registered in your agency workspace, please check the inbox.
                  </p>
                </div>

                {resetLink && (
                  <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 space-y-2">
                    <p className="font-semibold text-blue-950">Development / Local Link:</p>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      For quick testing in development without email delays, click directly:
                    </p>
                    <a
                      href={resetLink}
                      className="inline-block font-semibold text-blue-700 hover:text-blue-900 underline break-all text-xs"
                    >
                      {resetLink}
                    </a>
                  </div>
                )}

                <div className="pt-2">
                  <Link
                    href="/login"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-all"
                  >
                    Return to Login
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="px-8 sm:px-10 md:px-12 py-4 bg-slate-50 border-t border-[#e1e3e1] flex items-center justify-between text-xs">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700 hover:underline"
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
