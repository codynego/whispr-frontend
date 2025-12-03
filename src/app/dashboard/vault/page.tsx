// src/app/dashboard/vault/page.tsx

import React, { useState, useEffect } from "react";
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
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function VaultPage() {
  const { accessToken } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [reprocessingIds, setReprocessingIds] = useState<Set<number>>(new Set());

  const fetchFiles = async () => {
    if (!accessToken) return;
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

  const reprocess = async (id: number) => {
    setReprocessingIds((s) => new Set(s).add(id));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/${id}/reprocess/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        toast.success("Reprocessing started");
        fetchFiles();
      } else throw new Error();
    } catch {
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
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setFiles((f) => f.filter((file) => file.id !== id));
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [accessToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Upload className="w-8 h-8 text-emerald-500" />
              Your Vault
            </h1>
            <p className="text-gray-600 mt-1">All uploaded files in one place</p>
          </div>
          <div className="text-sm text-gray-500">
            {files.length} file{files.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* File List */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto" />
            </div>
          ) : files.length === 0 ? (
            <div className="p-20 text-center text-gray-500">
              <File className="w-20 h-20 mx-auto mb-5 text-gray-300" />
              <p className="text-xl font-medium">Your vault is empty</p>
              <p className="mt-2">Upload your first file to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {files.map((file) => {
                const processing = reprocessingIds.has(file.id);
                return (
                  <div
                    key={file.id}
                    className="p-5 hover:bg-emerald-50/30 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="p-2.5 bg-emerald-100 rounded-xl">
                          {getFileIcon(file.file_type)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {file.title || file.original_filename}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatBytes(file.size)} • {formatDate(file.uploaded_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            file.processed
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {file.processed ? "Ready" : "Processing"}
                        </span>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          {!file.processed && (
                            <button
                              onClick={() => reprocess(file.id)}
                              disabled={processing}
                              className="p-2 hover:bg-emerald-100 rounded-lg disabled:opacity-50"
                              title="Reprocess"
                            >
                              <RefreshCw
                                className={`w-4 h-4 text-emerald-600 ${processing ? "animate-spin" : ""}`}
                              />
                            </button>
                          )}
                          <button
                            onClick={() => deleteFile(file.id)}
                            className="p-2 hover:bg-red-100 rounded-lg"
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
    </div>
  );
}