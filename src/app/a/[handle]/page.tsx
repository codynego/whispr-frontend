// src/components/PublicChatShell.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Brain, ArrowUp, Sparkles, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { ChatMessageBubble } from "@/components/avatars/ChatMessageBubble";

interface AvatarProfile {
  id: string;
  name: string;
  handle: string;
  photo_url: string | null;
  settings: {
    is_public: boolean;
    disclaimer_text: string;
  };
}

interface Message {
  id: number | string;
  role: "visitor" | "assistant" | "owner";
  content: string;
  created_at: string;
}

interface HistoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Message[];
}

const CHAT_TIMEOUT_MS = 45000;
const CHAT_POLL_INTERVAL_MS = 1200;

export default function PublicChatShell({ params }: { params: { handle: string } }) {
  const avatarHandle = params.handle;

  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [profile, setProfile] = useState<AvatarProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Visitor ID
  useEffect(() => {
    let id = localStorage.getItem("whisone_visitor_id");
    if (!id) {
      id = `vis_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem("whisone_visitor_id", id);
    }
    setVisitorId(id);
  }, []);

  // Fetch profile + history
  const fetchProfileAndHistory = useCallback(async () => {
    if (!visitorId) return;
    setLoading(true);

    try {
      const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/public/`);
      if (!profileRes.ok) throw new Error("Avatar not found or not public");

      const profileData = await profileRes.json();
      setProfile(profileData);

      const historyRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/history/?visitor_id=${visitorId}`
      );
      if (!historyRes.ok) throw new Error("Failed to load chat history");

      const history: HistoryResponse = await historyRes.json();
      const sorted = history.results.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      setMessages(
        sorted.length > 0
          ? sorted
          : [
              {
                id: "intro",
                role: "assistant",
                content: `Hi! I'm ${profileData.name}'s AI. Ask me anything about their work, notes, or expertise!`,
                created_at: new Date().toISOString(),
              },
            ]
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to load Avatar");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [avatarHandle, visitorId]);

  useEffect(() => {
    if (visitorId) fetchProfileAndHistory();
  }, [visitorId, fetchProfileAndHistory]);

  useEffect(() => scrollToBottom(), [messages]);

  // Polling for response
  useEffect(() => {
    if (!currentTaskId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/chat-tasks/${currentTaskId}/status/`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "SUCCESS" || data.status === "FAILURE") {
          clearInterval(interval);
          setCurrentTaskId(null);
          setIsSending(false);

          if (data.status === "SUCCESS" && data.assistant_reply) {
            const reply = data.assistant_reply.trim();
            setMessages((prev) => {
              if (prev.some(m => m.content === reply && m.role === "assistant")) return prev;
              return [...prev, {
                id: Date.now(),
                role: "assistant",
                content: reply,
                created_at: new Date().toISOString(),
              }];
            });
          } else {
            toast.error("Avatar couldn't respond. Try again.");
          }
        }
      } catch {}
    }, CHAT_POLL_INTERVAL_MS);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setCurrentTaskId(null);
      setIsSending(false);
      toast.error("Response timed out");
    }, CHAT_TIMEOUT_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [currentTaskId]);

  const sendMessage = async () => {
    if (!input.trim() || isSending || !visitorId) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "visitor",
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, visitor_id: visitorId }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentTaskId(data.task_id);
      } else {
        throw new Error("Failed to send message");
      }
    } catch {
      toast.error("Failed to send message");
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center animate-pulse mb-6">
            <Brain className="w-12 h-12 text-emerald-600" />
          </div>
          <p className="text-xl font-medium text-gray-700">Waking up @{avatarHandle}...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md p-8 bg-white/90 backdrop-blur rounded-3xl shadow-2xl border border-gray-200">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Avatar Not Found</h1>
          <p className="text-gray-600">@{avatarHandle} is either private or doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">

        {/* Floating Header */}
        <header className="relative bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl overflow-hidden ring-4 ring-white/30 shadow-2xl">
                {profile.photo_url ? (
                  <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.name}&apos;s AI</h1>
              <p className="text-emerald-100">@{profile.handle} • Public Chat</p>
            </div>
          </div>
        </header>

        {/* Disclaimer */}
        {profile.settings.disclaimer_text && (
          <div className="mx-6 -mt-4 relative z-10">
            <div className="bg-amber-50 border border-amber-300 text-amber-900 px-5 py-3 rounded-2xl text-sm font-medium shadow-md">
              <span className="font-bold">Note:</span> {profile.settings.disclaimer_text}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="h-96 md:h-[520px] overflow-y-auto px-6 py-8 space-y-6 bg-gradient-to-b from-white/60 to-white/30">
          {messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              message={msg}
              avatarPhotoUrl={profile.photo_url}
              avatarName={profile.name}
            />
          ))}

          {isSending && (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center animate-pulse">
                <Brain className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="bg-gray-100 text-gray-600 px-5 py-3 rounded-3xl max-w-xs italic">
                Thinking deeply...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Input */}
        <div className="p-6 pt-4 bg-gradient-to-t from-white to-white/80">
          <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={isSending ? "Avatar is thinking..." : "Ask me anything..."}
              disabled={isSending}
              className="flex-1 px-5 py-4 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none text-base"
            />
            <button
              onClick={sendMessage}
              disabled={isSending || !input.trim()}
              className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white rounded-3xl shadow-lg transition-all duration-300 hover:scale-110 disabled:scale-100"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-3">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}