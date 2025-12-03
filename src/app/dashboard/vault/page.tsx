"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { FileText, Image, FileSpreadsheet, File, Loader2, RefreshCw, Trash2 } from "lucide-react";
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

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const FileList = () => {
  const { accessToken } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  const fetchFiles = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : data.results || []);
    } catch {
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const reprocessFile = async (id: number) => {
    setProcessingIds(prev => new Set(prev).add(id));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/${id}/reprocess/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        toast.success("Reprocessing started");
        fetchFiles();
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to reprocess");
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const deleteFile = async (id: number) => {
    if (!confirm("Delete this file permanently?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setFiles(prev => prev.filter(f => f.id !== id));
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [accessToken]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Your Files</h2>
        <span className="text-sm text-gray-500">{files.length} file{files.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
          </div>
        ) : files.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <File className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No files uploaded yet</p>
            <p className="text-sm mt-2">Your uploaded documents will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {files.map((file) => {
              const isProcessing = processingIds.has(file.id);
              return (
                <div
                  key={file.id}
                  className="p-5 hover:bg-emerald-50/50 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="p-2.5 bg-emerald-100 rounded-xl">
                        {getFileIcon(file.file_type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {file.title || file.original_filename}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span>{formatBytes(file.size)}</span>
                          <span>•</span>
                          <span>{formatDate(file.uploaded_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {/* Status */}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium">
                        {file.processed ? (
                          <span className="text-emerald-700 bg-emerald-100">
                            Ready
                          </span>
                        ) : (
                          <span className="text-amber-700 bg-amber-100 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Processing
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!file.processed && (
                          <button
                            onClick={() => reprocessFile(file.id)}
                            disabled={isProcessing}
                            className="p-2 hover:bg-emerald-100 rounded-lg transition disabled:opacity-50"
                            title="Reprocess"
                          >
                            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isProcessing ? "animate-spin" : ""}`} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};