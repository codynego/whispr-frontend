"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, Settings, CreditCard, Lock, Bell, Brain, DollarSign, Clock, MessageCircle } from "lucide-react";

interface UserProfile {
  id: number;
  email: string;
  whatsapp: string | null;
  plan: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
  joined?: string;
}

export default function ProfilePage() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.status === 401) {
          console.error("Unauthorized");
          return;
        }

        const data = await res.json();
        setUser({
          ...data,
          name: `${data.first_name} ${data.last_name}`.trim(),
          joined: new Date(data.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        });
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [accessToken]);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 mb-1">
          <User className="w-6 h-6 text-indigo-600" />
          Profile
        </h1>
        <p className="text-sm text-gray-600">
          Manage your account, plan, and preferences.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 space-y-6 lg:space-y-0">
        {/* Profile Card */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            Personal Info
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg">{user.first_name} {user.last_name}</h3>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
              {user.whatsapp && (
                <p className="text-sm text-gray-600 truncate flex items-center gap-1 mt-1">
                  <MessageCircle className="w-3 h-3" />
                  {user.whatsapp}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-500" />
            Account Settings
          </h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <li 
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer"
              onClick={() => handleNavigate("/dashboard/settings/account")}
            >
              <Lock className="w-4 h-4 text-gray-500" />
              Update Profile & Password
            </li>
            <li 
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer"
              onClick={() => handleNavigate("/dashboard/settings/notifications")}
            >
              <Bell className="w-4 h-4 text-gray-500" />
              Manage notifications
            </li>
            <li 
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer"
              onClick={() => handleNavigate("/dashboard/settings/personality")}
            >
              <Brain className="w-4 h-4 text-gray-500" />
              Update assistant tone and preferences
            </li>
          </ul>
        </section>

        {/* Billing & Subscription */}
        <section className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-500" />
            Billing & Subscription
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 text-sm">Current Plan:</span>
              </div>
              <span className="font-bold text-indigo-600 text-sm">{user.plan}</span>
            </div>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Member since {user.joined}
            </p>
          </div>
          <button 
            className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold px-6 py-2 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
            onClick={() => handleNavigate("/dashboard/billing")}
          >
            Manage Billing
          </button>
        </section>
      </div>
    </div>
  );
}