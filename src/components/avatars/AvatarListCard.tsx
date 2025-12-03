"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Settings, Globe, Lock, ExternalLink, Calendar, Sparkles,
  MessageCircle, Users, Activity, ArrowRight, Cpu
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
  const configUrl = `/dashboard/avatars/${handle}`;

  const formatDate = (date?: string | null) => {
    if (!date) return "Never trained";
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 30) return `${diff} days ago`;
    if (diff < 365) return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:bg-white/90">
      
      {/* Floating Status Orb */}
      <div className="absolute top-5 right-5 z-10">
        <div className={`relative flex items-center justify-center w-14 h-14 rounded-full ${trained ? "bg-emerald-500/20" : "bg-amber-500/20"} backdrop-blur-md border border-white/30 shadow-lg`}>
          <div className={`absolute inset-2 rounded-full ${trained ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
          <Activity className={`relative w-6 h-6 ${trained ? "text-white" : "text-amber-900"}`} />
        </div>
        <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-600 whitespace-nowrap">
          {trained ? "Live" : "Draft"}
        </span>
      </div>

      {/* Hero Section with Avatar */}
      <div className="relative pt-10 pb-20 px-8 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,white_10%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,white_10%,transparent_50%)]" />
        </div>

        {/* Avatar */}
        <div className="relative z-10 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl overflow-hidden ring-8 ring-white/30 shadow-2xl">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center">
                  <Cpu className="w-16 h-16 text-white/90" />
                </div>
              )}
            </div>
            {trained && (
              <div className="absolute -bottom-3 -right-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-3 shadow-xl border-4 border-white">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 pb-8 -mt-12 relative z-10">
        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{name}</h3>
          <p className="text-lg text-emerald-600 font-semibold">@{handle}</p>
        </div>

        {/* Visibility Badge */}
        <div className="flex justify-center mb-8">
          <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm backdrop-blur-md shadow-md border ${isPublic 
            ? "bg-emerald-500/20 text-emerald-700 border-emerald-300" 
            : "bg-gray-500/10 text-gray-600 border-gray-300"
          }`}>
            {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {isPublic ? "Public" : "Private"}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-5 mb-8">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-white rounded-xl shadow">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Conversations</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalConversations.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-5 border border-teal-200/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-white rounded-xl shadow">
                <MessageCircle className="w-5 h-5 text-teal-600" />
              </div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Messages</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalMessages.toLocaleString()}</p>
          </div>
        </div>

        {/* Last Trained */}
        <div className="flex items-center justify-center gap-3 px-6 py-3 bg-white/70 backdrop-blur rounded-2xl border border-gray-200 shadow-inner mb-8">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <span className="text-sm text-gray-600">
            Last trained: <span className="font-bold text-emerald-700">{formatDate(lastTrainedDate)}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-4">
          <Link
            href={configUrl}
            className="group flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <Settings className="w-6 h-6" />
            Configure & Train
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {isPublic ? (
            <Link
              href={publicPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-lg rounded-2xl border-2 border-emerald-300 hover:border-emerald-400 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Globe className="w-6 h-6" />
              View Public Profile
              <ExternalLink className="w-5 h-5" />
            </Link>
          ) : (
            <div className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-100 text-gray-500 font-bold text-lg rounded-2xl border-2 border-gray-300 cursor-not-allowed">
              <Lock className="w-6 h-6" />
              Public Profile Locked
            </div>
          )}
        </div>
      </div>

      {/* Subtle Glow Effect on Hover */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-cyan-500/30 blur-2xl" />
      </div>
    </div>
  );
};