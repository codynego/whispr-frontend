"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare, Clock, UserCheck, Loader2, BarChart3 } from "lucide-react";

interface AvatarAnalytics {
  total_conversations: number;
  total_messages: number;
  unique_visitors: number;
  average_response_time_ms: number;
}

interface AnalyticsDisplayProps {
  avatarHandle: string;
}

const formatNumber = (num: number): string =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(num);

const formatMs = (ms: number): string => {
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)} sec`;
  return `${(ms / 60000).toFixed(1)} min`;
};

export const AnalyticsDisplay = ({ avatarHandle }: AnalyticsDisplayProps) => {
  const { accessToken } = useAuth();
  const [analytics, setAnalytics] = useState<AvatarAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!accessToken) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/analytics/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || "Failed to load analytics");
        }

        const data: AvatarAnalytics = await res.json();
        setAnalytics(data);
        setError(false);
      } catch (err) {
        console.error("Analytics fetch failed:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [avatarHandle, accessToken]);

  const stats = analytics
    ? [
        {
          label: "Total Conversations",
          value: formatNumber(analytics.total_conversations),
          icon: MessageSquare,
          color: "text-purple-600",
          bg: "bg-purple-50",
          border: "border-purple-200",
        },
        {
          label: "Total Messages",
          value: formatNumber(analytics.total_messages),
          icon: MessageSquare,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
          border: "border-indigo-200",
        },
        {
          label: "Unique Visitors",
          value: formatNumber(analytics.unique_visitors),
          icon: UserCheck,
          color: "text-teal-600",
          bg: "bg-teal-50",
          border: "border-teal-200",
        },
        {
          label: "Avg Response Time",
          value: formatMs(analytics.average_response_time_ms),
          icon: Clock,
          color: "text-amber-600",
          bg: "bg-amber-50",
          border: "border-amber-200",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-emerald-600" />
          Analytics Overview
        </h2>
        <p className="text-gray-600 mt-1">Real-time performance of your public avatar</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-gray-500">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-10 h-10 text-gray-400" />
            </div>
            <p className="font-medium">Unable to load analytics</p>
            <p className="text-sm mt-1">Try refreshing the page</p>
          </div>
        ) : analytics && stats.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`${stat.bg} ${stat.border} border-2 rounded-2xl p-5 transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">{stat.label}</p>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="font-medium text-lg">No activity yet</p>
            <p className="text-sm mt-1">Analytics will appear once people start chatting with your avatar</p>
          </div>
        )}
      </div>
    </div>
  );
};