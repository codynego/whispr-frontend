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
  const dashboardConfigUrl = `/dashboard/avatars/${handle}`; // Removed trailing slash for cleaner URL structure

  // Function to format the date robustly
  const formatLastTrainedDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Never";
    try {
      // Attempt to parse the date and show a short format (e.g., Dec 1, 2025)
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return "Unknown Date";
    }
  };

  return (
    // Use shadow-md for minimalistic look, hover:shadow-lg for interactivity
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex flex-col gap-5 transition-all duration-200 hover:shadow-lg hover:border-emerald-300">
      
      {/* --- Profile Header --- */}
      <div className="flex items-start gap-4">
        {/* Avatar Image / Placeholder */}
        {photoUrl ? (
          // Adjusted size and border color to match the dashboard's emerald theme
          <Image
            src={photoUrl}
            alt={`${name}'s photo`}
            width={56}
            height={56}
            className="rounded-full object-cover w-14 h-14 border-3 border-emerald-400 shadow-sm"
          />
        ) : (
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center border-3 border-emerald-400 shadow-sm">
            <Cpu className="w-7 h-7 text-emerald-600" />
          </div>
        )}
        
        {/* Name and Handle */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 truncate">{name}</h3>
          {/* Ensure handle doesn't overflow */}
          <p className="text-sm text-gray-500 truncate">@{handle}</p>
        </div>
      </div>

      {/* --- Status Badges --- */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          
        {/* Training Status Badge */}
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap 
              ${trained 
                ? "bg-green-100 text-green-700" 
                : "bg-yellow-100 text-yellow-700" // Removed animate-pulse for a cleaner look
              }`}
        >
            <TrendingUp className="w-3 h-3 mr-1" />
            {trained ? "Trained & Live" : "Training Needed"}
        </span>

        {/* Visibility Status Badge */}
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap 
              ${isPublic 
                ? "bg-blue-100 text-blue-700" 
                : "bg-gray-100 text-gray-600"
              }`}
        >
            {isPublic ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
            {isPublic ? "Public" : "Private"}
        </span>
      </div>

      {/* --- Performance Metrics Grid --- */}
      <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
        
        {/* Conversations */}
        <div className="flex flex-col gap-0.5 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-gray-500 font-medium">Conversations</span>
          </div>
          <span className="text-xl font-extrabold text-gray-900">{totalConversations.toLocaleString()}</span>
        </div>
        
        {/* Messages */}
        <div className="flex flex-col gap-0.5 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-gray-500 font-medium">Messages</span>
          </div>
          <span className="text-xl font-extrabold text-gray-900">{totalMessages.toLocaleString()}</span>
        </div>
        
      </div>
      
      {/* Last Trained Date */}
      <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span className="font-semibold text-gray-600">Last Trained:</span> {formatLastTrainedDate(lastTrainedDate)}
      </div>


      {/* --- Actions (Pushed to bottom using mt-auto) --- */}
      <div className="flex flex-col gap-2 **mt-auto** pt-2">
        {/* Primary Action (Emerald theme) */}
        <Link
          href={dashboardConfigUrl}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-base font-semibold hover:bg-emerald-700 transition shadow-md"
        >
          <Settings className="w-4 h-4" />
          Configure Avatar
        </Link>
        
        {/* Secondary Action */}
        <Link
          href={publicPageUrl}
          className={`flex items-center justify-center px-4 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50 border 
            ${isPublic 
              ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" 
              : "text-gray-500 bg-gray-100 border-gray-200 cursor-not-allowed pointer-events-none opacity-80"
            }`}
          aria-disabled={!isPublic}
        >
          View Public Page
        </Link>
      </div>
    </div>
  );
};