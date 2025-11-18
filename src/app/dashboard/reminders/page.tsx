"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Bell, Clock, Check, Plus, Calendar } from "lucide-react";

interface Reminder {
  id: number;
  text: string;
  remind_at: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export default function RemindersPage() {
  const { accessToken } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newText, setNewText] = useState("");
  const [newDateTime, setNewDateTime] = useState("");
  const [creating, setCreating] = useState(false);
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!accessToken) {
      setError("Please log in to view reminders.");
      setLoading(false);
      return;
    }
    fetchReminders(1);
  }, [accessToken, filterStatus]);

  // Auto-focus text input when modal opens
  useEffect(() => {
    if (isCreateOpen && textInputRef.current) {
      setTimeout(() => textInputRef.current?.focus(), 100);
    }
  }, [isCreateOpen]);

  const fetchReminders = async (page: number) => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);

      let url = `${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/?page=${page}&page_size=${pageSize}`;
      if (filterStatus === "pending") url += "&completed=false";
      if (filterStatus === "completed") url += "&completed=true";

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch reminders");

      const data = await response.json();
      const apiReminders: Reminder[] = data.results || data;

      const sorted = apiReminders.sort((a, b) => {
        if (!a.remind_at && !b.remind_at) return 0;
        if (!a.remind_at) return 1;
        if (!b.remind_at) return -1;
        return new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime();
      });

      setReminders(sorted);
      setTotalCount(data.count ?? apiReminders.length);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const createReminder = async () => {
    if (!newText.trim() || !accessToken) return;

    setCreating(true);
    try {
      const payload: any = { text: newText.trim() };
      if (newDateTime) payload.remind_at = newDateTime;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to create reminder");

      const created: Reminder = await response.json();

      // Insert at correct position (by remind_at)
      setReminders((prev) => {
        const updated = [...prev, created];
        return updated.sort((a, b) => {
          if (!a.remind_at) return 1;
          if (!b.remind_at) return -1;
          return new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime();
        });
      });
      setTotalCount((c) => c + 1);

      // Reset & close
      setNewText("");
      setNewDateTime("");
      setIsCreateOpen(false);
    } catch (err) {
      alert("Failed to create reminder. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const toggleReminder = async (id: number) => {
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder || !accessToken) return;

    setToggling((prev) => ({ ...prev, [id]: true }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ completed: !reminder.completed }),
      });

      if (!response.ok) throw new Error("Update failed");

      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
      );
    } catch (err) {
      setError("Failed to update reminder");
    } finally {
      setToggling((prev) => ({ ...prev, [id]: false }));
    }
  };

  const formatDueDate = (remindAt: string | null): string => {
    if (!remindAt) return "No due date";
    const due = new Date(remindAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = due >= today && due < tomorrow;
    const isTomorrow = due >= tomorrow && due < new Date(tomorrow.getTime() + 86400000);

    if (isToday) return `Today at ${due.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    if (isTomorrow) return `Tomorrow at ${due.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    return due.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) return <div className="p-6 text-center text-gray-600">Loading reminders...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error} <button onClick={() => fetchReminders(1)} className="underline">Retry</button></div>;

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen relative">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-gray-800 flex items-center gap-3">
            <Bell className="w-9 h-9 text-indigo-600" />
            Reminders
          </h1>
          <p className="text-gray-500 mb-8">
            Never miss a thing. Set time-based reminders with voice or text.
          </p>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="text-sm text-gray-600">
              <strong className="text-indigo-600">{reminders.filter(r => !r.completed).length}</strong> pending •{" "}
              <strong className="text-green-600">{reminders.filter(r => r.completed).length}</strong> completed
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Reminders</option>
              <option value="pending">Pending Only</option>
              <option value="completed">Completed Only</option>
            </select>
          </div>

          {reminders.length === 0 ? (
            <div className="text-center py-20">
              <Bell className="w-20 h-20 mx-auto mb-6 text-gray-300" />
              <p className="text-xl text-gray-500">No reminders yet</p>
              <p className="text-gray-400 mt-2">Say “Hey Whisone, remind me to call Mom tomorrow at 6pm”</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`bg-white rounded-xl p-6 shadow-sm border transition-all hover:shadow-md ${reminder.completed ? "opacity-70" : ""}`}
                  >
                    <div className="flex justify-between items-start gap-6">
                      <div className="flex-1">
                        <p className={`text-lg font-medium ${reminder.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                          {reminder.text || "Untitled reminder"}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDueDate(reminder.remind_at)}</span>
                          </div>
                          {reminder.completed && <span className="text-green-600 font-medium">Completed</span>}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleReminder(reminder.id)}
                        disabled={toggling[reminder.id]}
                        className={`px-5 py-2.5 rounded-full font-medium transition flex items-center gap-2 ${
                          reminder.completed
                            ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        } disabled:opacity-50`}
                      >
                        {toggling[reminder.id] ? "Saving..." : reminder.completed ? <>Done <Check className="w-4 h-4" /></> : "Mark Done"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 gap-6">
                  <button onClick={() => fetchReminders(currentPage - 1)} disabled={currentPage === 1} className="px-6 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition">
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                  <button onClick={() => fetchReminders(currentPage + 1)} disabled={currentPage === totalPages} className="px-6 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition">
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 z-10"
          aria-label="Create reminder"
        >
          <Plus className="w-9 h-9" />
        </button>
      </div>

      {/* Create Reminder Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Bell className="w-7 h-7 text-indigo-600" />
              New Reminder
            </h2>

            <input
              ref={textInputRef}
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !creating && newText.trim() && createReminder()}
              placeholder="What do you need to remember?"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg mb-4"
              disabled={creating}
            />

            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-5 h-5 text-gray-500" />
              <input
                type="datetime-local"
                value={newDateTime}
                onChange={(e) => setNewDateTime(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setNewText("");
                  setNewDateTime("");
                }}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={createReminder}
                disabled={!newText.trim() || creating}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition font-medium"
              >
                {creating ? "Creating..." : "Set Reminder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}