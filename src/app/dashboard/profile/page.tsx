// app/dashboard/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Mail,
  MessageCircle,
  Brain,
  Sparkles,
  Settings,
  Calendar,
  Bell,
  Lock,
} from "lucide-react";

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  whatsapp: string | null;
  plan: string;
  date_joined: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // No accessToken!

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/`, {
      credentials: "include", // Sends HttpOnly cookies automatically
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setProfile(data);
        }
      })
      .catch(err => {
        console.error("Failed to load profile:", err);
      })
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Please log in to view your profile</p>
      </div>
    );
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim();
  const initials = `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
  const joinedDate = format(new Date(profile.date_joined), "MMMM yyyy");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600">Your account and preferences</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Personal Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Card */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
                  {initials}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900">{fullName}</h2>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail className="w-5 h-5 text-emerald-600" />
                      <span>{profile.email}</span>
                    </div>
                    {profile.whatsapp && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <MessageCircle className="w-5 h-5 text-emerald-600" />
                        <span>{profile.whatsapp}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-gray-500 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {joinedDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Settings className="w-6 h-6 text-emerald-600" />
                Account Settings
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "Edit Profile", icon: User, path: "/dashboard/settings/profile" },
                  { label: "Change Password", icon: Lock, path: "/dashboard/settings/password" },
                  { label: "Notifications", icon: Bell, path: "/dashboard/settings/notifications" },
                  { label: "Assistant Voice & Tone", icon: Brain, path: "/dashboard/settings/assistant" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.path)}
                    className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl hover:bg-emerald-50 hover:border-emerald-300 border border-gray-200 transition"
                  >
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="font-medium text-gray-800">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Plan & Billing */}
          <div className="space-y-8">
            {/* Current Plan */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Current Plan</h3>
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="text-4xl font-bold mb-2">
                {profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)}
              </div>
              <p className="opacity-90">Unlimited memory • Full AI access</p>
              <button
                onClick={() => router.push("/dashboard/billing")}
                className="mt-8 w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium py-4 rounded-2xl transition"
              >
                Manage Billing
              </button>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Your Activity</h3>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Messages Saved</span>
                  <span className="font-bold text-2xl text-emerald-600">1,284+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reminders Set</span>
                  <span className="font-bold text-2xl text-emerald-600">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Todos Completed</span>
                  <span className="font-bold text-2xl text-emerald-600">892</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}