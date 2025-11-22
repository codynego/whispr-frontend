// app/dashboard/notes/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { FileText, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Note {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function NotesPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/?ordering=-updated_at&limit=50`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(data => setNotes(Array.isArray(data) ? data : data.results || []))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-emerald-600 animate-pulse mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
              <p className="text-gray-600">{notes.length} note{notes.length !== 1 && "s"}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {notes.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-32 h-32 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <FileText className="w-16 h-16 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">No notes yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Just say anything to Whisone on WhatsApp — it all appears here automatically.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => router.push(`/dashboard/notes/${note.id}`)}
                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer hover:-translate-y-1"
              >
                <p className="text-gray-800 leading-relaxed line-clamp-5 group-hover:line-clamp-none">
                  {note.content || <span className="text-gray-400 italic">Empty note</span>}
                </p>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                  <span>{format(new Date(note.updated_at), "MMM d, yyyy")}</span>
                  <span className="text-emerald-600 group-hover:translate-x-1 transition">View →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => router.push("/dashboard/notes/new")}
        className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 hover:bg-emerald-700 transition-all z-50"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}