"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ToastProvider } from "@/components/ui/toast";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes of inactivity

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoutDueToInactivity = useCallback(() => {
    localStorage.removeItem("intellicrm_token");
    localStorage.removeItem("intellicrm_user");
    alert("Session expired due to 15 minutes of inactivity. Please log in again.");
    router.push("/login");
  }, [router]);

  const resetTimer = useCallback(() => {
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
    }
    timeoutTimerRef.current = setTimeout(handleLogoutDueToInactivity, INACTIVITY_TIMEOUT_MS);
  }, [handleLogoutDueToInactivity]);

  useEffect(() => {
    const token = localStorage.getItem("intellicrm_token");
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthorized(true);

    // Track user activity events to reset the inactivity timer
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((evt) => {
      window.addEventListener(evt, handleActivity);
    });

    // Start initial timer
    resetTimer();

    return () => {
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
      }
      events.forEach((evt) => {
        window.removeEventListener(evt, handleActivity);
      });
    };
  }, [router, resetTimer]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Checking authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex h-screen bg-white overflow-hidden font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8 bg-white">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
