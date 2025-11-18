"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Clock, Bell, Check } from "lucide-react";

interface Reminder {
  id: number;
  text: string;
  remind_at: string | null;   // ISO string or null
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

  useEffect(() => {
    if (!accessToken) {
      setError("Please log in to view reminders.");
      setLoading(false);
      return;
    }
    fetchReminders(1);
  }, [accessToken, filterStatus]);

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
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch reminders");
      }

      const data = await response.json();
      const apiReminders: Reminder[] = data.results || data;

      // Sort by remind_at (earliest first), push nulls to the end
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

  const formatDueDate = (remindAt: string | null): string => {
    if (!remindAt) return "No Due Date";

    const due = new Date(remindAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = due >= today && due < tomorrow;
    const isTomorrow =
      due >= tomorrow && due < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);

    if (isToday) return `Today at ${due.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    if (isTomorrow) return `Tomorrow at ${due.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;

    return due.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const toggleReminder = async (id: number) => {
    if (!accessToken) return;

    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;

    setToggling((prev) => ({ ...prev, [id]: true }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reminders/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ completed: !reminder.completed }),
      });

      if (response.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }

      if (!response.ok) throw new Error("Failed to update reminder");

      // Optimistically update UI
      setReminders((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, completed: !r.completed } : r
        )
      );
      // Optionally refetch to sync with backend ordering if needed
      // fetchReminders(currentPage);
    } catch (err) {
      console.error("Error toggling reminder:", err);
      setError("Failed to update reminder");
    } finally {
      setToggling((prev) => ({ ...prev, [id]: false }));
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleFilterChange = (status: "all" | "pending" | "completed") => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading reminders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Error: {error}</div>
        <button onClick={() => fetchReminders(1)} className="ml-4 text-blue-600 underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 flex items-center gap-3">
        <Bell className="w-8 h-8 text-indigo-600" />
        Reminders
      </h1>
      <p className="text-gray-500 mb-8">
        Stay on top of your schedule. These are your upcoming and past reminders.
      </p>

      {/* Filter */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <label className="text-sm font-medium text-gray-700">Show:</label>
        <select
          value={filterStatus}
          onChange={(e) => handleFilterChange(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Reminders</option>
          <option value="pending">Pending Only</option>
          <option value="completed">Completed Only</option>
        </select>
      </div>

      {reminders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No reminders yet. Create one via voice or text!</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`bg-white rounded-xl p-5 shadow-sm border transition-all hover:shadow-md ${
                  reminder.completed ? "opacity-75" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p
                      className={`font-medium text-lg ${
                        reminder.completed
                          ? "line-through text-gray-400"
                          : "text-gray-800"
                      }`}
                    >
                      {reminder.text || "Untitled Reminder"}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDueDate(reminder.remind_at)}</span>
                      </div>
                      {reminder.completed && (
                        <span className="text-green-600 font-medium">Completed</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleReminder(reminder.id)}
                    disabled={toggling[reminder.id]}
                    className={`ml-4 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition ${
                      reminder.completed
                        ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    } disabled:opacity-50`}
                  >
                    {toggling[reminder.id] ? (
                      "Saving..."
                    ) : reminder.completed ? (
                      <>
                        <Check className="w-4 h-4" /> Done
                      </>
                    ) : (
                      "Mark Done"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200">
              <button
                onClick={() => fetchReminders(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({totalCount} total)
              </span>

              <button
                onClick={() => fetchReminders(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}