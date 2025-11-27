"use client";

import Link from "next/link";
import Image from "next/image";
import { Brain, Settings, Users, MessageSquare, TrendingUp, Cpu } from "lucide-react";

interface AvatarListCardProps {
  id: string;
  name: string;
  handle: string;
  photoUrl?: string | null;
  isPublic: boolean; // New: Display public status
  trained: boolean;
  totalConversations: number;
  totalMessages: number;
  lastTrainedDate?: string | null; // New: Display last training time
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
  // Link to the main training/configuration page
  const dashboardConfigUrl = `/avatars/${handle}/train`; 

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-5 transition-all hover:shadow-xl hover:border-emerald-200">
      
      {/* --- Profile Header --- */}
      <div className="flex items-center gap-4">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={`${name}'s photo`}
            width={64}
            height={64}
            className="rounded-full object-cover w-16 h-16 border-2 border-emerald-400"
          />
        ) : (
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-emerald-400">
            <Cpu className="w-8 h-8 text-emerald-600" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600">@{handle}</p>
        </div>
      </div>

      {/* --- Status & Analytics Grid --- */}
      <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
        
        {/* Training Status */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              trained ? "bg-green-500" : "bg-yellow-500 animate-pulse"
            }`}
          ></span>
          <span className={`${trained ? "text-green-700" : "text-yellow-700"}`}>
            {trained ? "Trained" : "Needs Training"}
          </span>
        </div>
        
        {/* Public Status */}
        <div className="flex items-center gap-2">
            <span
                className={`w-2.5 h-2.5 rounded-full ${
                    isPublic ? "bg-blue-500" : "bg-gray-400"
                }`}
            ></span>
            <span className={`${isPublic ? "text-blue-700" : "text-gray-500"}`}>
                {isPublic ? "Public" : "Private"}
            </span>
        </div>

        {/* Conversations */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-500" />
          <span>**{totalConversations}** Conversations</span>
        </div>
        
        {/* Messages */}
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-500" />
          <span>**{totalMessages}** Messages</span>
        </div>
        
        {/* Last Trained */}
        {lastTrainedDate && (
            <div className="flex items-center gap-2 col-span-2 text-xs text-gray-500">
                <TrendingUp className="w-4 h-4" />
                <span>Last trained: {new Date(lastTrainedDate).toLocaleDateString()}</span>
            </div>
        )}
      </div>

      {/* --- Actions --- */}
      <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
        <Link
          href={publicPageUrl}
          className="flex-1 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium text-center hover:bg-emerald-100 transition disabled:opacity-50"
          aria-disabled={!isPublic}
        >
          View Public Page
        </Link>
        <Link
          href={dashboardConfigUrl}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
        >
          <Settings className="w-4 h-4" />
          Configure
        </Link>
      </div>
    </div>
  );
};