"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Settings, Users, MessageSquare, TrendingUp, Cpu, 
  Globe, Lock, ExternalLink, Calendar, Sparkles,
  ArrowRight, Activity
} from "lucide-react"; 

interface AvatarListCardProps {
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

  // Format date with better readability
  const formatLastTrainedDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not trained yet";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return "Today";
      if (diffInDays === 1) return "Yesterday";
      if (diffInDays < 7) return `${diffInDays} days ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      });
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300 overflow-hidden hover:shadow-xl">
      
      {/* Header with Gradient Background */}
      <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 pb-20">
        {/* Status Badge - Top Right */}
        <div className="absolute top-4 right-4 flex gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm shadow-lg ${
              trained 
                ? "bg-green-500/90 text-white" 
                : "bg-amber-400/90 text-amber-900"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {trained ? "Live" : "Setup"}
          </span>
        </div>

        {/* Avatar - Positioned to overlap */}
        <div className="absolute -bottom-12 left-6">
          {photoUrl ? (
            <div className="relative">
              <Image
                src={photoUrl}
                alt={`${name}'s photo`}
                width={96}
                height={96}
                className="rounded-2xl object-cover w-24 h-24 border-4 border-white shadow-2xl"
              />
              {trained && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-3 border-white shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center border-4 border-white shadow-2xl">
                <Cpu className="w-12 h-12 text-white" />
              </div>
              {trained && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-3 border-white shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 px-6 pb-6">
        
        {/* Name and Handle */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">
            {name}
          </h3>
          <p className="text-sm text-gray-500 truncate font-medium">@{handle}</p>
        </div>

        {/* Visibility Badge */}
        <div className="mb-5">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              isPublic 
                ? "bg-blue-50 text-blue-700 border-2 border-blue-200" 
                : "bg-gray-100 text-gray-600 border-2 border-gray-200"
            }`}
          >
            {isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {isPublic ? "Public Profile" : "Private"}
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-white rounded-lg shadow-sm">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Chats</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalConversations.toLocaleString()}</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-white rounded-lg shadow-sm">
                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Messages</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalMessages.toLocaleString()}</div>
          </div>
        </div>

        {/* Last Trained */}
        <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">Last trained:</span>{" "}
            {formatLastTrainedDate(lastTrainedDate)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Primary Action */}
          <Link
            href={dashboardConfigUrl}
            className="group/btn flex items-center justify-center gap-2.5 px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-xl"
          >
            <Settings className="w-5 h-5" />
            <span>Configure Avatar</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
          
          {/* Secondary Action - View Public Page */}
          {isPublic ? (
            <Link
              href={publicPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-indigo-50 text-indigo-700 border-2 border-indigo-200 hover:border-indigo-300 rounded-xl font-semibold transition-all"
            >
              <Globe className="w-4 h-4" />
              <span>View Public Page</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
            </Link>
          ) : (
            <div className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-50 text-gray-400 border-2 border-gray-200 rounded-xl font-semibold cursor-not-allowed">
              <Lock className="w-4 h-4" />
              <span>Public Page Disabled</span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect Border Glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl"></div>
      </div>
    </div>
  );
};