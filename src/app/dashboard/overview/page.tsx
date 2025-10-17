"use client";

import { useState } from "react";
import { Mail, CheckCircle, MessageSquare, Brain, Clock, Zap } from "lucide-react";

export default function OverviewPage() {
  const [userName] = useState("Abednego");

  const stats = [
    { label: "AI Insights Today", value: 5, icon: <Brain className="w-5 h-5 text-indigo-600" />, color: "from-indigo-50 to-blue-50" },
    { label: "Important Emails", value: 8, icon: <Mail className="w-5 h-5 text-red-600" />, color: "from-red-50 to-pink-50" },
    { label: "Tasks Completed", value: 3, icon: <CheckCircle className="w-5 h-5 text-green-600" />, color: "from-green-50 to-emerald-50" },
    { label: "WhatsApp Alerts Sent", value: 6, icon: <MessageSquare className="w-5 h-5 text-purple-600" />, color: "from-purple-50 to-violet-50" },
  ];

  const activityFeed = [
    { id: 1, text: "Whispr flagged 2 new important emails from your manager.", icon: Mail, time: "2 min ago" },
    { id: 2, text: "Created task: Follow up with client on proposal.", icon: CheckCircle, time: "10 min ago" },
    { id: 3, text: "Sent WhatsApp alert to team group: 'Meeting in 15 mins.'", icon: MessageSquare, time: "25 min ago" },
    { id: 4, text: "Summarized today’s inbox and highlighted 3 unread priorities.", icon: Brain, time: "1 hr ago" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            Good morning, <span className="text-indigo-600">{userName}</span> 👋
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Here’s what Whispr handled for you today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <article
            key={i}
            className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className={`p-4 sm:p-6 flex items-center gap-4 bg-gradient-to-r ${stat.color}`}>
              <div className="p-3 bg-white/30 rounded-xl backdrop-blur-sm flex-shrink-0">
                {stat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide group-hover:text-gray-800 transition-colors">
                  {stat.label}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Insights and Tasks */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Insights */}
        <article className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl">
              <Mail className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Email Highlights
            </h2>
          </div>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>2 emails marked as high priority by Whispr.</span>
            </li>
            <li className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>1 meeting reminder extracted from inbox.</span>
            </li>
            <li className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>3 unread updates summarized.</span>
            </li>
          </ul>
        </article>

        {/* Tasks */}
        <article className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Active Tasks
            </h2>
          </div>
          <ul className="space-y-4">
            <li className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <span className="text-sm font-medium text-gray-800">Follow up with client on proposal</span>
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                In Progress
              </span>
            </li>
            <li className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
              <span className="text-sm font-medium text-gray-800">Review today&apos;s team summary</span>
              <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                Pending
              </span>
            </li>
          </ul>
        </article>
      </section>

      {/* Activity Feed */}
      <section className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl">
            <Clock className="w-5 h-5 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Activity
          </h2>
        </div>
        <ul className="space-y-4">
          {activityFeed.map((item) => (
            <li key={item.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl flex-shrink-0 mt-0.5">
                <item.icon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 mb-1">{item.text}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.time}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}