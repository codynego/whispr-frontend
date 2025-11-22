// app/dashboard/notes/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Edit3, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Note {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function NoteDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { accessToken } = useAuth();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id || !accessToken) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setNote)
      .catch(() => router.replace("/dashboard/notes"))
      .finally(() => setLoading(false));
  }, [id, accessToken, router]);

  const deleteNote = async () => {
    if (!confirm("Delete this note forever?")) return;
    setDeleting(true);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    router.push("/dashboard/notes");
  };

  if (loading || !note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading note...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard/notes")}
            className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-xl px-4 py-2 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            All Notes
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/dashboard/notes/${id}/edit`)}
              className="p-3 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition"
            >
              <Edit3 className="w-5 h-5" />
            </button>
            <button
              onClick={deleteNote}
              disabled={deleting}
              className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <article className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100">
          <div className="prose prose-lg max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
              {note.content || <span className="text-gray-400 italic">Empty note</span>}
            </pre>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
            Created {format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a")}
            {note.created_at !== note.updated_at && (
              <> • Updated {format(new Date(note.updated_at), "MMM d, yyyy 'at' h:mm a")}</>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}