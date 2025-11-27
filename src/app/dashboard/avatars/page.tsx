"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { PlusCircle, Brain, RefreshCw, Loader2 } from "lucide-react";
import { AvatarListCard } from "@/components/avatars/AvatarListCard"; 
import { AvatarCreationModal } from "@/components/avatars/AvatarCreationModal"; 
import toast from "react-hot-toast"; 

interface AvatarData {
  id: string;
  name: string;
  handle: string;
  photo_url?: string | null;
  trained: boolean;
  analytics: {
    total_conversations: number;
    total_messages: number;
  };
}

export default function AvatarDashboardPage() {
  const { accessToken } = useAuth();
  const [avatars, setAvatars] = useState<AvatarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAvatars = async () => {
    if (!accessToken) {
      setLoading(false);
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
      setAvatars(data.results || []); // Assuming paginated response with a 'results' key
    } catch (error: any) {
      toast.error(error.message || "An error occurred while fetching avatars.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatars();
  }, [accessToken]); // Refetch when access token changes

  return (
    <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Brain className="w-8 h-8 text-emerald-600" />
          My Avatars
        </h1>
        <div className="flex gap-3">
            <button
            onClick={fetchAvatars}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            disabled={loading}
            >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
            </button>
            <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
            disabled={loading}
            >
            <PlusCircle className="w-4 h-4" />
            Create New Avatar
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-600 text-lg">
          <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading Avatars...
        </div>
      ) : (
        <>
          {avatars.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-dashed border-gray-200 text-gray-500 text-center p-8">
              <Brain className="w-16 h-16 text-emerald-400 mb-6" />
              <p className="text-xl font-semibold mb-4">No Avatars created yet.</p>
              <p className="mb-6 max-w-md">
                Your personalized AI clones will appear here. Click the button below to get started!
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg text-base font-medium hover:bg-emerald-700 transition shadow-md"
              >
                <PlusCircle className="w-5 h-5" />
                Create Your First Avatar
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {avatars.map((avatar) => (
                <AvatarListCard
                  key={avatar.id}
                  id={avatar.id}
                  name={avatar.name}
                  handle={avatar.handle}
                  photoUrl={avatar.photo_url}
                  trained={avatar.trained}
                  totalConversations={avatar.analytics?.total_conversations || 0}
                  totalMessages={avatar.analytics?.total_messages || 0}
                  isPublic={false} // or use avatar.isPublic if available
                />
              ))}
            </div>
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