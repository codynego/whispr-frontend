// app/dashboard/reminders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { format, isPast } from "date-fns";
import { ArrowLeft, Clock, CheckCircle2, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Reminder {
  id: number;
  text: string;
  remind_at: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export default function ReminderDetail() {
  const router = useRouter();
  const { id } = useParams();
  const { accessToken } = useAuth();
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !accessToken) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.ok ? r.json() : router.replace("/dashboard/reminders"))
      .then(setReminder)
      .finally(() => setLoading(false));
  }, [id, accessToken, router]);

  const toggleComplete = async () => {
    if (!reminder) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ completed: !reminder.completed }),
    });
    setReminder({ ...reminder, completed: !reminder.completed });
  };

  const deleteReminder = async () => {
    if (!confirm("Delete this reminder?")) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    router.push("/dashboard/reminders");
  };

  if (loading || !reminder) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard/reminders")}
            className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-xl px-4 py-2 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            All Reminders
          </button>
          <button
            onClick={deleteReminder}
            className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100">
          <div className="flex items-start justify-between mb-8">
            <h1 className={`text-3xl font-bold ${reminder.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
              {reminder.text}
            </h1>
            <button
              onClick={toggleComplete}
              className={`px-6 py-3 rounded-2xl font-medium transition ${
                reminder.completed
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {reminder.completed ? "Undo" : "Mark Done"}
            </button>
          </div>

          <div className="space-y-4 text-gray-600">
            <div className="flex items-center gap-4">
              <Clock className="w-5 h-5" />
              <span className={isPast(new Date(reminder.remind_at!)) ? "text-red-600 font-medium" : ""}>
                {reminder.remind_at
                  ? format(new Date(reminder.remind_at), "PPP 'at' p")
                  : "No due date"}
              </span>
            </div>
            {reminder.completed && (
              <div className="flex items-center gap-4 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
                <span>Completed</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}