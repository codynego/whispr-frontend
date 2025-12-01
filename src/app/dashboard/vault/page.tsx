"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import {
  Upload,
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Trash2,
  CheckCircle,
  Clock,
  Send,
  Download,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

// --- Type Definitions (Centralized) ---

interface UploadedFile {
  id: number;
  original_filename: string;
  file_type: "pdf" | "docx" | "txt" | "csv" | "image" | "other";
  size: number;
  uploaded_at: string;
  processed: boolean;
  file?: string; // Optional: file URL, only available on detail fetch
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// --- Utility Functions (Adapted from both original files) ---

const getIcon = (type: string, className: string = "w-6 h-6") => {
  const icons: Record<string, React.JSX.Element> = {
    pdf: <FileText className={`text-red-600 ${className}`} />,
    docx: <FileText className={`text-blue-600 ${className}`} />,
    txt: <FileText className={`text-gray-600 ${className}`} />,
    csv: <FileSpreadsheet className={`text-green-600 ${className}`} />,
    image: <Image className={`text-purple-600 ${className}`} />,
  };
  return icons[type] || <File className={`text-gray-600 ${className}`} />;
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// --- VaultChatView Component ---

function VaultChatView({
  fileId,
  accessToken,
  onClose,
}: {
  fileId: number | null;
  accessToken: string | null;
  onClose: () => void;
}) {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatting, setChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch file details when fileId changes
  useEffect(() => {
    if (!fileId || !accessToken) {
      setFile(null);
      setMessages([]);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/${fileId}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : (onClose(), null))) // Close if fetch fails
      .then((data) => {
        if (data) {
          setFile(data);
          // For now, starting with a clean slate
          setMessages([]);
        }
      })
      .catch(() => onClose()); // Close on error
  }, [fileId, accessToken, onClose]);

  // Auto-scroll chat window
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !file || chatting || !file.processed) return;

