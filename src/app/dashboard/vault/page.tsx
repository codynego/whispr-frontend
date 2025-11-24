"use client";

import { useState, useEffect, useRef } from "react";
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
  Download,
  RefreshCw,
  MessageSquarePlus,
  CheckSquare,
  Bell,
  Search,
  Trash2,
  Eye,
  Send,
  Paperclip,
  Grid3x3,
  List,
  Filter,
  ArrowLeft,
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

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

type ViewMode = "list" | "grid";
type ActiveView = "files" | "preview" | "chat";

export default function VaultPage() {
  const { accessToken } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeView, setActiveView] = useState<ActiveView>("files");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (accessToken) fetchFiles();
  }, [accessToken]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const tempFile: UploadedFile = {
      id: Date.now(),
      original_filename: file.name,
      file_type: "other",
      size: file.size,
      uploaded_at: new Date().toISOString(),
      processed: false,
      content: null,
      file: "",
    };

    setFiles(prev => [tempFile, ...prev]);
    setUploading(true);

    try {
      const res = await fetch(`${API_URL}/whisone/files/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (res.ok) {
        const uploaded = await res.json();
        setFiles(prev => prev.map(f => (f.id === tempFile.id ? uploaded : f)));
        toast.success(`${file.name} uploaded`);
      } else {
        throw new Error();
      }
    } catch {
      setFiles(prev => prev.filter(f => f.id !== tempFile.id));
      toast.error(`Failed to upload ${file.name}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(uploadFile);
  };

  const reprocess = async (id: number) => {
    try {
      await fetch(`${API_URL}/whisone/files/${id}/reprocess/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast.success("Reprocessing started");
      setFiles(prev => prev.map(f => (f.id === id ? { ...f, processed: false } : f)));
    } catch {
      toast.error("Failed to reprocess");
    }
  };

  const deleteFile = async (id: number) => {
    if (!confirm("Delete this file permanently?")) return;
    await fetch(`${API_URL}/whisone/files/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFile?.id === id) {
      setSelectedFile(null);
      setActiveView("files");
    }
    toast.success("File deleted");
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedFile || isSending) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsSending(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: `I've analyzed "${selectedFile.original_filename}". ${inputMessage.includes("summary") ? "Here's a summary: This document contains important information..." : "Based on your question, here's what I found in the document..."}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsSending(false);
    }, 1500);
  };

  const getIcon = (type: string, className = "w-5 h-5") => {
    switch (type) {
      case "pdf": return <FileText className={`${className} text-red-600`} />;
      case "docx": return <FileText className={`${className} text-blue-600`} />;
      case "txt": return <FileText className={`${className} text-gray-600`} />;
      case "csv": return <FileSpreadsheet className={`${className} text-green-600`} />;
      case "image": return <Image className={`${className} text-purple-600`} />;
      default: return <File className={`${className} text-gray-600`} />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredFiles = files.filter(f =>
    f.original_filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openFilePreview = (file: UploadedFile) => {
    setSelectedFile(file);
    setActiveView("preview");
    setMessages([]);
  };

  const openFileChat = (file: UploadedFile) => {
    setSelectedFile(file);
    setActiveView("chat");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <File className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Vault</h1>
                <p className="text-xs text-gray-500">{files.length} files stored</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1920px] mx-auto px-6 py-6 flex gap-6 h-[calc(100vh-88px)]">
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col ${activeView !== "files" ? "hidden lg:flex" : ""}`}>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-emerald-100 text-emerald-700" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition ${viewMode === "list" ? "bg-emerald-100 text-emerald-700" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`mb-6 border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              dragActive ? "border-emerald-500 bg-emerald-50/50 scale-[1.02]" : "border-gray-300 hover:border-emerald-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.csv,.png,.jpg,.jpeg"
              onChange={(e) => e.target.files && Array.from(e.target.files).forEach(uploadFile)}
              className="hidden"
            />
            <Upload className={`w-12 h-12 mx-auto mb-3 ${dragActive ? "text-emerald-600" : "text-gray-400"}`} />
            <p className="text-lg font-medium text-gray-700 mb-1">
              {dragActive ? "Drop your files here" : "Drag & drop files"}
            </p>
            <p className="text-sm text-gray-500">
              PDF, DOCX, TXT, CSV, Images • Max 10MB
            </p>
          </div>

          {/* Files Display */}
          <div className="flex-1 overflow-y-auto">
            {filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <File className="w-20 h-20 mb-4" />
                <p className="text-lg font-medium">No files found</p>
                <p className="text-sm">Upload your first file to get started</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="group bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-lg hover:border-emerald-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        {getIcon(file.file_type, "w-6 h-6")}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => openFilePreview(file)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-medium text-gray-900 mb-2 truncate" title={file.original_filename}>
                      {file.original_filename}
                    </h3>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>{formatBytes(file.size)}</span>
                      <span>{format(new Date(file.uploaded_at), "MMM d, yyyy")}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      {file.processed ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs text-emerald-600 font-medium">Processed</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-yellow-600 animate-spin" />
                          <span className="text-xs text-yellow-600 font-medium">Processing...</span>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openFileChat(file)}
                        disabled={!file.processed}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-lg text-xs font-medium transition"
                      >
                        Ask Questions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 pb-4">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="group bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-4"
                  >
                    <div className="p-2 bg-gray-50 rounded-lg">
                      {getIcon(file.file_type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{file.original_filename}</h3>
                      <p className="text-sm text-gray-500">
                        {formatBytes(file.size)} • {format(new Date(file.uploaded_at), "MMM d")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {file.processed ? (
                        <div className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Ready</span>
                        </div>
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-600 animate-spin" />
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openFileChat(file)}
                        disabled={!file.processed}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-lg text-xs font-medium transition"
                      >
                        Chat
                      </button>
                      <button
                        onClick={() => openFilePreview(file)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview or Chat */}
        {(activeView === "preview" || activeView === "chat") && selectedFile && (
          <div className="w-full lg:w-[500px] bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col">
            {/* Panel Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => setActiveView("files")}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {getIcon(selectedFile.file_type)}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{selectedFile.original_filename}</h3>
                  <p className="text-xs text-gray-500">{formatBytes(selectedFile.size)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView(activeView === "preview" ? "chat" : "preview")}
                  className={`p-2 rounded-lg transition ${activeView === "chat" ? "bg-emerald-100 text-emerald-700" : "hover:bg-gray-100"}`}
                  title="Toggle Chat"
                >
                  <MessageSquarePlus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => { setSelectedFile(null); setActiveView("files"); }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Panel Content */}
            {activeView === "preview" ? (
              <div className="flex-1 overflow-y-auto p-6">
                {!selectedFile.processed ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <RefreshCw className="w-12 h-12 mb-4 animate-spin text-emerald-600" />
                    <p className="text-lg font-medium">Processing file...</p>
                    <p className="text-sm">This may take a moment</p>
                  </div>
                ) : selectedFile.content ? (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">Extracted Content</h4>
                        <span className="text-xs text-gray-500">{selectedFile.content.length} characters</span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-[400px] overflow-y-auto border border-gray-200">
                        {selectedFile.content}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900">Quick Actions</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <button className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition flex flex-col items-center gap-2 text-emerald-700">
                          <MessageSquarePlus className="w-5 h-5" />
                          <span className="text-xs font-medium">Note</span>
                        </button>
                        <button className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition flex flex-col items-center gap-2 text-emerald-700">
                          <CheckSquare className="w-5 h-5" />
                          <span className="text-xs font-medium">Task</span>
                        </button>
                        <button className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition flex flex-col items-center gap-2 text-emerald-700">
                          <Bell className="w-5 h-5" />
                          <span className="text-xs font-medium">Alert</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <a
                        href={selectedFile.file}
                        target="_blank"
                        className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                      <button
                        onClick={() => reprocess(selectedFile.id)}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reprocess
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <FileText className="w-12 h-12 mb-4" />
                    <p className="text-lg font-medium">No content extracted</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <MessageSquarePlus className="w-12 h-12 mb-4" />
                      <p className="text-lg font-medium">Ask anything about this file</p>
                      <p className="text-sm text-center mt-2 max-w-xs">
                        Get summaries, extract key points, or ask specific questions
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            msg.role === "user"
                              ? "bg-emerald-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.role === "user" ? "text-emerald-200" : "text-gray-500"}`}>
                            {format(msg.timestamp, "h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-200">
                  {!selectedFile.processed ? (
                    <div className="text-center py-4 text-sm text-gray-500">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-600 animate-spin" />
                      Waiting for file to be processed...
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                          placeholder="Ask a question about this file..."
                          className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                          disabled={isSending}
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 rounded-lg transition">
                          <Paperclip className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isSending}
                        className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-xl transition"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}