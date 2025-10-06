"use client";

import { useState } from "react";
import { User, Settings, CreditCard } from "lucide-react";

export default function ProfilePage() {
  const [user] = useState({
    name: "Abednego",
    email: "emonenaabednego@gmail.com",
    plan: "Pro",
    joined: "March 2025",
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">👤 Profile</h1>
      <p className="text-gray-500 text-sm mb-6">
        Manage your account, plan, and preferences.
      </p>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center space-x-4">
          <User className="w-10 h-10 text-blue-500" />
          <div>
            <h2 className="font-semibold text-gray-800">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            <Settings className="inline w-5 h-5 mr-2 text-gray-600" />
            Account Settings
          </h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Change password</li>
            <li>• Manage notifications</li>
            <li>• Update assistant tone and preferences</li>
          </ul>
        </div>

        {/* Billing */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            <CreditCard className="inline w-5 h-5 mr-2 text-gray-600" />
            Billing & Subscription
          </h2>
          <p className="text-gray-600 text-sm mb-2">
            Current Plan:{" "}
            <span className="font-semibold text-blue-600">{user.plan}</span>
          </p>
          <p className="text-gray-500 text-sm">
            Member since {user.joined}
          </p>
          <button className="mt-4 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Manage Billing
          </button>
        </div>
      </div>
    </div>
  );
}
