"use client";

import { Cpu, Sparkles, Activity, Globe, Lock, Calendar, Users, MessageSquare, Settings, ExternalLink } from "lucide-react";
import Link from "next/link";

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
  const dashboardConfigUrl = `/dashboard/avatars/${handle}`;

  const formatLastTrainedDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not trained";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return "Today";
      if (diffInDays === 1) return "Yesterday";
      if (diffInDays < 7) return `${diffInDays}d ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:border-emerald-400 transition-all duration-300 overflow-hidden hover:shadow-lg">
      
      {/* Compact Header */}
      <div className="flex items-start gap-4 p-5 border-b border-gray-100">
        
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`${name}'s photo`}
              width={56}
              height={56}
              className="rounded-xl object-cover w-14 h-14 ring-2 ring-gray-100 group-hover:ring-emerald-200 transition-all"
            />
          ) : (
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center ring-2 ring-gray-100 group-hover:ring-emerald-200 transition-all">
              <Cpu className="w-7 h-7 text-white" />
            </div>
          )}
          {trained && (
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-white">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>

        {/* Name & Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
              {name}
            </h3>
            <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              trained 
                ? "bg-emerald-100 text-emerald-700" 
                : "bg-amber-100 text-amber-700"
            }`}>
              <Activity className="w-3 h-3" />
              {trained ? "Live" : "Setup"}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 truncate mb-2">@{handle}</p>
          
          <div className="flex items-center gap-3 text-xs">
            <span className={`inline-flex items-center gap-1 font-medium ${
              isPublic ? "text-emerald-600" : "text-gray-500"
            }`}>
              {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {isPublic ? "Public" : "Private"}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatLastTrainedDate(lastTrainedDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics & Actions */}
      <div className="p-5">
        
        {/* Compact Metrics */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{totalConversations.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Chats</div>
            </div>
          </div>
          
          <div className="w-px h-10 bg-gray-200"></div>
          
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 rounded-lg">
              <MessageSquare className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{totalMessages.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Messages</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={dashboardConfigUrl}
            className="flex-1 group/btn flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow-md"
          >
            <Settings className="w-4 h-4" />
            <span>Configure</span>
          </Link>
          
          {isPublic ? (
            <Link
              href={publicPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-300 hover:border-emerald-400 rounded-lg font-semibold text-sm transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View</span>
            </Link>
          ) : (
            <div className="flex items-center justify-center px-4 py-2.5 bg-gray-50 text-gray-400 border border-gray-200 rounded-lg text-sm cursor-not-allowed">
              <Lock className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Subtle Hover Effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5"></div>
      </div>
    </div>
  );
};