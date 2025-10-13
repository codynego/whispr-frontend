"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Mail, Clock, User, Loader2 } from "lucide-react";

export default function MessageDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const [message, setMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      // If less than 24 hours ago, show relative time
      if (diffInHours < 24) {
        if (diffInHours < 1) {
          const mins = Math.floor(diffInMs / (1000 * 60));
          return mins < 1 ? "Just now" : `${mins} min${mins !== 1 ? 's' : ''} ago`;
        }
        const hours = Math.floor(diffInHours);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      }

      // If less than 7 days, show day of week and time
      if (diffInDays < 7) {
        return date.toLocaleDateString('en-US', { 
          weekday: 'long',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true 
        });
      }

      // Otherwise show full date
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return dateString;
    }
  };

  useEffect(() => {
    if (!accessToken || !id) return;

    const fetchMessage = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/emails/messages/${id}/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch message: ${res.statusText}`);
        const data = await res.json();
        setMessage(data);
      } catch (error) {
        console.error("Error fetching message:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [id, accessToken]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-600">Loading message...</p>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <div className="text-center space-y-4 p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-xl">
          <Mail className="w-16 h-16 mx-auto text-slate-300" />
          <h2 className="text-xl font-semibold text-slate-800">Message not found</h2>
          <p className="text-slate-600">The message you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.back()}
            className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 hover:-translate-y-0.5"
          >
            Go back to inbox
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 sm:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="group mb-6 flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 font-medium rounded-xl hover:bg-white/60 backdrop-blur-sm transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Inbox
        </button>

        {/* Message Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 p-8 sm:p-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight">
              {message.subject}
            </h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-indigo-50">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                <div className="p-2 bg-white/20 rounded-lg">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-indigo-200 font-medium">From</span>
                  <span className="font-semibold">{message.sender || message.from_name}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-indigo-200 font-medium">Date</span>
                  <span className="font-semibold">{formatDate(message.received_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Message Body */}
          <article className="p-8 sm:p-10 lg:p-12">
            <div
              className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
              dangerouslySetInnerHTML={{
                __html: message.body_html || message.body || "<p class='text-slate-400 italic'>(No content)</p>",
              }}
            />
          </article>
        </div>
      </div>
    </div>
  );
}