"use client";

import { useState } from "react";
import { User, Settings, CreditCard, Lock, Bell, Brain, DollarSign, Clock } from "lucide-react";

export default function ProfilePage() {
  const [user] = useState({
    name: "Abednego",
    email: "emonenaabednego@gmail.com",
    plan: "Pro",
    joined: "March 2025",
  });

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
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
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
            <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100/50 transition-colors">
              <Lock className="w-4 h-4 text-gray-500" />
              Change password
            </li>
            <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100/50 transition-colors">
              <Bell className="w-4 h-4 text-gray-500" />
              Manage notifications
            </li>
            <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100/50 transition-colors">
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
          <button className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold px-6 py-2 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md">
            Manage Billing
          </button>
        </section>
      </div>
    </div>
  );
}