"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Mail,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { api, UserProfile } from "@/lib/api";

export default function TeamManagementPage() {
  const { success, error } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [tempPassword, setTempPassword] = useState("Admin2026!");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err: any) {
      error(err.response?.data?.detail || "Failed to load team members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/users/invite", {
        full_name: fullName,
        email: email.trim().toLowerCase(),
        role: role,
        temporary_password: tempPassword,
      });

      success(`Successfully created ${role === "ADMIN" ? "Admin" : "Team Member"} account!`);
      setInviteModalOpen(false);
      setFullName("");
      setEmail("");
      setTempPassword("Admin2026!");
      fetchUsers();
    } catch (err: any) {
      error(err.response?.data?.detail || "Failed to create user account.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserStatus = async (user: UserProfile) => {
    try {
      await api.patch(`/users/${user.id}`, {
        is_active: !user.is_active,
      });
      success(`User ${user.is_active ? "deactivated" : "activated"} successfully.`);
      fetchUsers();
    } catch (err: any) {
      error(err.response?.data?.detail || "Cannot modify user status.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" /> User & Role Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            SuperAdmin & Workspace Admin portal: Provision new Admins, Sales Agents, and Account Managers.
          </p>
        </div>

        <Button
          onClick={() => setInviteModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold border border-amber-500 shadow-xs flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4 text-white" /> Add New Admin
        </Button>
      </div>

      {/* Team Table Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-semibold text-slate-800">
            Workspace Members ({users.length})
          </CardTitle>

        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400">Loading workspace users...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">No users found in this workspace.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase">
                  <tr>
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Joined</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isAdmin = u.role === "ADMIN";
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                              {u.full_name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{u.full_name}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {u.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${isAdmin
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : u.role === "SALES_AGENT"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                          >
                            {isAdmin && <ShieldCheck className="w-3.5 h-3.5" />}
                            {u.role.replace("_", " ")}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${u.is_active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                              }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                            />
                            {u.is_active ? "Active" : "Deactivated"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleUserStatus(u)}
                            className={`text-xs cursor-pointer font-medium px-3 py-1 rounded-lg border transition-all ${u.is_active
                                ? "border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                                : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                              }`}
                          >
                            {u.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Invite Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Create New Admin or Team Member"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Full Name *
            </label>
            <Input
              required
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email Address *
            </label>
            <Input
              required
              type="email"
              placeholder="e.g. admin@youragency.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Role Assignment (RBAC) *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ADMIN">ADMIN (Full Workspace Control)</option>
              <option value="SALES_AGENT">SALES_AGENT (Leads & Deals)</option>
              <option value="ACCOUNT_MANAGER">ACCOUNT_MANAGER (Client Accounts)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Selecting <strong>ADMIN</strong> grants full permissions to manage workspace users, leads, clients, and pipeline settings.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Initial Password *
            </label>
            <Input
              required
              minLength={8}
              type="text"
              placeholder="Minimum 8 characters"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
