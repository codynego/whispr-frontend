"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { PlusCircle, Brain, RefreshCw, Loader2, BarChart2 } from "lucide-react";
import { AvatarListCard } from "@/components/avatars/AvatarListCard"; 
import { AvatarCreationModal } from "@/components/avatars/AvatarCreationModal"; 
import toast from "react-hot-toast"; 

// ----------------------------------------------------
// Interfaces
// ----------------------------------------------------

interface AvatarData {
  id: string;
  name: string;
  handle: string;
  photo_url?: string | null;
  trained: boolean;
  conversations_count: number;
  messages_count: number;
  analytics: {
    total_conversations: number;
    total_messages: number;
  };
}

// ----------------------------------------------------
// Component
// ----------------------------------------------------

export default function AvatarDashboardPage() {
  const { accessToken } = useAuth();
  const [avatars, setAvatars] = useState<AvatarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use useCallback for better performance/stability
  const fetchAvatars = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      toast.error("Authentication required to fetch avatars.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch avatars.");
      }
      const data = await response.json();
      // Ensure data.results is an array
      setAvatars(Array.isArray(data.results) ? data.results : data); 
      // toast.success("Avatar list refreshed!"); // Reduced excessive toasts
    } catch (error: any) {
      toast.error(error.message || "An error occurred while fetching avatars.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  const totalConversations = avatars.reduce((sum, a) => sum + (a.conversations_count || 0), 0);
  const totalMessages = avatars.reduce((sum, a) => sum + (a.messages_count || 0), 0);

  // --- Utility Components for Dashboard UI ---

  const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: React.ElementType, color: string }) => (
    // Minimalistic card design
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex items-center justify-between transition-shadow duration-300 hover:shadow-lg">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-15`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  );

  const DashboardButtons = () => (
    <div className="flex gap-3 mt-4 sm:mt-0">
      <button
        onClick={fetchAvatars}
        className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
        disabled={loading}
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Refresh List</span>
        <span className="sm:hidden">Refresh</span> {/* Mobile text */}
      </button>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition shadow-md"
        disabled={loading}
      >
        <PlusCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Create New Avatar</span>
        <span className="sm:hidden">Create</span> {/* Mobile text */}
      </button>
    </div>
  );

  // ----------------------------------------------------
  // Render
  // ----------------------------------------------------

  return (
    // Base container ensures responsiveness and no overflow
    <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 space-y-10">
      
      {/* 🚀 Header & Main Actions */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <Brain className="w-8 h-8 text-emerald-600" />
          Avatar Dashboard
        </h1>
        <DashboardButtons />
      </header>
      
      {/* 📊 Analytics Row */}
      {avatars.length > 0 && (
        // Responsive grid with consistent spacing
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> 
          <StatCard 
            title="Total Avatars" 
            value={avatars.length} 
            icon={Brain} 
            color="text-emerald-600" // Consistent color use
          />
          <StatCard 
            title="Total Conversations" 
            value={totalConversations} 
            icon={BarChart2} 
            color="text-indigo-600" // Consistent color use
          />
          <StatCard 
            title="Total Messages Handled" 
            value={totalMessages} 
            icon={Loader2} 
            color="text-yellow-600" // Consistent color use
          />
        </div>
      )}

      {/* 🔄 Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-600 text-lg bg-white rounded-xl shadow-md border border-gray-100">
          <Loader2 className="w-6 h-6 animate-spin mr-3 text-emerald-600" /> 
          Fetching Your Avatars...
        </div>
      ) : (
        <>
          {/* 🖼️ Empty State */}
          {avatars.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border-2 border-dashed border-emerald-300 text-gray-500 text-center p-8 shadow-xl">
              <Brain className="w-16 h-16 text-emerald-500 mb-6" />
              <p className="text-2xl font-bold text-gray-800 mb-2">No Avatars Found</p>
              <p className="mb-6 max-w-md text-gray-600 text-sm">
                It looks like you haven&apos;t created any personalized AI clones yet. Click the button to train your first one!
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-base font-semibold hover:bg-emerald-700 transition shadow-lg transform hover:scale-[1.02]"
              >
                <PlusCircle className="w-5 h-5" />
                Create Your First Avatar
              </button>
            </div>
          ) : (
            <>
              {/* Added top padding and margin for visual separation */}
              <h2 className="text-2xl font-bold text-gray-800 pt-2">Your Deployed Avatars</h2>
              {/* 📝 Avatar List Grid: Highly responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {avatars.map((avatar) => (
                  <AvatarListCard
                    key={avatar.id}
                    id={avatar.id}
                    name={avatar.name}
                    handle={avatar.handle}
                    photoUrl={avatar.photo_url}
                    trained={avatar.trained}
                    // Used optional chaining for safety, though structure implies availability
                    totalConversations={avatar.analytics?.total_conversations ?? 0}
                    totalMessages={avatar.analytics?.total_messages ?? 0}
                    isPublic={false} // Use actual data when available
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <AvatarCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAvatarCreated={fetchAvatars}
      />
    </div>
  );
}