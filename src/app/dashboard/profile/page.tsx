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
  ChevronRight,
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
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/`, {
      credentials: "include",
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
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center px-4">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 font-medium">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim();
  const initials = `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
  const joinedDate = format(new Date(profile.date_joined), "MMMM yyyy");

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-emerald-50 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Profile</h1>
              <p className="text-sm sm:text-base text-gray-600 truncate">Your account and preferences</p>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left: Personal Info */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-lg border border-gray-100">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl sm:rounded-3xl flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-xl flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{fullName}</h2>
                  <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3 text-gray-600 min-w-0">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm sm:text-base truncate">{profile.email}</span>
                    </div>
                    {profile.whatsapp && (
                      <div className="flex items-center gap-2 sm:gap-3 text-gray-600 min-w-0">
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm sm:text-base truncate">{profile.whatsapp}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 sm:gap-3 text-gray-500 text-xs sm:text-sm">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>Member since {joinedDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-lg border border-gray-100">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 flex-shrink-0" />
                <span>Account Settings</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { label: "Edit Profile", icon: User, path: "/dashboard/settings/profile" },
                  { label: "Change Password", icon: Lock, path: "/dashboard/settings/password" },
                  { label: "Notifications", icon: Bell, path: "/dashboard/settings/notifications" },
                  { label: "Assistant Settings", icon: Brain, path: "/dashboard/settings/assistant" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.path)}
                    className="group flex items-center justify-between p-4 sm:p-5 bg-gray-50 rounded-xl sm:rounded-2xl hover:bg-emerald-50 hover:shadow-md border border-gray-200 hover:border-emerald-300 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                        <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                      </div>
                      <span className="font-medium text-gray-800 text-sm sm:text-base truncate">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-emerald-600 transition-colors flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Plan Info */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Current Plan */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold">Current Plan</h3>
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">
                {profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)}
              </div>
              <p className="opacity-90 text-sm sm:text-base">Unlimited memory • Full AI access</p>
              <button
                onClick={() => router.push("/dashboard/billing")}
                className="mt-6 sm:mt-8 w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-200 text-sm sm:text-base"
              >
                Manage Billing
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}