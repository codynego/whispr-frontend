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
  const [saving, setSaving] = useState(false);

  useEffect(() => inputRef.current?.focus(), []);

  const save = async () => {
    if (!text.trim()) return;
    setSaving(true);

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

  const formatPreview = () => {
    if (!datetime) return null;
    const date = new Date(datetime);
    return date.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/reminders")}
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
            <span className="text-sm text-gray-500 font-medium">New Reminder</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/reminders")}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl px-4 py-2 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!text.trim() || saving}
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
                  Save Reminder
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Reminder Text Input */}
          <div className="p-8 border-b border-gray-100">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Reminder
            </label>
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What do you need to remember?"
              className="w-full text-2xl font-medium text-gray-900 bg-transparent outline-none placeholder-gray-400"
            />
          </div>

          {/* Date & Time Section */}
          <div className="p-8 bg-gray-50/50">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Remind me at
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  type="datetime-local"
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
                />
              </div>
              {datetime && (
                <button
                  onClick={() => setDatetime("")}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition"
                  aria-label="Clear date"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Date Preview */}
            {datetime && (
              <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span>{formatPreview()}</span>
              </div>
            )}

            {!datetime && (
              <p className="mt-4 text-sm text-gray-400">
                No time set — this reminder won&apos;t trigger a notification
              </p>
            )}
          </div>
        </div>

        {/* Status Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <div
            className={`w-2 h-2 rounded-full transition ${
              text.trim() ? "bg-emerald-500" : "bg-gray-300"
            }`}
          />
          <span>{text.trim() ? "Ready to save" : "Enter reminder text"}</span>
        </div>
      </main>
    </div>
  );
}