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

  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/notes")}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl p-2 transition"
              aria-label="Go back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <span className="text-sm text-gray-500 font-medium">New Note</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/notes")}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl px-4 py-2 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!content.trim() || saving}
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Note
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Editor Area */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-6">
        <div className="flex-1 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-full">
            <div className="p-8">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start typing your note..."
                className="w-full min-h-[60vh] bg-transparent text-lg text-gray-800 placeholder-gray-400 outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <footer className="py-4 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-6">
              <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
              <span>{charCount} {charCount === 1 ? "character" : "characters"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full transition ${
                  content.trim() ? "bg-emerald-500" : "bg-gray-300"
                }`}
              />
              <span>{content.trim() ? "Ready to save" : "Empty note"}</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}