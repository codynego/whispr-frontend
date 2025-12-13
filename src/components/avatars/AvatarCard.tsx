"use client";

import {
  Cpu,
  Sparkles,
  Globe,
  Lock,
  Calendar,
  Users,
  MessageSquare,
  Settings,
  ExternalLink,
  ChevronRight, // Added for a modern navigational feel
} from "lucide-react";
import Link from "next/link";
import React from "react";

// Reuse the existing interface
export interface AvatarListCardProps {
  id: string;
  name: string;
  handle: string;
  photoUrl?: string | null;
  isPublic: boolean;
  trained: boolean;
  totalConversations: number;
  totalMessages: number;
  lastTrainedDate?: string | null;
}

export const AvatarListCard = ({
  id,
  name,
  handle,
  photoUrl,
  isPublic,
  trained,
  totalConversations,
  totalMessages,
  lastTrainedDate,
}: AvatarListCardProps) => {
  const publicPageUrl = `/a/${handle}`;
  // This is the required redirect for the Settings icon
  const dashboardConfigUrl = `/dashboard/avatars/${handle}`;

  const formatLastTrainedDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not trained";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffInDays === 0) return "Today";
      if (diffInDays === 1) return "Yesterday";
      if (diffInDays < 7) return `${diffInDays}d ago`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  // Modern Card Structure
  return (
    <div className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:border-emerald-400 transition-all duration-300 overflow-hidden hover:shadow-xl">
      {/* Settings Icon (Redirects to Profile Config) */}
      <Link
        href={dashboardConfigUrl}
        className="absolute top-3 right-3 p-2 rounded-full bg-gray-50/50 backdrop-blur-sm text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all z-10"
        title="Avatar Settings"
      >
        <Settings className="w-4 h-4" />
      </Link>

      {/* Main Content Area (Clickable to Configuration) */}
      <Link href={dashboardConfigUrl} className="block p-6">
        {/* Header Section */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${name}'s photo`}
                width={64}
                height={64}
                className="rounded-xl object-cover w-16 h-16 shadow-md ring-2 ring-emerald-500/10 group-hover:ring-emerald-400 transition-all"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md ring-2 ring-emerald-500/10 group-hover:ring-emerald-400 transition-all">
                <Cpu className="w-8 h-8 text-white" />
              </div>
            )}
            {/* Status Badge (Trained/Live) */}
            {trained && (
              <div
                className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 border-2 border-white"
                title="Trained and Live"
              >
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Name & Handle */}
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-xl font-extrabold text-gray-900 truncate group-hover:text-emerald-700 transition-colors mb-0.5">
              {name}
            </h3>
            <p className="text-sm text-gray-500 truncate mb-2">@{handle}</p>
            
            {/* Quick Status Bar */}
            <div className="flex items-center gap-3 text-xs">
                {/* Public/Private Status */}
                <span
                className={`inline-flex items-center gap-1 font-medium ${
                    isPublic ? "text-emerald-600" : "text-amber-600"
                } bg-gray-50 px-2 py-0.5 rounded-full`}
                >
                {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {isPublic ? "Public" : "Private"}
                </span>
                
                {/* Last Trained Date */}
                <span className="text-gray-600 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                Updated: {formatLastTrainedDate(lastTrainedDate)}
                </span>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="my-5 h-px bg-gray-100"></div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Conversations */}
          <MetricItem
            icon={Users}
            label="Total Chats"
            value={totalConversations.toLocaleString()}
            color="emerald"
          />

          {/* Total Messages */}
          <MetricItem
            icon={MessageSquare}
            label="Total Messages"
            value={totalMessages.toLocaleString()}
            color="teal"
          />
        </div>

        {/* Action / CTA Footer */}
        <div className="mt-5 flex items-center justify-between text-sm font-semibold text-emerald-600 group-hover:text-emerald-700 transition-colors">
            <span>View & Configure Dashboard</span>
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>
      
      {/* Public Page Link (View Button) - Placed outside the main Link to prevent double click */}
      {isPublic && (
        <div className="px-6 pb-6 pt-0">
            <Link
                href={publicPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-xl font-semibold text-sm transition-all"
            >
                <ExternalLink className="w-4 h-4" />
                <span>Open Public Page</span>
            </Link>
        </div>
      )}

      {/* Subtle Hover Overlay */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5"></div>
      </div>
    </div>
  );
};

// Helper component for cleaner metric rendering
const MetricItem = ({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: string, color: 'emerald' | 'teal' }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
    <div
      className={`p-2 rounded-full ${
        color === "emerald" ? "bg-emerald-100/70" : "bg-teal-100/70"
      }`}
    >
      <Icon
        className={`w-4 h-4 ${
          color === "emerald" ? "text-emerald-600" : "text-teal-600"
        }`}
      />
    </div>
    <div>
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
    </div>
  </div>
);