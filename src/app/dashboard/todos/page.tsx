"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { CheckSquare, Square, Calendar, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Todo {
  id: number;
  task: string;
  done: boolean;
  created_at: string;
  updated_at: string;
}

export default function TodosPage() {
  const { accessToken } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<Record<number, boolean>>({});
  const [deleting, setDeleting] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  useEffect(() => {
    if (!accessToken) {
      setError("Please log in to view your todos.");
      setLoading(false);
      return;
    }
    fetchTodos(1);
  }, [accessToken, filter]);

  const fetchTodos = async (page: number) => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);

      let url = `${process.env.NEXT_PUBLIC_API_URL}/whisone/todos/?page=${page}&page_size=${pageSize}`;
      if (filter === "pending") url += "&done=false";
      if (filter === "done") url += "&done=true";

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

      if (!response.ok) throw new Error("Failed to load todos");

      const data = await response.json();
      const apiTodos: Todo[] = data.results || data;

      // Sort: incomplete first, then by updated_at descending
      const sorted = apiTodos.sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });

      setTodos(sorted);
      setTotalCount(data.count ?? apiTodos.length);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo || !accessToken) return;

    setToggling((prev) => ({ ...prev, [id]: true }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/todos/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ done: !todo.done }),
      });

      if (!response.ok && response.status !== 401) throw new Error("Update failed");

      // Optimistic UI update
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update todo");
    } finally {
      setToggling((prev) => ({ ...prev, [id]: false }));
    }
  };

  const deleteTodo = async (id: number) => {
    if (!confirm("Delete this todo permanently?")) return;

    setDeleting((prev) => ({ ...prev, [id]: true }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/todos/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok || response.status === 204) {
        setTodos((prev) => prev.filter((t) => t.id !== id));
        setTotalCount((c) => c - 1);
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      alert("Could not delete todo");
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    return isToday
      ? `Today at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
      : format(date, "MMM d, yyyy");
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading todos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-lg text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => fetchTodos(1)}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const completedCount = todos.filter((t) => t.done).length;
  const pendingCount = todos.length - completedCount;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-800 flex items-center gap-3">
          <CheckSquare className="w-9 h-9 text-green-600" />
          My Todos
        </h1>
        <p className="text-gray-500 mb-8">
          Simple, powerful task list. Created from your voice commands, emails, and Whisone AI.
        </p>

        {/* Stats + Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex gap-6 text-sm">
            <span className="text-gray-600">
              <strong className="text-indigo-600">{pendingCount}</strong> pending
            </span>
            <span className="text-gray-600">
              <strong className="text-green-600">{completedCount}</strong> done
            </span>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Todos</option>
            <option value="pending">Pending Only</option>
            <option value="done">Completed Only</option>
          </select>
        </div>

        {todos.length === 0 ? (
          <div className="text-center py-16">
            <CheckSquare className="w-20 h-20 mx-auto mb-6 text-gray-300" />
            <p className="text-xl text-gray-500">No todos yet!</p>
            <p className="text-gray-400 mt-2">
              Try saying: “Hey Whisone, add buy milk to my todos”
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`bg-white rounded-xl p-5 shadow-sm border transition-all hover:shadow-md flex items-start gap-4 ${
                    todo.done ? "opacity-70" : ""
                  }`}
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    disabled={toggling[todo.id]}
                    className="mt-1 transition-transform hover:scale-110"
                  >
                    {todo.done ? (
                      <CheckSquare className="w-6 h-6 text-green-600" />
                    ) : (
                      <Square className="w-6 h-6 text-gray-400 hover:text-indigo-600" />
                    )}
                  </button>

                  <div className="flex-1">
                    <p
                      className={`text-lg font-medium ${
                        todo.done
                          ? "line-through text-gray-500"
                          : "text-gray-800"
                      }`}
                    >
                      {todo.task}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {todo.done
                          ? `Completed ${formatDate(todo.updated_at)}`
                          : `Added ${formatDate(todo.created_at)}`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    disabled={deleting[todo.id]}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                    title="Delete todo"
                  >
                    {deleting[todo.id] ? (
                      <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-6">
                <button
                  onClick={() => fetchTodos(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({totalCount} total)
                </span>

                <button
                  onClick={() => fetchTodos(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}