// app/dashboard/settings/account/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, MessageCircle, Lock, Check, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  whatsapp: string | null;
  plan: string;
}

export default function AccountSettings() {
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Profile>({
    first_name: "",
    last_name: "",
    email: "",
    whatsapp: "",
    plan: "",
  });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Password form
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/`, {
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setProfile(data);
          setForm({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            whatsapp: data.whatsapp || "",
            plan: data.plan || "Free",
          });
        }
      })
      .catch(err => {
        console.error("Failed to load profile:", err);
      });
  }, [user, authLoading]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (newPass !== confirmPass) {
      toast.error("Passwords don't match");
      return;
    }
    if (!user) return;

    setChangingPass(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          old_password: oldPass,
          new_password: newPass,
        }),
      });

      if (res.ok) {
        toast.success("Password changed successfully");
        setOldPass("");
        setNewPass("");
        setConfirmPass("");
        setShowPassword(false);
      } else {
        const err = await res.json();
        toast.error(err.detail || "Failed to change password");
      }
    } catch {
      toast.error("Failed to change password");
    } finally {
      setChangingPass(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center px-4">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 font-medium">Please log in to view account settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-emerald-50 overflow-x-hidden py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12 text-center">
          <div className="inline-flex items-center justify-center mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl">
              <User className="w-9 h-9 sm:w-12 sm:h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 px-4">Account Settings</h1>
          <p className="text-base sm:text-lg text-gray-600 mt-2 sm:mt-3 px-4">Manage your personal information and security</p>
        </div>

        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 p-5 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
              <User className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 flex-shrink-0" />
              <span>Personal Information</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 transition text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 transition text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 transition text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  value={form.whatsapp || ""}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="+1234567890"
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 transition text-sm sm:text-base"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Include country code (e.g. +1, +234) — this is where your assistant lives
                </p>
              </div>
            </div>

            <div className="mt-8 sm:mt-10 flex justify-end">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-emerald-600 text-white rounded-xl sm:rounded-2xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition shadow-lg hover:shadow-emerald-600/30 flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
              >
                {saving ? "Saving..." : (
                  <>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 p-5 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 flex-shrink-0" />
              <span>Security</span>
            </h2>

            <button
              onClick={() => setShowPassword(true)}
              className="w-full text-left p-5 sm:p-6 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 transition"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Change Password</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Update your password to keep your account secure</p>
                </div>
                <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              </div>
            </button>
          </div>

          {/* Current Plan */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold">Current Plan</h3>
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold mb-2">{form.plan}</div>
            <p className="opacity-90 text-sm sm:text-base">Unlimited memory • Full AI access</p>
            <button className="mt-6 sm:mt-8 w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-medium transition text-sm sm:text-base">
              Manage Billing →
            </button>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPassword && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Change Password</h3>
                <button
                  onClick={() => {
                    setShowPassword(false);
                    setOldPass("");
                    setNewPass("");
                    setConfirmPass("");
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <input
                  type="password"
                  placeholder="Current password"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 transition text-sm sm:text-base"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 transition text-sm sm:text-base"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 transition text-sm sm:text-base"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10">
                <button
                  onClick={() => {
                    setShowPassword(false);
                    setOldPass("");
                    setNewPass("");
                    setConfirmPass("");
                  }}
                  className="flex-1 py-3 sm:py-4 border border-gray-300 rounded-xl sm:rounded-2xl font-medium hover:bg-gray-50 transition text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={changePassword}
                  disabled={changingPass || !oldPass || !newPass || newPass !== confirmPass}
                  className="flex-1 py-3 sm:py-4 bg-emerald-600 text-white rounded-xl sm:rounded-2xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition text-sm sm:text-base"
                >
                  {changingPass ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}