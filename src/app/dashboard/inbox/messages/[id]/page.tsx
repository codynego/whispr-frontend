"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Mail, Clock, User } from "lucide-react";


export default function MessageDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const [message, setMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Loading message...
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <p>Message not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-indigo-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 p-6 sm:p-10">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center text-gray-600 hover:text-indigo-600"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Inbox
      </button>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10">
        <header className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{message.subject}</h1>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{message.sender || message.from_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{message.date || "Unknown date"}</span>
            </div>
          </div>
        </header>

        <article className="prose prose-sm sm:prose-base max-w-none text-gray-800">
          <div
            dangerouslySetInnerHTML={{
              __html: message.body_html || message.body || "<p>(No content)</p>",
            }}
          />
        </article>
      </div>
    </div>
  );
}
