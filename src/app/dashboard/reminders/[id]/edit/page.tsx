// app/dashboard/reminders/[id]/edit/page.tsx
// Also works for /new (just pass no ID)
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Bell, Calendar, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Reminder {
  id?: number;
  text: string;
  remind_at: string | null;
}

export default function ReminderEditPage() {
  const router = useRouter();
  const { id } = useParams();
  const { accessToken } = useAuth();

  const [reminder, setReminder] = useState<Reminder>({ text: "", remind_at: null });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isNew = id === "new";

  // Load reminder if editing
  useEffect(() => {
    if (!accessToken || isNew) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.ok ? r.json() : router.replace("/dashboard/reminders"))
      .then(data => {
        setReminder({
          id: data.id,
          text: data.text,
          remind_at: data.remind_at,
        });
      });
  }, [id, accessToken, isNew, router]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const save = async () => {
    if (!reminder.text.trim()) return;
    setSaving(true);

    const url = isNew
      ? `${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/`
      : `${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/${id}/`;

    const method = isNew ? "POST" : "PATCH";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        text: reminder.text.trim(),
        remind_at: reminder.remind_at || null,
      }),
    });

    router.push("/dashboard/reminders");
  };

  const deleteReminder = async () => {
    if (!confirm("Delete this reminder forever?")) return;
    setDeleting(true);

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    router.push("/dashboard/reminders");
  };

  const formatDateTime = () => {
    if (!reminder.remind_at) return null;
    const date = parseISO(reminder.remind_at);
    return format(date, "EEEE, MMMM d 'at' h:mm a");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard/reminders")}
            className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-xl px-4 py-3 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            All Reminders
          </button>

          <div className="flex items-center gap-3">
            {!isNew && (
              <button
                onClick={deleteReminder}
                disabled={deleting}
                className="px-5 py-3 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 disabled:opacity-50 transition flex items-center gap-2"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            )}
            <button
              onClick={save}
              disabled={!reminder.text.trim() || saving}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition flex items-center gap-2"
            >
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {isNew ? "Create Reminder" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Title */}
          <div className="p-10 border-b border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isNew ? "New Reminder" : "Edit Reminder"}
              </h1>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={reminder.text}
              onChange={(e) => setReminder({ ...reminder, text: e.target.value })}
              placeholder="What do you need to remember?"
              className="w-full text-3xl font-medium text-gray-900 bg-transparent outline-none placeholder-gray-400"
            />
          </div>

          {/* Date & Time */}
          <div className="p-10 bg-gray-50/50">
            <div className="flex items-center gap-4 mb-6">
              <Calendar className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-900">When to remind you</h2>
            </div>

            <div className="max-w-md">
              <input
                type="datetime-local"
                value={reminder.remind_at || ""}
                onChange={(e) => setReminder({ ...reminder, remind_at: e.target.value || null })}
                className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-lg focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 transition"
              />

              {reminder.remind_at && (
                <div className="mt-5 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="flex items-center gap-3 text-emerald-700">
                    <Bell className="w-5 h-5" />
                    <span className="font-medium">You'll be reminded:</span>
                  </div>
                  <p className="mt-2 text-emerald-900 font-semibold text-lg">
                    {formatDateTime()}
                  </p>
                  <button
                    onClick={() => setReminder({ ...reminder, remind_at: null })}
                    className="mt-3 text-sm text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Remove date
                  </button>
                </div>
              )}

              {!reminder.remind_at && (
                <p className="mt-5 text-gray-500 text-sm">
                  No date set — this reminder will be saved but won't trigger a notification.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-full text-sm">
            <div className={`w-3 h-3 rounded-full ${reminder.text.trim() ? "bg-emerald-500" : "bg-gray-300"}`} />
            <span className="text-gray-700 font-medium">
              {reminder.text.trim() ? "Ready to save" : "Enter a reminder"}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}