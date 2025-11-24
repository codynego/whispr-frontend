// app/dashboard/vault/[id]/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { ArrowLeft, FileText, Image, FileSpreadsheet, File, Send, Brain, Download, Clock } from "lucide-react";
import { toast } from "sonner";

interface UploadedFile {
  id: number;
  original_filename: string;
  file_type: "pdf" | "docx" | "txt" | "csv" | "image" | "other";
  size: number;
  uploaded_at: string;
  processed: boolean;
  content: string | null;
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
    if (!input.trim() || !file || chatting) return;

    const userMsg = { id: Date.now(), role: "user" as const, content: input, timestamp: new Date().toISOString() };
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
          content: data.answer || "Got it.",
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch {
      toast.error("Failed to chat");
    } finally {
      setChatting(false);
    }
  };

  const getIcon = (type: string) => {
    const icons: Record<string, React.ReactElement> = {
      pdf: <FileText className="w-8 h-8 text-red-600" />,
      docx: <FileText className="w-8 h-8 text-blue-600" />,
      txt: <FileText className="w-8 h-8 text-gray-600" />,
      csv: <FileSpreadsheet className="w-8 h-8 text-green-600" />,
      image: <Image className="w-8 h-8 text-purple-600" />,
    };
    return icons[type] || <File className="w-8 h-8 text-gray-600" />;
  };

  if (!file) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <p className="text-gray-600">Loading file...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard/vault")}
            className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-xl px-4 py-3 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Vault
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* File Info */}
          <div className="p-10 border-b border-gray-100">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-lg">
                {getIcon(file.file_type)}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{file.original_filename}</h1>
                <p className="text-gray-600 mt-2">
                  Uploaded {format(new Date(file.uploaded_at), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <a
                href={file.file}
                target="_blank"
                className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-medium hover:bg-emerald-700 transition flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Open File
              </a>
            </div>
          </div>

          {/* Extracted Text */}
          <div className="p-10">
            {!file.processed ? (
              <div className="text-center py-16 text-gray-500">
                <Clock className="w-16 h-16 mx-auto mb-4 animate-spin text-emerald-600" />
                <p className="text-xl">Extracting content...</p>
              </div>
            ) : file.content ? (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Brain className="w-7 h-7 text-emerald-600" />
                  Extracted Text
                </h2>
                <div className="bg-gray-50 rounded-2xl p-6 text-gray-800 whitespace-pre-wrap leading-relaxed border border-gray-200">
                  {file.content}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-16">No text could be extracted</p>
            )}
          </div>

          {/* Chat */}
          <div className="border-t border-gray-100">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Ask About This File</h2>
              <div className="h-96 overflow-y-auto mb-6 space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-3 text-emerald-600" />
                    <p>Ask anything about this file</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-md px-5 py-3 rounded-2xl ${
                        msg.role === "user" ? "bg-emerald-600 text-white" : "bg-white border border-gray-200 text-gray-800"
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask about this file..."
                  className="flex-1 px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 transition"
                  disabled={chatting || !file.processed}
                />
                <button
                  onClick={sendMessage}
                  disabled={chatting || !input.trim() || !file.processed}
                  className="px-6 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 disabled:opacity-50 transition flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}