// app/dashboard/vault/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { Upload, FileText, Image, FileSpreadsheet, File, Trash2, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface UploadedFile {
  id: number;
  original_filename: string;
  file_type: "pdf" | "docx" | "txt" | "csv" | "image" | "other";
  size: number;
  uploaded_at: string;
  processed: boolean;
}

export default function VaultListPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (accessToken) fetchFiles();
  }, [accessToken]);

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/`, {
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
    };

    setFiles(prev => [temp, ...prev]);
    setUploading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      if (res.ok) {
        const uploaded = await res.json();
        setFiles(prev => prev.map(f => (f.id === temp.id ? uploaded : f)));
        toast.success("Uploaded");
      }
    } catch {
      setFiles(prev => prev.filter(f => f.id !== temp.id));
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (id: number) => {
    if (!confirm("Delete this file permanently?")) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setFiles(prev => prev.filter(f => f.id !== id));
    toast.success("Deleted");
  };

  const getIcon = (type: string) => {
    const icons: Record<string, React.JSX.Element> = {
      pdf: <FileText className="w-6 h-6 text-red-600" />,
      docx: <FileText className="w-6 h-6 text-blue-600" />,
      txt: <FileText className="w-6 h-6 text-gray-600" />,
      csv: <FileSpreadsheet className="w-6 h-6 text-green-600" />,
      image: <Image className="w-6 h-6 text-purple-600" />,
    };
    return icons[type] || <File className="w-6 h-6 text-gray-600" />;
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
              <p className="text-gray-600">{files.length} files</p>
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

      <main className="max-w-7xl mx-auto px-6 py-10">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => (
              <div
                key={file.id}
                onClick={() => router.push(`/dashboard/vault/${file.id}`)}
                className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-300 transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-emerald-50 transition">
                    {getIcon(file.file_type)}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-xl transition"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>

                <h3 className="font-medium text-gray-900 mb-2 truncate">
                  {file.original_filename}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatBytes(file.size)} • {format(new Date(file.uploaded_at), "MMM d")}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  {file.processed ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">Ready</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-yellow-600 animate-spin" />
                      <span className="text-sm text-yellow-600">Processing...</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}