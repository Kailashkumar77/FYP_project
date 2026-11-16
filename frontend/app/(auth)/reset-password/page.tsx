"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No reset token provided. Please request a new password reset link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        new_password: newPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to reset password. The link may have expired or is invalid."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-white rounded-[28px] border border-[#e1e3e1] shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)] flex flex-col overflow-hidden">
      <div className="p-8 sm:p-10 md:p-12">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#1f1f1f]">
            IntelliCRM <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">AI</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1f1f1f] tracking-tight mb-2">
          Set new password
        </h1>
        <p className="text-sm text-[#444746] font-normal leading-relaxed mb-6">
          Please enter and confirm your new secure password.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#444746] mb-1.5">
                New Password (minimum 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-11 py-3 text-sm bg-white border border-[#747775] hover:border-[#1f1f1f] rounded-lg text-[#1f1f1f] placeholder:text-[#8e918f] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#444746] mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-[#747775] hover:border-[#1f1f1f] rounded-lg text-[#1f1f1f] placeholder:text-[#8e918f] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Update Password & Save <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Password Reset Successfully!
              </div>
              <p className="leading-relaxed">
                Your new password has been securely updated and stored. If this was superAdmin, your environment file has been automatically synchronized.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm"
              >
                Go to Sign In <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="px-8 sm:px-10 md:px-12 py-4 bg-slate-50 border-t border-[#e1e3e1] flex items-center justify-between text-xs">
        <Link
          href="/login"
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Return to Sign In
        </Link>
        <span className="text-slate-400">IntelliCRM Security</span>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#f0f4f9] flex flex-col justify-between items-center px-4 py-8 sm:py-12 selection:bg-blue-100 font-sans">
      <div className="w-full flex-1 flex items-center justify-center">
        <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
