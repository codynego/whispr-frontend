// app/dashboard/vault/page.tsx
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
  file: string; // URL to the file
}

export default function VaultPage() {
  const { accessToken } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (accessToken) fetchFiles();
  }, [accessToken]);

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
      setFiles(prev => prev.map(f => (f.id === tempFile.id ? { ...f, processed: false } : f)));
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
    setSelectedFile(null);
    toast.success("File deleted");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText className="w-5 h-5 text-red-600" />;
      case "docx": return <FileText className="w-5 h-5 text-blue-600" />;
      case "txt": return <FileText className="w-5 h-5 text-gray-600" />;
      case "csv": return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      case "image": return <Image className="w-5 h-5 text-purple-600" />;
      default: return <File className="w-5 h-5 text-gray-600" />;
    }
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
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <File className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vault</h1>
              <p className="text-gray-600">Your files, extracted and ready</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-8">
        {/* Upload + List */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upload Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`relative border-3 border-dashed rounded-3xl p-12 text-center transition-all ${
              dragActive ? "border-emerald-500 bg-emerald-50/50" : "border-gray-300 hover:border-emerald-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.csv,.png,.jpg,.jpeg"
              onChange={(e) => e.target.files && Array.from(e.target.files).forEach(uploadFile)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className={`w-16 h-16 mx-auto mb-4 ${dragActive ? "text-emerald-600" : "text-gray-400"}`} />
            <p className="text-xl font-medium text-gray-700">
              {dragActive ? "Drop files here" : "Drag & drop files"}
            </p>
            <p className="text-sm text-gray-500 mt-2">or click to browse</p>
          </div>

          {/* File List */}
          <div className="space-y-3">
            {files.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <File className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No files yet</p>
              </div>
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {getIcon(file.file_type)}
                    <div>
                      <p className="font-medium text-gray-900">{file.original_filename}</p>
                      <p className="text-sm text-gray-500">
                        {formatBytes(file.size)} • {format(new Date(file.uploaded_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!file.processed && <Clock className="w-5 h-5 text-yellow-600 animate-spin" />}
                    {file.processed && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                    <span className="text-sm text-gray-500">
                      {file.processed ? "Ready" : "Processing"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          {selectedFile ? (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 h-full flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-3 truncate">
                  {getIcon(selectedFile.file_type)}
                  {selectedFile.original_filename}
                </h3>
                <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                {!selectedFile.processed ? (
                  <div className="text-center py-12 text-gray-500">
                    <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-emerald-600" />
                    <p>Extracting text...</p>
                  </div>
                ) : selectedFile.content ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Extracted Text</h4>
                      <div className="bg-gray-50 rounded-2xl p-5 text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {selectedFile.content}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <button className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-2xl transition flex flex-col items-center gap-2 text-emerald-700">
                        <MessageSquarePlus className="w-6 h-6" />
                        <span className="text-xs font-medium">Note</span>
                      </button>
                      <button className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-2xl transition flex flex-col items-center gap-2 text-emerald-700">
                        <CheckSquare className="w-6 h-6" />
                        <span className="text-xs font-medium">Todo</span>
                      </button>
                      <button className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-2xl transition flex flex-col items-center gap-2 text-emerald-700">
                        <Bell className="w-6 h-6" />
                        <span className="text-xs font-medium">Reminder</span>
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <a
                        href={selectedFile.file}
                        target="_blank"
                        className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Open File
                      </a>
                      <button
                        onClick={() => reprocess(selectedFile.id)}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition"
                      >
                        Reprocess
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-12">No text extracted yet</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center h-full flex items-center justify-center">
              <div>
                <File className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Select a file to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}