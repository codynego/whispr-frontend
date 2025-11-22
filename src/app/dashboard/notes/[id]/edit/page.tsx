// app/dashboard/notes/[id]/edit/page.tsx
// Also works for /new (just pass id="new")
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ArrowLeft, FileText, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Note {
  id?: number;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export default function NoteEditor() {
  const router = useRouter();
  const { id } = useParams();
  const { accessToken } = useAuth();

  const isNew = id === "new";
  const [note, setNote] = useState<Note>({ content: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load note if editing
  useEffect(() => {
    if (!accessToken || isNew) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.ok ? r.json() : router.replace("/dashboard/notes"))
      .then(data => setNote({ ...data, content: data.content || "" }));
  }, [id, accessToken, isNew, router]);

  useEffect(() => {
    textareaRef.current?.focus();
    // Move cursor to end
    const el = textareaRef.current;
    if (el) {
      el.selectionStart = el.selectionEnd = el.value.length;
    }
  }, []);

  const save = async () => {
    if (!note.content.trim()) return;
    setSaving(true);

    const url = isNew
      ? `${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/`
      : `${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/${id}/`;

    const method = isNew ? "POST" : "PATCH";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ content: note.content.trim() }),
    });

    router.push("/dashboard/notes");
  };

  const deleteNote = async () => {
    if (!confirm("Delete this note forever?")) return;
    setDeleting(true);

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    router.push("/dashboard/notes");
  };

  const wordCount = note.content.trim() ? note.content.trim().split(/\s+/).length : 0;
  const charCount = note.content.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard/notes")}
            className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-xl px-4 py-3 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            All Notes
          </button>

          <div className="flex items-center gap-3">
            {!isNew && (
              <button
                onClick={deleteNote}
                disabled={deleting}
                className="px-5 py-3 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 disabled:opacity-50 transition flex items-center gap-2"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            )}
            <button
              onClick={save}
              disabled={!note.content.trim() || saving}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition flex items-center gap-2"
            >
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {isNew ? "Create Note" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Title */}
          <div className="p-10 border-b border-gray-100">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-lg">
                <FileText className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isNew ? "New Note" : "Edit Note"}
                </h1>
                {!isNew && note.created_at && (
                  <p className="text-sm text-gray-500 mt-1">
                    Created {format(parseISO(note.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                )}
              </div>
            </div>

            <textarea
              ref={textareaRef}
              value={note.content}
              onChange={(e) => setNote({ ...note, content: e.target.value })}
              placeholder="Start typing your note..."
              className="w-full min-h-[70vh] bg-transparent text-xl text-gray-800 placeholder-gray-400 outline-none resize-none leading-relaxed font-light"
            />
          </div>

          {/* Stats Footer */}
          <div className="p-8 bg-gray-50/50 border-t border-gray-100">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <div className="flex items-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{wordCount}</span>
                  <span className="text-gray-500">{wordCount === 1 ? "word" : "words"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{charCount}</span>
                  <span className="text-gray-500">{charCount === 1 ? "character" : "characters"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${note.content.trim() ? "bg-emerald-500" : "bg-gray-300"}`} />
                <span className="text-sm font-medium text-gray-700">
                  {note.content.trim() ? "Ready to save" : "Start typing"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}