// app/dashboard/notes/new/page.tsx  (and same for /edit)
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function NoteEditor() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const save = async () => {
    if (!content.trim()) return;
    setSaving(true);

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ content: content.trim() }),
    });

    router.push("/dashboard/notes");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard/notes")}
            className="text-gray-700 hover:bg-gray-100 rounded-xl px-4 py-2 transition"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!content.trim() || saving}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : "Save Note"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your note..."
          className="w-full min-h-screen bg-transparent text-xl text-gray-800 placeholder-gray-400 outline-none resize-none"
        />
      </main>
    </div>
  );
}