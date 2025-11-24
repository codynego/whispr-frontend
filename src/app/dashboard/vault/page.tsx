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
  AlertCircle,
  MessageSquarePlus,
  CheckSquare,
  Bell,
  Download,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface UploadedFile {
  id: number;
  name: string;
  type: "pdf" | "docx" | "txt" | "csv" | "image" | "other";
  size: string;
  uploaded_at: string;
  status: "processing" | "ready" | "error";
  extracted_text?: string;
  url: string;
}

export default function VaultPage() {
  const { accessToken } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!accessToken) return;
    fetchFiles();
  }, [accessToken]);

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vault/files/`, {
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const uploadFiles = async (fileList: FileList) => {
    const files = Array.from(fileList);
    setUploading(true);

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const placeholder: UploadedFile = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: getFileType(file),
        size: formatBytes(file.size),
        uploaded_at: new Date().toISOString(),
        status: "processing",
        url: "",
      };

      setFiles(prev => [placeholder, ...prev]);

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vault/upload/`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setFiles(prev => prev.map(f => f.id === placeholder.id ? data : f));
          toast.success(`${file.name} uploaded`);
        }
      } catch {
        setFiles(prev => prev.map(f => f.id === placeholder.id ? { ...f, status: "error" } : f));
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
  };

  const getFileType = (file: File): UploadedFile["type"] => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf": return "pdf";
      case "docx": case "doc": return "docx";
      case "txt": return "txt";
      case "csv": return "csv";
      case "png": case "jpg": case "jpeg": case "webp": return "image";
      default: return "other";
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getIcon = (type: UploadedFile["type"]) => {
    switch (type) {
      case "pdf": return <FileText className="w-5 h-5 text-red-600" />;
      case "docx": return <FileText className="w-5 h-5 text-blue-600" />;
      case "txt": return <FileText className="w-5 h-5 text-gray-600" />;
      case "csv": return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      case "image": return <Image className="w-5 h-5 text-purple-600" />;
      default: return <File className="w-5 h-5 text-gray-600" />;
    }
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
              <p className="text-gray-600">Your files, extracted and ready</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-8">
        {/* Upload & List */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upload Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
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
              onChange={(e) => e.target.files && uploadFiles(e.target.files)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className={`w-16 h-16 mx-auto mb-4 ${dragActive ? "text-emerald-600" : "text-gray-400"}`} />
            <p className="text-xl font-medium text-gray-700">
              {dragActive ? "Drop your files here" : "Drag & drop files here"}
            </p>
            <p className="text-sm text-gray-500 mt-2">or click to browse</p>
            <p className="text-xs text-gray-400 mt-4">PDF, DOCX, TXT, CSV, Images</p>
          </div>

          {/* File List */}
          <div className="space-y-3">
            {files.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <File className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No files uploaded yet</p>
              </div>
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {getIcon(file.type)}
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {file.size} • {format(new Date(file.uploaded_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {file.status === "processing" && <Clock className="w-5 h-5 text-yellow-600 animate-spin" />}
                    {file.status === "ready" && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                    {file.status === "error" && <AlertCircle className="w-5 h-5 text-red-600" />}
                    <span className="text-sm text-gray-500 capitalize">{file.status}</span>
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
                <h3 className="font-bold text-gray-900 flex items-center gap-3">
                  {getIcon(selectedFile.type)}
                  {selectedFile.name}
                </h3>
                <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                {selectedFile.status === "processing" && (
                  <div className="text-center py-12 text-gray-500">
                    <RefreshCw className="w-12 hlé-12 mx-auto mb-4 animate-spin text-emerald-600" />
                    <p>Extracting text...</p>
                  </div>
                )}

                {selectedFile.status === "ready" && selectedFile.extracted_text && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Extracted Text</h4>
                      <div className="bg-gray-50 rounded-2xl p-5 text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedFile.extracted_text}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <button className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-2xl transition flex flex-col items-center gap-2 text-emerald-700">
                        <MessageSquarePlus className="w-6 h-6" />
                        <span className="text-xs font-medium">New Note</span>
                      </button>
                      <button className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-2xl transition flex flex-col items-center gap-2 text-emerald-700">
                        <CheckSquare className="w-6 h-6" />
                        <span className="text-xs font-medium">New Todo</span>
                      </button>
                      <button className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-2xl transition flex flex-col items-center gap-2 text-emerald-700">
                        <Bell className="w-6 h-6" />
                        <span className="text-xs font-medium">Reminder</span>
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition">
                        Ask Whisone
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center text-gray-500 h-full flex items-center justify-center">
              <div>
                <File className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Select a file to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

