// app/dashboard/reminders/new/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function NewReminder() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [datetime, setDatetime] = useState("");

  useEffect(() => inputRef.current?.focus(), []);

  const save = async () => {
    if (!text.trim()) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        text: text.trim(),
        remind_at: datetime || null,
      }),
    });

    router.push("/dashboard/reminders");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard/reminders")}
            className="text-gray-700 hover:bg-gray-100 rounded-xl px-4 py-2 transition"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!text.trim()}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            Save Reminder
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What do you need to remember?"
          className="w-full text-3xl font-medium text-gray-900 bg-transparent outline-none placeholder-gray-400"
        />
        <input
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          className="w-full px-5 py-4 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
        />
      </main>
    </div>
  );
}