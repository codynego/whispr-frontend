"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Clock, Mail, Check } from "lucide-react";

interface ApiTask {
  id: number;
  input_text: string;
  related_email_id?: number;
  due_datetime: string | null;
  status: "completed" | "pending";
}

interface Task {
  id: number;
  title: string;
  source: string;
  due: string;
  done: boolean;
}

export default function TasksPage() {
  const { accessToken } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20); // Default page size
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");

  useEffect(() => {
    if (!accessToken) {
      setError("Please log in to view tasks.");
      setLoading(false);
      return;
    }
    fetchTasks(1);
  }, [accessToken, filterStatus]);

  const fetchTasks = async (page: number) => {
    if (!accessToken) return;
    try {
      setLoading(true);
      setError(null);
      let url = `${process.env.NEXT_PUBLIC_API_URL}/assistant/tasks/?page=${page}&page_size=${pageSize}`;
      if (filterStatus !== "all") {
        url += `&status=${filterStatus}`;
      }
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status === 401) {
        console.error("Unauthorized: token invalid or expired");
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data: any = await response.json();
      const apiTasks = data.results || data;
      const mappedTasks: Task[] = (apiTasks as ApiTask[])
        .map((task: ApiTask): Task => ({
          id: task.id,
          title: task.input_text || "Untitled Task",
          source: task.related_email_id ? `Email ID: ${task.related_email_id}` : "Whisone AI",
          due: formatDueDate(task.due_datetime),
          done: task.status === "completed",
        }))
        .sort((a: Task, b: Task): number => {
          const dateA: number = new Date(a.due === "No Due Date" ? 0 : a.due).getTime();
          const dateB: number = new Date(b.due === "No Due Date" ? 0 : b.due).getTime();
          return dateA - dateB;
        });
      setTasks(mappedTasks);
      setTotalCount(data.count || apiTasks.length);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDueDate = (dueTime: string | null): string => {
    if (!dueTime) return "No Due Date";
    const due = new Date(dueTime);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (due >= today && due < tomorrow) return "Today";
    if (due >= tomorrow && due < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)) return "Tomorrow";
    return due.toLocaleDateString("en-US");
  };

  const toggleTask = async (id: number) => {
    if (!accessToken) return;

    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    setToggling((prev) => ({ ...prev, [id]: true }));
    const newDoneStatus = !task.done;
    const updateData = { status: newDoneStatus ? "completed" : "pending" };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistant/tasks/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.status === 401) {
        console.error("Unauthorized: token invalid or expired");
        setError("Session expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      // Refetch current page after update
      fetchTasks(currentPage);
    } catch (err) {
      console.error("Error toggling task:", err);
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setToggling((prev) => ({ ...prev, [id]: false }));
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleFilterChange = (status: "all" | "pending" | "completed") => {
    setFilterStatus(status);
    setCurrentPage(1); // Reset to first page on filter change
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Error: {error}</div>
        <button onClick={() => fetchTasks(1)} className="ml-4 text-blue-600 underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">✅ Tasks</h1>
      <p className="text-gray-500 text-sm mb-6">
        Automatically generated by Whisone AI from your messages and emails.
      </p>

      {/* Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
        <select
          value={filterStatus}
          onChange={(e) => handleFilterChange(e.target.value as "all" | "pending" | "completed")}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {tasks.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No tasks yet.</p>
      ) : (
        <>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl p-4 shadow-sm border flex justify-between items-center hover:shadow-md transition"
              >
                <div>
                  <p
                    className={`font-medium ${
                      task.done ? "line-through text-gray-400" : "text-gray-800"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                    <Mail className="w-4 h-4" />
                    <span>{task.source}</span>
                    <Clock className="w-4 h-4 ml-3" />
                    <span>{task.due}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleTask(task.id)}
                  disabled={!!toggling[task.id]}
                  aria-label={`Toggle task completion for ${task.title}`}
                  className={`text-sm font-semibold px-3 py-1 rounded-full disabled:opacity-50 flex items-center gap-1 ${
                    task.done
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-green-50"
                  }`}
                >
                  {toggling[task.id] ? (
                    "Updating..."
                  ) : task.done ? (
                    <>
                      Done <Check className="w-3 h-3" />
                    </>
                  ) : (
                    "Mark Done"
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => fetchTasks(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({totalCount} total tasks)
              </span>
              <button
                onClick={() => fetchTasks(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
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