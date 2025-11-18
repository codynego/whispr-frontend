"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Bell, Clock, Check, Plus, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

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

  // Filters & Pagination
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 15;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newText, setNewText] = useState("");
  const [newDateTime, setNewDateTime] = useState("");
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (accessToken) fetchReminders(1);
    else {
      setError("Please log in to view reminders.");
      setLoading(false);
    }
  }, [accessToken, filterStatus]);

  useEffect(() => {
    if (isCreateOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
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

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }
      if (!res.ok) throw new Error();

      const data = await res.json();
      const list = data.results || data;

      // Sort: pending first (by remind_at ascending), then completed (by updated_at descending)
      const sorted = list.sort((a: Reminder, b: Reminder) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const dateA = a.completed ? a.updated_at : (a.remind_at || "9999");
        const dateB = b.completed ? b.updated_at : (b.remind_at || "9999");
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });

      setReminders(sorted);
      setTotalCount(data.count ?? list.length);
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  const createReminder = async () => {
    if (!newText.trim()) return;
    setCreating(true);

    try {
      const payload: any = { text: newText.trim() };
      if (newDateTime) payload.remind_at = newDateTime;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      const created: Reminder = await res.json();
      setReminders(prev => [created, ...prev]);
      setTotalCount(c => c + 1);

      setNewText("");
      setNewDateTime("");
      setIsCreateOpen(false);
    } catch {
      alert("Failed to create reminder");
    } finally {
      setCreating(false);
    }
  };

  const toggleReminder = async (id: number) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    setToggling(prev => ({ ...prev, [id]: true }));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ completed: !reminder.completed }),
      });

      if (!res.ok) throw new Error();

      setReminders(prev =>
        prev
          .map(r => r.id === id ? { ...r, completed: !r.completed } : r)
          .sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            const dateA = a.completed ? a.updated_at : (a.remind_at || "9999");
            const dateB = b.completed ? b.updated_at : (b.remind_at || "9999");
            return new Date(dateA).getTime() - new Date(dateB).getTime();
          })
      );
    } catch {
      alert("Failed to update reminder");
    } finally {
      setToggling(prev => ({ ...prev, [id]: false }));
    }
  };

  const formatDue = (dateStr: string | null) => {
    if (!dateStr) return "No due date";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 0) return `Overdue by ${Math.abs(diffMins)}m`;
    if (diffMins < 60) return `In ${diffMins}m`;
    if (diffMins < 1440) return `Today at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  const pendingCount = reminders.filter(r => !r.completed).length;
  const completedCount = reminders.filter(r => r.completed).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button onClick={() => fetchReminders(1)} className="text-blue-600 underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-24">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30">
                  <Bell className="w-10 h-10 text-white" />
                </div>
                Reminders
              </h1>
              <p className="text-gray-600 mt-3 text-lg">
                {totalCount} total • {pendingCount} pending • {completedCount} completed
              </p>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-5 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 transition"
            >
              <option value="all">All Reminders</option>
              <option value="pending">Pending Only</option>
              <option value="completed">Completed Only</option>
            </select>
          </div>

          {/* Empty State */}
          {reminders.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-32 h-32 mx-auto mb-8 bg-blue-100 rounded-3xl flex items-center justify-center">
                <Bell className="w-16 h-16 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">No reminders yet</h3>
              <p className="text-gray-500 max-w-md mx-auto text-lg">
                Say{" "}
                <span className="font-semibold text-blue-600">
                  “Hey Whisone, remind me to call Mom tomorrow at 6pm”
                </span>
              </p>
            </div>
          ) : (
            <>
              {/* Reminder List */}
              <div className="space-y-4">
                {reminders.map((reminder, i) => {
                  const isFirstCompleted = !reminder.completed && reminders[i - 1]?.completed;

                  return (
                    <div key={reminder.id}>
                      {isFirstCompleted && (
                        <div className="my-10 flex items-center">
                          <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                          <span className="mx-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                            Completed
                          </span>
                          <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                        </div>
                      )}

                      <div
                        onClick={() => toggleReminder(reminder.id)}
                        className={`
                          group relative bg-white rounded-3xl p-7 shadow-md hover:shadow-xl hover:shadow-blue-600/10
                          border border-gray-200 cursor-pointer transition-all duration-300 hover:-translate-y-1
                          ${reminder.completed ? "opacity-70" : ""}
                        `}
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            <p className={`text-lg font-medium transition-all ${
                              reminder.completed
                                ? "line-through text-gray-500"
                                : "text-gray-900"
                            }`}>
                              {reminder.text}
                            </p>

                            <div className="flex items-center gap-4 mt-4 text-sm">
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                                reminder.completed
                                  ? "bg-gray-100 text-gray-600"
                                  : reminder.remind_at
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}>
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">{formatDue(reminder.remind_at)}</span>
                              </div>

                              {reminder.completed && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full">
                                  <Check className="w-4 h-4" />
                                  <span className="font-medium">Done</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleReminder(reminder.id);
                            }}
                            disabled={toggling[reminder.id]}
                            className={`
                              px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg
                              ${reminder.completed
                                ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30"
                              }
                              disabled:opacity-50
                            `}
                          >
                            {toggling[reminder.id] ? "Saving..." : reminder.completed ? "Undo" : "Mark Done"}
                          </button>
                        </div>

                        {/* Subtle hover glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modern Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-16">
                  <button
                    onClick={() => fetchReminders(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition"
                  >
                    <ChevronLeft className="w-5 h-5" /> Previous
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => fetchReminders(p)}
                        className={`w-10 h-10 rounded-lg font-medium transition ${
                          currentPage === p
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => fetchReminders(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition"
                  >
                    Next <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 ring-8 ring-blue-600/20"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="w-10 h-10 text-blue-600" />
                New Reminder
              </h2>
            </div>

            <div className="p-8 space-y-6">
              <input
                ref={inputRef}
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createReminder()}
                placeholder="What do you need to remember?"
                className="w-full px-5 py-4 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />

              <div className="flex items-center gap-4">
                <Calendar className="w-6 h-6 text-gray-500" />
                <input
                  type="datetime-local"
                  value={newDateTime}
                  onChange={(e) => setNewDateTime(e.target.value)}
                  className="flex-1 px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 transition"
                />
              </div>
            </div>

            <div className="px-8 pb-8 flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setNewText("");
                  setNewDateTime("");
                }}
                className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={createReminder}
                disabled={!newText.trim() || creating}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-600/30"
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