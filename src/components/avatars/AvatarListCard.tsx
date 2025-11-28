"use client";

import Link from "next/link";
import Image from "next/image";
import { Settings, Users, MessageSquare, TrendingUp, Cpu, Globe, Lock } from "lucide-react"; 

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
  const dashboardConfigUrl = `/dashboard/avatars/${handle}/`; 

  // Function to format the date robustly
  const formatLastTrainedDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Never";
    try {
      // Attempt to parse the date and show a relative/short format
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return "Unknown Date";
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 flex flex-col gap-6 transition-all hover:shadow-2xl hover:border-indigo-300">
      
      {/* --- Profile Header --- */}
      <div className="flex items-start gap-4">
        {/* Avatar Image / Placeholder */}
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={`${name}'s photo`}
            width={64}
            height={64}
            className="rounded-full object-cover w-16 h-16 border-4 border-indigo-400 shadow-md"
          />
        ) : (
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-indigo-400 shadow-md">
            <Cpu className="w-8 h-8 text-indigo-600" />
          </div>
        )}
        
        {/* Name and Handle */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 truncate">{name}</h3>
          <p className="text-sm text-gray-500 truncate">@{handle}</p>
        </div>
      </div>

      {/* --- Status Badges --- */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          
        {/* Training Status Badge */}
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap 
              ${trained 
                ? "bg-green-100 text-green-700" 
                : "bg-yellow-100 text-yellow-700 animate-pulse"
              }`}
        >
            <TrendingUp className="w-3 h-3 mr-1" />
            {trained ? "Trained & Live" : "Training Needed"}
        </span>

        {/* Visibility Status Badge */}
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap 
              ${isPublic 
                ? "bg-blue-100 text-blue-700" 
                : "bg-gray-100 text-gray-600"
              }`}
        >
            {isPublic ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
            {isPublic ? "Public Access" : "Private"}
        </span>
      </div>

      {/* --- Performance Metrics Grid --- */}
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
        
        {/* Conversations */}
        <div className="flex flex-col gap-1 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="text-xs text-gray-500 font-medium">Conversations</span>
          </div>
          <span className="text-lg font-bold text-gray-900">{totalConversations.toLocaleString()}</span>
        </div>
        
        {/* Messages */}
        <div className="flex flex-col gap-1 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <span className="text-xs text-gray-500 font-medium">Messages</span>
          </div>
          <span className="text-lg font-bold text-gray-900">{totalMessages.toLocaleString()}</span>
        </div>
        
      </div>
      
      {/* Last Trained Date */}
      <div className="text-xs text-gray-500 mt-0 pt-2 border-t border-gray-100">
          <span className="font-medium">Last Trained:</span> {formatLastTrainedDate(lastTrainedDate)}
      </div>


      {/* --- Actions --- */}
      <div className="flex flex-col gap-2 mt-auto">
        {/* Primary Action */}
        <Link
          href={dashboardConfigUrl}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-base font-semibold hover:bg-indigo-700 transition shadow-lg"
        >
          <Settings className="w-5 h-5" />
          Configure Avatar
        </Link>
        
        {/* Secondary Action */}
        <Link
          href={publicPageUrl}
          className={`flex items-center justify-center px-4 py-2 bg-indigo-50 rounded-xl text-sm font-medium transition disabled:opacity-50 
            ${isPublic 
              ? "text-indigo-700 hover:bg-indigo-100" 
              : "text-gray-500 cursor-not-allowed pointer-events-none opacity-70"
            }`}
          aria-disabled={!isPublic}
        >
          View Public Page
        </Link>
      </div>
    </div>
  );
};