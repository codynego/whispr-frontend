"use client"; // Retained because core logic (useState, useEffect, useAuth, file upload/delete) depends on client-side features.

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
  Download,
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

// NOTE: ChatMessage interface removed.

// --- Utility Functions ---

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

// --- VaultDetailView Component (Replaces VaultChatView for viewing only) ---

function VaultDetailView({
  fileId,
  accessToken,
  onClose,
}: {
  fileId: number | null;
  accessToken: string | null;
  onClose: () => void;
}) {
  const [file, setFile] = useState<UploadedFile | null>(null);

  // Fetch file details when fileId changes
  useEffect(() => {
    if (!fileId || !accessToken) {
      setFile(null);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/${fileId}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : (onClose(), null)))
      .then((data) => {
        if (data) {
          setFile(data);
        }
      })
      .catch(() => onClose());
  }, [fileId, accessToken, onClose]);

  if (!fileId) return null;

  if (!file) {
    return (
      <div className="flex-1 min-h-full flex flex-col items-center justify-center bg-gray-50/50 rounded-3xl p-10">
        <Clock className="w-16 h-16 mx-auto mb-4 animate-spin text-emerald-600" />
        <p className="text-gray-600">Loading file details...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col h-[85vh] lg:h-full col-span-full flex-1">
      {/* File Header */}
      <div className="p-6 md:p-8 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button
            onClick={onClose}
            className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-xl transition lg:hidden flex-shrink-0"
            title="Back to file list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            {getIcon(file.file_type, "w-6 h-6 text-white")}
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
            className="ml-4 px-4 py-2 text-sm bg-emerald-600 text-white rounded-2xl font-medium hover:bg-emerald-700 transition flex items-center gap-2 flex-shrink-0"
            rel="noopener noreferrer"
          >
            <Download className="w-4 h-4" />
            Download File
          </a>
        )}
      </div>

      {/* File Details / Status View */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 text-gray-700">
        <div className="p-8 bg-gray-50 rounded-3xl text-center max-w-lg shadow-inner border border-gray-100">
          <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            {file.processed ? (
                <CheckCircle className="w-10 h-10 text-emerald-600" />
            ) : (
                <Clock className="w-10 h-10 text-yellow-600 animate-spin" />
            )}
          </div>
          <h3 className="text-2xl font-bold mb-3">
            File {file.processed ? "Processed" : "Processing"}
          </h3>
          <p className="text-base text-gray-600 mb-4">
            **File Type:** {file.file_type.toUpperCase()}
            <br />
            **Size:** {formatBytes(file.size)}
          </p>
          <p className="text-sm text-gray-500">
            {file.processed
              ? "This document is ready for use. You can download the file using the button above."
              : "The file is currently being processed by our system. This may take a moment depending on the size and complexity of the document."}
          </p>
        </div>
      </div>
    </div>
  );
}

// --- VaultList Component (Permanent Sidebar for Desktop) ---

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
          className={`group bg-white rounded-2xl p-4 shadow-sm border flex items-center justify-between min-w-[200px] ${
            selectedFileId === file.id
              ? "border-emerald-400 ring-4 ring-emerald-100"
              : "border-gray-100 hover:shadow-lg hover:border-emerald-300"
          } transition cursor-pointer`}
        >
          <div className="flex items-center min-w-0 flex-1">
            <div className="p-2 bg-gray-50 rounded-xl mr-3 group-hover:bg-emerald-50 transition flex-shrink-0">
              {getIcon(file.file_type)}
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {file.original_filename}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center">
                {formatBytes(file.size)} • {format(new Date(file.uploaded_at), "MMM d")}
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
      ))}
    </div>
  );

  return (
    // On Desktop (lg): Fixed width, overflow-y-auto to allow scrolling list.
    // On Mobile (hidden): Only show if no file is selected.
    <div 
      className={`
          bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 
          h-full overflow-y-auto flex-shrink-0 
          lg:w-80 lg:block
          ${selectedFileId ? 'hidden' : 'block col-span-full'}
      `}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6 sticky top-0 bg-white pb-3 border-b border-gray-100 z-[5]">
        Your Files ({files.length})
      </h2>
      {fileListContent}
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

    const temp: UploadedFile = {
      id: Date.now(),
      original_filename: file.name,
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
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg border-b border-gray-100 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <File className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vault</h1>
              <p className="text-gray-600">Document Management</p>
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
      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1 min-h-0">
        <div className="flex flex-row gap-8 h-full">
          
          {/* File List / Sidebar */}
          <VaultList
            files={files}
            loading={loading}
            selectedFileId={selectedFileId}
            setSelectedFileId={setSelectedFileId}
            deleteFile={deleteFile}
          />

          {/* File Detail View / Main Panel */}
          {selectedFileId ? (
            <VaultDetailView // Changed from VaultChatView
              fileId={selectedFileId}
              accessToken={accessToken}
              onClose={() => setSelectedFileId(null)}
            />
          ) : (
            // Default view when no file is selected
            <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-white/50 border border-gray-100 rounded-3xl p-10 text-gray-500">
                <FileText className="w-24 h-24 mb-6 text-emerald-300" />
                <p className="text-2xl font-medium">Select a file to view details</p>
                <p className="mt-2 text-lg">Click on any file in the list to see its status and download link.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}