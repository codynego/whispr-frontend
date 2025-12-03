"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Settings, Users, MessageSquare, Cpu, 
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
    <div className="group bg-white rounded-2xl shadow-sm border-2 border-gray-100 hover:border-emerald-300 transition-all duration-300 overflow-hidden hover:shadow-2xl">
      
      {/* Header with Emerald Gradient */}
      <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-6 pb-20">
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm shadow-lg transition-all ${
            trained 
              ? "bg-emerald-400/90 text-white" 
              : "bg-amber-400/90 text-amber-900"
          }`}>
            <Activity className="w-3.5 h-3.5" />
            {trained ? "Live" : "Setup"}
          </span>
        </div>

        {/* Avatar Photo */}
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
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 border-3 border-white shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center border-4 border-white shadow-2xl">
                <Cpu className="w-12 h-12 text-white" />
              </div>
              {trained && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 border-3 border-white shadow-lg">
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
          <h3 className="text-2xl font-bold text-gray-900 mb-1 truncate group-hover:text-emerald-600 transition-colors">
            {name}
          </h3>
          <p className="text-sm text-gray-500 truncate font-medium">@{handle}</p>
        </div>

        {/* Visibility Badge */}
        <div className="mb-5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isPublic 
              ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200" 
              : "bg-gray-100 text-gray-600 border-2 border-gray-200"
          }`}>
            {isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {isPublic ? "Public Profile" : "Private"}
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-white rounded-lg shadow-sm">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Chats</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalConversations.toLocaleString()}</div>
          </div>
          
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-white rounded-lg shadow-sm">
                <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Messages</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalMessages.toLocaleString()}</div>
          </div>
        </div>

        {/* Last Trained */}
        <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-emerald-50/50 rounded-lg border border-emerald-200">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="text-xs text-gray-700">
            <span className="font-semibold">Last trained:</span>{" "}
            <span className="text-emerald-700 font-medium">
              {formatLastTrainedDate(lastTrainedDate)}
            </span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Primary: Configure */}
          <Link
            href={dashboardConfigUrl}
            className="group/btn flex items-center justify-center gap-2.5 px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-xl"
          >
            <Settings className="w-5 h-5" />
            <span>Configure Avatar</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
          
          {/* Secondary: Public Page */}
          {isPublic ? (
            <Link
              href={publicPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link flex items-center justify-center gap-2 px-5 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-2 border-emerald-300 hover:border-emerald-400 rounded-xl font-semibold transition-all"
            >
              <Globe className="w-4 h-4" />
              <span>View Public Page</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
            </Link>
          ) : (
            <div className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-50 text-gray-500 border-2 border-gray-200 rounded-xl font-semibold cursor-not-allowed">
              <Lock className="w-4 h-4" />
              <span>Public Page Disabled</span>
            </div>
          )}
        </div>
      </div>

      {/* Emerald Glow on Hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-xl"></div>
      </div>
    </div>
  );
};