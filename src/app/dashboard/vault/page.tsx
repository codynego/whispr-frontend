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
} from "lucide-react";
import { toast } from "sonner";

interface UploadedFile {
  id: number;
  original_filename: string;
  file_type: "pdf" | "docx" | "txt" | "csv" | "image" | "other";
  size: number;
  uploaded_at: string;
  processed: boolean;
}

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

export default function VaultListPage() {
  const { accessToken } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        const fileList = Array.isArray(data) ? data : data.results || [];
        setFiles(
          fileList.sort(
            (a: UploadedFile, b: UploadedFile) =>
              new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
          )
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load files");
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

    const tempId = Date.now();
    const tempFile: UploadedFile = {
      id: tempId,
      original_filename: file.name,
      file_type:
        file.type.includes("pdf")
          ? "pdf"
          : file.type.includes("image")
          ? "image"
          : file.name.endsWith(".csv")
          ? "csv"
          : file.name.endsWith(".txt")
          ? "txt"
          : file.name.endsWith(".docx")
          ? "docx"
          : "other",
      size: file.size,
      uploaded_at: new Date().toISOString(),
      processed: false,
    };

    // Optimistically add to list
    setFiles((prev) => [tempFile, ...prev]);
    setUploading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (res.ok) {
        const uploaded = await res.json();
        setFiles((prev) => prev.map((f) => (f.id === tempId ? uploaded : f)));
        toast.success("File uploaded successfully!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      setFiles((prev) => prev.filter((f) => f.id !== tempId));
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (id: number) => {
    if (!confirm("Delete this file permanently?")) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setFiles((prev) => prev.filter((f) => f.id !== id));
      toast.success("File deleted");
    } catch (err) {
      toast.error("Failed to delete file");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <File className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vault</h1>
              <p className="text-gray-600">Your uploaded documents</p>
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
            accept=".pdf,.docx,.txt,.csv,.png,.jpg,.jpeg,.webp"
            onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
            className="hidden"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 min-h-full">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">
              My Files ({files.length})
            </h2>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="text-center py-20">
                <Clock className="w-16 h-16 mx-auto mb-4 animate-spin text-emerald-600" />
                <p className="text-gray-600">Loading your files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <File className="w-24 h-24 mx-auto mb-6 text-gray-300" />
                <p className="text-2xl font-semibold">Your vault is empty</p>
                <p className="mt-3 text-lg">Upload your first file to get started</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-emerald-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                        {getIcon(file.file_type)}
                      </div>
                      <div className="flex items-center gap-2">
                        {file.processed ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-600 animate-spin" />
                        )}
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 truncate">
                      {file.original_filename}
                    </h3>
                    <div className="mt-2 text-sm text-gray-500 space-y-1">
                      <p>{formatBytes(file.size)}</p>
                      <p>Uploaded {format(new Date(file.uploaded_at), "MMM d, yyyy")}</p>
                    </div>
                    <div className="mt-4 text-xs">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          file.processed
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {file.processed ? "Ready" : "Processing"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}