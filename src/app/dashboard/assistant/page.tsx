// app/dashboard/assistant/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, ArrowUp, Brain } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// === Smart Markdown → React renderer ===
const renderMessage = (content: string): React.ReactNode => {
  const lines = content.split("\n").map(line => line.trim()).filter(Boolean);

  // Handle bullet lists: - Item or • Item
  if (lines.every(line => /^\s*[-•]\s/.test(line))) {
    return (
      <ul className="space-y-2">
        {lines.map((line, i) => {
          const text = line.replace(/^\s*[-•]\s+/, "").trim();
          const formatted = formatInline(text);
          return (
            <li key={i} className="flex items-start gap-3">
              <span className="text-emerald-600 mt-1.5">•</span>
              <span className="text-gray-800 leading-relaxed">{formatted}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  // Handle numbered lists: 1. Item
  if (lines.every(line => /^\s*\d+\.\s/.test(line))) {
    return (
      <ol className="space-y-2 list-decimal pl-6">
        {lines.map((line, i) => {
          const text = line.replace(/^\s*\d+\.\s+/, "").trim();
          const formatted = formatInline(text);
          return (
            <li key={i} className="text-gray-800 leading-relaxed pl-2">{formatted}</li>
          );
        })}
      </ol>
    );
  }

  // Default: paragraph with inline formatting
  return lines.map((line, i) => (
    <p key={i} className="mb-3 last:mb-0 text-gray-800 leading-relaxed whitespace-pre-wrap">
      {formatInline(line)}
    </p>
  ));
};

// Inline: **bold**, *italic*, plain text
const formatInline = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g).filter(Boolean);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i} className="italic text-gray-700">{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
};

export default function AssistantPage() {
  const { accessToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => scrollToBottom(), [messages]);

  // Load history
  useEffect(() => {
    if (!accessToken) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistant/chat/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.results || [];
        const sorted = list.sort((a: any, b: any) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setMessages(sorted.length > 0 ? sorted : [{
          id: Date.now(),
          role: "assistant",
          content: "Hey! I'm your second brain. Ask me anything — I'll remember everything.",
          created_at: new Date().toISOString(),
        }]);
      });
  }, [accessToken]);

  // Polling
  useEffect(() => {
    if (!currentTaskId || !accessToken) return;

    const interval = setInterval(async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/assistant/chat/response/${currentTaskId}/`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!res.ok) return;

      const data = await res.json();
      if (data.status === "done") {
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: "assistant",
          content: data.assistant_reply || "Got it.",
          created_at: new Date().toISOString(),
        }]);
        setLoading(false);
        setCurrentTaskId(null);
        clearInterval(interval);
      }
    }, 1200);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setLoading(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        content: "Hmm, that took longer than expected. Try again?",
        created_at: new Date().toISOString(),
      }]);
    }, 45000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [currentTaskId, accessToken]);

  const sendMessage = async () => {
    if (!input.trim() || loading || !accessToken) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistant/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message: input }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.task_id) setCurrentTaskId(data.task_id);
      } else {
        throw new Error();
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        content: "I’m having trouble connecting. Please try again.",
        created_at: new Date().toISOString(),
      }]);
      setLoading(false);
    }
  };

  const quickPrompts = [
    "What did I say about the investor meeting?",
    "Show me all my open todos",
    "Remind me about Mom’s birthday",
    "Summarize my last 3 days",
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-gray-100">
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Whisone Assistant</h1>
                <p className="text-sm text-gray-600">Your second brain — always listening</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">Online</span>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl px-6 py-4 rounded-3xl shadow-sm ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-gray-800 border border-gray-100"
                  }`}
                >
                  <div className="prose prose-sm max-w-none">
                    {renderMessage(msg.content)}
                  </div>
                  <p className={`text-xs mt-3 ${msg.role === "user" ? "text-emerald-100" : "text-gray-500"}`}>
                    {format(new Date(msg.created_at), "h:mm a")}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
                </div>
                <div className="text-gray-600">Thinking...</div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-600 mb-3">Try asking:</p>
            <div className="flex flex-wrap gap-3">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 hover:border-emerald-400 hover:shadow-md transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 bg-white/90 backdrop-blur-lg">
          <div className="px-6 py-5">
            <div className="flex items-center gap-4 bg-gray-50 rounded-3xl px-5 py-4 border border-gray-200 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100 transition">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="p-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-emerald-600/30"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}