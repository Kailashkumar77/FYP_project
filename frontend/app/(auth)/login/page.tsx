"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Lock, User, Eye, EyeOff, Globe } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const { access_token, user } = res.data;

      localStorage.setItem("intellicrm_token", access_token);
      localStorage.setItem("intellicrm_user", JSON.stringify(user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Invalid login credentials. Please check your username and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between items-center px-4 py-8 sm:py-12 font-sans">
      <div className="w-full flex-1 flex items-center justify-center">
        {/* Clean Modern White Card */}
        <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col overflow-hidden">
          
          {/* Main Content Area */}
          <div className="p-8 sm:p-12 md:p-14 pb-8 sm:pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
              
              {/* Left Column: Brand & Title */}
              <div className="flex flex-col justify-between">
                <div>
                  {/* Brand Logo in Yellow */}
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

                  {/* Main Heading & Subtitle */}
                  <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mb-3">
                    Sign in
                  </h1>
                  <p className="text-base text-slate-600 font-normal leading-relaxed">
                    to continue to your IntelliCRM Agency Workspace
                  </p>
                </div>

                <div className="hidden md:block pt-6">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Enterprise B2B CRM powered by Predictive Scoring and Multi-Tenant Sales Pipeline.
                  </p>
                </div>
              </div>

              {/* Right Column: Inputs */}
              <div className="flex flex-col justify-center">
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form id="login-form" onSubmit={handleSubmit} className="space-y-6">
                  {/* Username / Email field */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Username or Email
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="superAdmin or email"
                        className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50/50 border border-slate-300 hover:border-slate-400 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-semibold text-slate-700 hover:text-amber-600 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-11 py-3 text-sm bg-slate-50/50 border border-slate-300 hover:border-slate-400 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Notice Text */}
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Need access to this CRM? Contact your workspace administrator to provision your account.
                  </p>
                </form>
              </div>

            </div>
          </div>

          {/* Divider */}
          <hr className="w-full border-t border-slate-200 m-0" />

          {/* Bottom Card Footer with Yellow Action Button */}
          <div className="px-8 sm:px-12 md:px-14 py-4 sm:py-5 flex items-center justify-end bg-slate-50/50">
            <button
              type="submit"
              form="login-form"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all border border-amber-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Outer Footer */}
      <footer className="w-full max-w-4xl mt-6 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-600">
          <Globe className="w-3.5 h-3.5" />
          <span>English (United States)</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hover:text-slate-600 cursor-pointer">Help</span>
          <span className="hover:text-slate-600 cursor-pointer">Privacy</span>
          <span className="hover:text-slate-600 cursor-pointer">Terms</span>
        </div>
      </footer>
    </div>
  );
}
