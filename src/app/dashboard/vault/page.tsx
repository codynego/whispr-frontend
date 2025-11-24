// app/dashboard/vault/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import {
  Upload,
  FileText,
  Image,
  FileSpreadsheet,
  File,
  X,
  CheckCircle,
  Clock,

  Send,
  Brain,
  Trash2,
} from "lucide-react";
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

export default function VaultPage() {
  const { accessToken } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [chatting, setChatting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (accessToken) fetchFiles();
  }, [accessToken]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API_URL}/whisone/files/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const temp: UploadedFile = {
      id: Date.now(),
      original_filename: file.name,
      file_type: "other",
      size: file.size,
      uploaded_at: new Date().toISOString(),
      processed: false,
      content: null,
      file: "",
    };

    setFiles(prev => [temp, ...prev]);
    setUploading(true);

    try {
      const res = await fetch(`${API_URL}/whisone/files/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      if (res.ok) {
        const uploaded = await res.json();
        setFiles(prev => prev.map(f => (f.id === temp.id ? uploaded : f)));
        toast.success("File uploaded");
      }
    } catch {
      setFiles(prev => prev.filter(f => f.id !== temp.id));
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (id: number) => {
    if (!confirm("Delete forever?")) return;
    await fetch(`${API_URL}/whisone/files/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFile?.id === id) setSelectedFile(null);
    toast.success("File deleted");
  };

  const sendChatMessage = async () => {
    if (!input.trim() || !selectedFile || chatting) return;

    const userMsg = { id: Date.now(), role: "user" as const, content: input, timestamp: new Date().toISOString() };
    setChatMessages(prev => [...prev, userMsg]);
    setInput("");
    setChatting(true);

    try {
      const res = await fetch(`${API_URL}/whisone/files/${selectedFile.id}/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message: input }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: "assistant",
          content: data.reply || "I understand.",
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch {
      toast.error("Chat failed");
    } finally {
      setChatting(false);
    }
  };

  const getIcon = (type: string) => {
    const icons = {
      pdf: <FileText className="w-6 h-6 text-red-600" />,
      docx: <FileText className="w-6 h-6 text-blue-600" />,
      txt: <FileText className="w-6 h-6 text-gray-600" />,
      csv: <FileSpreadsheet className="w-6 h-6 text-green-600" />,
      image: <Image className="w-6 h-6 text-purple-600" />,
      other: <File className="w-6 h-6 text-gray-600" />,
    };
    return icons[type as keyof typeof icons] || icons.other;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <File className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vault</h1>
              <p className="text-gray-600">{files.length} files • Your second brain’s memory</p>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition flex items-center gap-3 shadow-lg"
          >
            <Upload className="w-5 h-5" />
            {uploading ? "Uploading..." : "Upload File"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.csv,.png,.jpg,.jpeg"
            onChange={(e) => e.target.files && Array.from(e.target.files).forEach(uploadFile)}
            className="hidden"
          />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-8">
        {/* File List */}
        <div className="lg:col-span-2 space-y-5">
          {loading ? (
            <div className="text-center py-20 text-gray-500">
              <Clock className="w-16 h-16 mx-auto mb-4 animate-spin text-emerald-600" />
              <p>Loading your vault...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <File className="w-20 h-20 mx-auto mb-6 text-gray-300" />
              <p className="text-xl font-medium">Your vault is empty</p>
              <p className="mt-2">Upload a file to begin</p>
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-300 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-5">
                  {getIcon(file.file_type)}
                  <div>
                    <p className="font-medium text-gray-900">{file.original_filename}</p>
                    <p className="text-sm text-gray-500">
                      {formatBytes(file.size)} • {format(new Date(file.uploaded_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {file.processed ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <Clock className="w-6 h-6 text-yellow-600 animate-spin" />
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                    className="p-2 hover:bg-red-50 rounded-xl transition"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Preview + Chat Panel */}
        <div className="lg:col-span-1">
          {selectedFile ? (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 h-full flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4 truncate">
                  {getIcon(selectedFile.file_type)}
                  <h3 className="font-bold text-gray-900 truncate">{selectedFile.original_filename}</h3>
                </div>
                <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Extracted Text */}
              <div className="flex-1 p-6 overflow-y-auto">
                {!selectedFile.processed ? (
                  <div className="text-center py-16 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 animate-spin text-emerald-600" />
                    <p>Extracting content...</p>
                  </div>
                ) : selectedFile.content ? (
                  <div>
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">
                      {selectedFile.content}
                    </p>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-16">No text extracted</p>
                )}
              </div>

              {/* Chat */}
              <div className="border-t border-gray-100">
                <div className="h-64 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Brain className="w-12 h-12 mx-auto mb-3 text-emerald-600" />
                      <p>Ask anything about this file</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs px-4 py-3 rounded-2xl ${
                          msg.role === "user" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-800"
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-gray-100">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                      placeholder="Ask about this file..."
                      className="flex-1 px-4 py-3 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      disabled={chatting || !selectedFile.processed}
                    />
                    <button
                      onClick={sendChatMessage}
                      disabled={chatting || !input.trim() || !selectedFile.processed}
                      className="p-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 disabled:opacity-50 transition"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center h-full flex items-center justify-center">
              <div>
                <File className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                <p className="text-gray-500">Select a file to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}