    const query = input;
    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setChatting(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/whisone/files/${file.id}/chat/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ query }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: data.answer || "I understand.",
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to get response");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "I'm having trouble right now. Try again in a moment.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setChatting(false);
    }
  };

  // Only render when a file is selected (handled by parent)
  if (!fileId) return null;

  if (!file) {
    return (
      <div className="flex-1 min-h-full flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl p-10">
        <Clock className="w-16 h-16 mx-auto mb-4 animate-spin text-emerald-600" />
        <p className="text-gray-600">Loading file details...</p>
      </div>
    );
  }

  return (
    // Responsive: h-[85vh] on mobile/tablet, h-full on desktop (set by grid)
    // col-span-full on mobile, lg:col-span-2 on desktop
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col h-[85vh] lg:h-full col-span-full lg:col-span-2 xl:col-span-3">
      {/* File Header */}
      <div className="p-6 md:p-8 border-b border-gray-100 flex items-start justify-between">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button
            onClick={onClose}
            className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-xl transition lg:hidden flex-shrink-0"
            title="Back to file list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            {getIcon(file.file_type, "w-6 h-6")}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {file.original_filename}
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Uploaded {format(new Date(file.uploaded_at), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        {file.file && (
          <a
            href={file.file}
            target="_blank"
            className="ml-4 px-4 py-2 text-sm bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition flex items-center gap-2 flex-shrink-0"
            rel="noopener noreferrer"
          >
            <Download className="w-4 h-4" />
            Open
          </a>
        )}
      </div>

      {/* Chat Area */}
      {/* IMPORTANT: flex-1 on the container, overflow-y-auto on the message wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {!file.processed ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <Clock className="w-16 h-16 mb-4 animate-spin text-emerald-600" />
              <p className="text-xl font-medium">Preparing file for chat...</p>
              <p className="text-sm mt-2">This usually takes a few seconds</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="w-12 h-12 text-emerald-600" />
              </div>
              <p className="text-2xl font-medium mb-2">
                Ask me anything about this file
              </p>
              <p className="text-center max-w-md text-sm">
                Summarize it, find key points, extract data, or just chat — I’ve
                read every word.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    // max-w-full to prevent overflow on small screens
                    className={`max-w-full sm:max-w-2xl px-6 py-4 rounded-3xl shadow-sm ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-gray-800 border border-gray-100"
                    }`}
                  >
                    <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <p
                      className={`text-xs mt-3 ${
                        msg.role === "user" ? "text-emerald-100" : "text-gray-500"
                      }`}
                    >
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
        <div className="border-t border-gray-200 bg-white/90 backdrop-blur-lg flex-shrink-0">
          <div className="p-4 md:p-5">
            <div className="flex items-center gap-4 bg-gray-50 rounded-3xl px-5 py-4 border border-gray-200 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100 transition">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && sendMessage()
                }
                placeholder={
                  file.processed
                    ? "Ask about this file..."
                    : "Waiting for file to be ready..."
                }
                className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500"
                disabled={chatting || !file.processed}
              />
              <button
                onClick={sendMessage}
                disabled={chatting || !input.trim() || !file.processed}
                className="p-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-emerald-600/30 flex-shrink-0"
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
  );
}

// --- VaultList Component (Extracted File List) ---

function VaultList({
  files,
  loading,
  selectedFileId,
  setSelectedFileId,
  deleteFile,
}: {
  files: UploadedFile[];
  loading: boolean;
  selectedFileId: number | null;
  setSelectedFileId: (id: number) => void;
  deleteFile: (id: number) => Promise<void>;
}) {
  const fileListContent = loading ? (
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
    <div className="space-y-4">
      {files.map((file) => (
        <div
          key={file.id}
          onClick={() => setSelectedFileId(file.id)}
          className={`group bg-white rounded-2xl p-4 shadow-sm border ${
            selectedFileId === file.id
              ? "border-emerald-400 ring-4 ring-emerald-100"
              : "border-gray-100 hover:shadow-lg hover:border-emerald-300"
          } transition cursor-pointer`}
        >
          <div className="flex items-center justify-between min-w-0">
            <div className="flex items-center min-w-0 flex-1">
              <div className="p-2 bg-gray-50 rounded-xl mr-3 group-hover:bg-emerald-50 transition flex-shrink-0">
                {getIcon(file.file_type)}
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {file.original_filename}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center">
                  {formatBytes(file.size)} •{" "}
                  {format(new Date(file.uploaded_at), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center ml-4 flex-shrink-0">
              <div className="flex items-center gap-2 mr-4">
                {file.processed ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-yellow-600 animate-spin" />
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFile(file.id);
                }}
                className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-xl transition"
                title="Delete File"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    // Only show file list in its grid column on large screens
    // On small screens, it takes the full width when selectedFileId is null
    <div className={`col-span-full lg:col-span-1 xl:col-span-1 ${selectedFileId ? 'hidden lg:block' : ''}`}>
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 h-full">
        {fileListContent}
      </div>
    </div>
  );
}

// --- VaultListPage Component (Main logic) ---

export default function VaultListPage() {
  const { accessToken } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Ensure data is sorted by uploaded_at descending
        const sortedFiles = Array.isArray(data) ? data : data.results || [];
        setFiles(
          sortedFiles.sort(
            (a: UploadedFile, b: UploadedFile) =>
              new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) fetchFiles();
  }, [accessToken, fetchFiles]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const fileType = file.type.split('/')[1] || 'other';
    const temp: UploadedFile = {
      id: Date.now(),
      original_filename: file.name,
      // Simple logic to set file_type, expanded for common types
      file_type: file.type.includes('pdf') ? 'pdf' : file.type.includes('image') ? 'image' : file.name.endsWith('.csv') ? 'csv' : file.name.endsWith('.txt') ? 'txt' : 'other',
      size: file.size,
      uploaded_at: new Date().toISOString(),
      processed: false,
    };

    setFiles((prev) => [temp, ...prev]);
    setUploading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      if (res.ok) {
        const uploaded = await res.json();
        setFiles((prev) =>
          prev.map((f) => (f.id === temp.id ? uploaded : f))
        );
        toast.success("File uploaded and processing started!");
        setSelectedFileId(uploaded.id);
      } else {
        throw new Error('Upload failed on server');
      }
    } catch {
      setFiles((prev) => prev.filter((f) => f.id !== temp.id));
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (id: number) => {
    if (!accessToken) return;
    if (!confirm("Delete this file permanently?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setFiles((prev) => prev.filter((f) => f.id !== id));
      toast.success("File deleted successfully.");
      if (selectedFileId === id) {
        setSelectedFileId(null);
      }
    } catch (error) {
        toast.error("Failed to delete file.");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-gray-100 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <File className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vault</h1>
              <p className="text-gray-600">{files.length} files</p>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition flex items-center gap-3 shadow-lg flex-shrink-0"
          >
            <Upload className="w-5 h-5" />
            {uploading ? "Uploading..." : "Upload File"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.csv,.png,.jpg,.jpeg"
            onChange={(e) =>
              e.target.files && Array.from(e.target.files).forEach(uploadFile)
            }
            className="hidden"
          />
        </div>
      </header>

      {/* Main Content Area */}
      {/* Use Grid to manage the list and chat view. min-h-0 is essential for flex-1/h-full on children */}
      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8 h-full">
          {/* File List / Master View */}
          <VaultList
            files={files}
            loading={loading}
            selectedFileId={selectedFileId}
            setSelectedFileId={setSelectedFileId}
            deleteFile={deleteFile}
          />

          {/* Chat View / Detail View */}
          {selectedFileId && (
            <VaultChatView
              fileId={selectedFileId}
              accessToken={accessToken}
              onClose={() => setSelectedFileId(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
}