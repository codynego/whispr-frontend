"use client";

import { useState } from "react";
import { Mail, CheckCircle, MessageSquare, Brain } from "lucide-react";

export default function OverviewPage() {
  const [userName] = useState("Abednego");

  const stats = [
    { label: "AI Insights Today", value: 5, icon: <Brain className="w-5 h-5 text-blue-600" /> },
    { label: "Important Emails", value: 8, icon: <Mail className="w-5 h-5 text-red-600" /> },
    { label: "Tasks Completed", value: 3, icon: <CheckCircle className="w-5 h-5 text-green-600" /> },
    { label: "WhatsApp Alerts Sent", value: 6, icon: <MessageSquare className="w-5 h-5 text-purple-600" /> },
  ];

  const activityFeed = [
    { id: 1, text: "Whispr flagged 2 new important emails from your manager." },
    { id: 2, text: "Created task: Follow up with client on proposal." },
    { id: 3, text: "Sent WhatsApp alert to team group: 'Meeting in 15 mins.'" },
    { id: 4, text: "Summarized today’s inbox and highlighted 3 unread priorities." },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Good morning, {userName} 👋
        </h1>
        <p className="text-sm text-gray-500">
          Here’s what Whispr handled for you today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex items-center bg-white rounded-2xl shadow-sm p-4 border hover:shadow-md transition"
          >
            <div className="p-3 bg-gray-100 rounded-full">{stat.icon}</div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xl font-semibold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Insights and Tasks */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Email Insights */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            📧 Email Highlights
          </h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 2 emails marked as high priority by Whispr.</li>
            <li>• 1 meeting reminder extracted from inbox.</li>
            <li>• 3 unread updates summarized.</li>
          </ul>
        </div>

        {/* Tasks */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            ✅ Active Tasks
          </h2>
          <ul className="space-y-3">
            <li className="flex justify-between items-center">
              <span>Follow up with client on proposal</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                In Progress
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span>Review today's team summary</span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                Pending
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          🕒 Recent Activity
        </h2>
        <ul className="space-y-2 text-sm text-gray-600">
          {activityFeed.map((item) => (
            <li key={item.id} className="border-b pb-2 last:border-none">
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
