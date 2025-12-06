"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
  Plus,
  MoreVertical,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

interface UploadedFile {
  id: number;
  original_filename: string;
  file_type: "pdf" | "docx" | "txt" | "csv" | "image" | "other";
  size: number;
  uploaded_at: string;
  processed: boolean;
  title: string;
}

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf": return <FileText className="w-5 h-5 text-red-600" />;
    case "image": return <Image className="w-5 h-5 text-purple-600" />;
    case "csv": return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    default: return <File className="w-5 h-5 text-gray-600" />;
  }
};

const formatBytes = (bytes: number) => {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function VaultPage() {
  const { user, loading: authLoading } = useAuth(); // No accessToken!
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reprocessingIds, setReprocessingIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    if (authLoading || !user) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/`, {
        credentials: "include", // Sends HttpOnly cookies
      });

      if (!res.ok) throw new Error("Failed to load files");

      const data = await res.json();
      setFiles(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Failed to load files:", err);
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (!user) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/`, {
        method: "POST",
        credentials: "include", // Sends cookies
        body: formData,
      });

      if (res.ok) {
        const uploaded = await res.json();
        setFiles((prev) => [uploaded, ...prev]);
        toast.success(`"${file.name}" uploaded`);
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const reprocess = async (id: number) => {
    if (!user) return;

    setReprocessingIds((s) => new Set(s).add(id));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/${id}/reprocess/`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Reprocessing started");
        fetchFiles();
      } else {
        throw new Error("Reprocess failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Reprocess failed");
    } finally {
      setReprocessingIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  };

  const deleteFile = async (id: number) => {
    if (!confirm("Delete this file permanently?")) return;
    if (!user) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/${id}/`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setFiles((f) => f.filter((file) => file.id !== id));
        toast.success("File deleted");
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [user, authLoading]);

  const filteredFiles = files.filter((file) =>
    (file.title || file.original_filename).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your vault...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <p className="text-xl text-gray-600">Please log in to access your vault</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Vault</h1>
              <p className="text-gray-600">Manage and organize your uploaded documents</p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Upload File</span>
                </>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.csv,.png,.jpg,.jpeg"
              onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Files Grid */}
        {filteredFiles.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-20 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-12 h-12 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchQuery ? "No files found" : "Your vault is empty"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Upload your first document to get started"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Upload File
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFiles.map((file) => {
              const processing = reprocessingIds.has(file.id);
              const isMenuActive = activeMenu === file.id;

              return (
                <div
                  key={file.id}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* File Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-sm">
                        {getFileIcon(file.file_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate mb-1">
                          {file.title || file.original_filename}
                        </h3>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">
                          {file.file_type}
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setActiveMenu(isMenuActive ? null : file.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>

                      {isMenuActive && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                          {!file.processed && (
                            <button
                              onClick={() => {
                                reprocess(file.id);
                                setActiveMenu(null);
                              }}
                              disabled={processing}
                              className="w-full px-4 py-2 text-left hover:bg-emerald-50 transition-colors flex items-center gap-3 text-sm text-gray-700 disabled:opacity-50"
                            >
                              <RefreshCw className={`w-4 h-4 text-emerald-600 ${processing ? "animate-spin" : ""}`} />
                              Reprocess
                            </button>
                          )}
                          <button
                            onClick={() => {
                              deleteFile(file.id);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-sm text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* File Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Size</span>
                      <span className="font-medium text-gray-900">{formatBytes(file.size)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Uploaded</span>
                      <span className="font-medium text-gray-900">{formatDate(file.uploaded_at)}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-center pt-4 border-t border-gray-100">
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                        file.processed
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        file.processed ? "bg-emerald-500" : "bg-amber-500"
                      }`} />
                      {file.processed ? "Ready" : "Processing"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* File Count */}
        {!loading && files.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredFiles.length}</span> of{" "}
              <span className="font-semibold text-gray-900">{files.length}</span> files
            </p>
          </div>
        )}
      </div>
    </div>
  );
}