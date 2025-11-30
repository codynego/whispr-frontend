// app/dashboard/vault/[id]/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import {
  ArrowLeft,
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Send,
  Download,
  Clock,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

interface UploadedFile {
  id: number;
  original_filename: string;
  file_type: "pdf" | "docx" | "txt" | "csv" | "image" | "other";
  size: number;
  uploaded_at: string;
  processed: boolean;
  file: string;
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function VaultDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { accessToken } = useAuth();

  const [file, setFile] = useState<UploadedFile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatting, setChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !accessToken) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.ok ? r.json() : router.replace("/dashboard/vault"))
      .then(setFile);
  }, [id, accessToken, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !file || chatting || !file.processed) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setChatting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/${id}/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ query: input }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: "assistant",
          content: data.answer || "I understand.",
          timestamp: new Date().toISOString(),
        }]);
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to get response");
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: "I'm having trouble right now. Try again in a moment.",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setChatting(false);
    }
  };

  const getIcon = (type: string) => {
    const icons: Record<string, React.JSX.Element> = {
      pdf: <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />,
      docx: <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />,
      txt: <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />,
      csv: <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />,
      image: <Image className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />,
      other: <File className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />,
    };
    return icons[type] || icons.other;
  };

  if (!file) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4">
        <p className="text-gray-600">Loading file...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-gray-100 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <button
            onClick={() => router.push("/dashboard/vault")}
            className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 rounded-xl px-3 py-2 transition"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to Vault</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="max-w-5xl mx-auto w-full h-full flex flex-col px-4 sm:px-6 py-4 sm:py-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 flex flex-col overflow-hidden h-full">
            {/* File Header */}
            <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100 shrink-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg shrink-0">
                  {getIcon(file.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                    {file.original_filename}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                    Uploaded {format(new Date(file.uploaded_at), "MMM d, yyyy")}
                  </p>
                </div>
                <a
                  href={file.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 text-white rounded-xl sm:rounded-2xl font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2 text-sm sm:text-base shrink-0"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="sm:inline">Open File</span>
                </a>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
                {!file.processed ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center px-4">
                    <Clock className="w-12 h-12 sm:w-16 sm:h-16 mb-4 animate-spin text-emerald-600" />
                    <p className="text-lg sm:text-xl font-medium">Preparing your file for chat...</p>
                    <p className="text-xs sm:text-sm mt-2">This usually takes a few seconds</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center px-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                      <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600" />
                    </div>
                    <p className="text-xl sm:text-2xl font-medium mb-2">Ask me anything about this file</p>
                    <p className="text-sm sm:text-base max-w-md">
                      Summarize it, find key points, extract data, or just chat — I've read every word.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-2xl px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl shadow-sm ${
                            msg.role === "user"
                              ? "bg-emerald-600 text-white"
                              : "bg-white text-gray-800 border border-gray-100"
                          }`}
                        >
                          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                          <p className={`text-xs mt-2 sm:mt-3 ${msg.role === "user" ? "text-emerald-100" : "text-gray-500"}`}>
                            {format(new Date(msg.timestamp), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 bg-white/90 backdrop-blur-lg shrink-0">
                <div className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-end gap-2 sm:gap-3">
                    <div className="flex-1 bg-gray-50 rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-4 border border-gray-200 focus-within:border-emerald-400 focus-within:ring-2 sm:focus-within:ring-4 focus-within:ring-emerald-100 transition">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                        placeholder={file.processed ? "Ask about this file..." : "Waiting for file..."}
                        className="w-full bg-transparent outline-none text-sm sm:text-base text-gray-800 placeholder-gray-500"
                        disabled={chatting || !file.processed}
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={chatting || !input.trim() || !file.processed}
                      className="p-3 sm:p-3.5 bg-emerald-600 text-white rounded-xl sm:rounded-2xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-emerald-600/30 shrink-0"
                    >
                      {chatting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}