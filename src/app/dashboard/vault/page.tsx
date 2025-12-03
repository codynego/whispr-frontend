// src/app/dashboard/vault/page.tsx

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
  CheckCircle,
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

export default function VaultPage() {
  const { accessToken } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const uploadFile = async (file: File) => {
    if (!accessToken) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const uploaded = await res.json();

      setFiles((prev) => [uploaded, ...prev]);
      toast.success(`${file.name} uploaded!`);
    } catch (err) {
      toast.error(`Failed to upload ${file.name}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  };

  const reprocess = async (id: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/${id}/reprocess/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast.success("Reprocessing started");
      fetchFiles();
    } catch {
      toast.error("Reprocess failed");
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

  // Icons & Helpers
  const getIcon = (type: string) => {
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

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Upload className="w-9 h-9 text-emerald-500" />
              Your Vault
            </h1>
            <p className="text-gray-600 mt-1">Upload and manage your files</p>
          </div>
          <span className="text-sm text-gray-500">
            {files.length} file{files.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-3xl transition-all ${
            dragActive
              ? "border-emerald-500 bg-emerald-50/50"
              : "border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/20"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.csv,.png,.jpg,.jpeg,.webp"
            onChange={(e) => handleFiles(e.target.files)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />

          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-5 bg-emerald-100 rounded-full flex items-center justify-center">
              <Upload className="w-10 h-10 text-emerald-600" />
            </div>
            <p className="text-xl font-semibold text-gray-900">
              Drop files here or <span className="text-emerald-600 underline cursor-pointer">click to upload</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports PDF, DOCX, TXT, CSV, Images
            </p>
          </div>

          {uploading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-3xl">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">Uploading...</p>
              </div>
            </div>
          )}
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
              {files.map((file) => (
                <div
                  key={file.id}
                  className="p-6 hover:bg-emerald-50/30 transition-all group flex items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-2.5 bg-emerald-100 rounded-xl flex-shrink-0">
                      {getIcon(file.file_type)}
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

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {file.processed ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Ready
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Processing
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      {!file.processed && (
                        <button
                          onClick={() => reprocess(file.id)}
                          className="p-2.5 hover:bg-emerald-100 rounded-lg transition"
                          title="Reprocess"
                        >
                          <RefreshCw className="w-4.5 h-4.5 text-emerald-600" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="p-2.5 hover:bg-red-100 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4.5 h-4.5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}