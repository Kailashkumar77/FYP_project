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
    <div className="min-h-screen bg-[#f0f4f9] flex flex-col justify-between items-center px-4 py-8 sm:py-12 selection:bg-blue-100">
      <div className="w-full flex-1 flex items-center justify-center">
        {/* Google-style Dual-Column Split Card */}
        <div className="w-full max-w-4xl bg-white rounded-[28px] border border-[#e1e3e1] shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)] flex flex-col overflow-hidden">
          
          {/* Main Content Area */}
          <div className="p-8 sm:p-12 md:p-14 pb-8 sm:pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
              
              {/* Left Column: Brand, Title & Description (Google Style) */}
              <div className="flex flex-col justify-between">
                <div>
                  {/* Brand Logo / Icon */}
                  <div className="flex items-center gap-2.5 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-[#1f1f1f]">
                      IntelliCRM <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">AI</span>
                    </span>
                  </div>

                  {/* Main Heading & Subtitle */}
                  <h1 className="text-3xl sm:text-4xl font-normal text-[#1f1f1f] tracking-tight mb-3">
                    Sign in
                  </h1>
                  <p className="text-base text-[#444746] font-normal leading-relaxed">
                    to continue to your IntelliCRM Agency Workspace
                  </p>
                </div>

                <div className="hidden md:block pt-6">
                  <p className="text-xs text-[#5e5e5e] leading-relaxed">
                    Enterprise B2B CRM powered by Predictive Scoring and GenAI workflows for Software Houses.
                  </p>
                </div>
              </div>

              {/* Right Column: Username & Password Inputs */}
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
                    <label className="block text-xs font-medium text-[#444746] mb-1.5">
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
                        className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-[#747775] hover:border-[#1f1f1f] rounded-lg text-[#1f1f1f] placeholder:text-[#8e918f] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-[#444746]">
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
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
                        className="w-full pl-10 pr-11 py-3 text-sm bg-white border border-[#747775] hover:border-[#1f1f1f] rounded-lg text-[#1f1f1f] placeholder:text-[#8e918f] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
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
                  <p className="text-xs text-[#444746] leading-relaxed">
                    Need access to this CRM? Contact your workspace administrator or{" "}
                    <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                      register a new agency
                    </Link>.
                  </p>
                </form>
              </div>

            </div>
          </div>

          {/* Continuous Full-Width Horizontal Line */}
          <hr className="w-full border-t border-[#e1e3e1] m-0" />

          {/* Bottom Card Footer with Action Button */}
          <div className="px-8 sm:px-12 md:px-14 py-4 sm:py-5 flex items-center justify-between bg-white">
            <Link
              href="/register"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Sign up as new Agency
            </Link>
            <div className="flex items-center justify-end">
              <button
                type="submit"
                form="login-form"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Next <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Outer Footer (Language / Help / Privacy / Terms) */}
      <footer className="w-full max-w-4xl mt-6 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#444746]">
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-800">
          <Globe className="w-3.5 h-3.5" />
          <span>English (United States)</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hover:text-slate-800 cursor-pointer">Help</span>
          <span className="hover:text-slate-800 cursor-pointer">Privacy</span>
          <span className="hover:text-slate-800 cursor-pointer">Terms</span>
        </div>
      </footer>
    </div>
  );
}
