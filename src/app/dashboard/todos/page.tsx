// app/dashboard/todos/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CheckSquare, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Todo {
  id: number;
  task: string;
  done: boolean;
  created_at: string;
  updated_at: string;
}

export default function TodosPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/todos/?ordering=-updated_at`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(data => setTodos(Array.isArray(data) ? data : data.results || []))
      .finally(() => setLoading(false));
  }, [accessToken]);

  const pending = todos.filter(t => !t.done);
  const completed = todos.filter(t => t.done);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <CheckSquare className="w-16 h-16 text-emerald-600 animate-pulse mb-4" />
          <p className="text-lg text-gray-600">Loading your todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <CheckSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Todos</h1>
              <p className="text-gray-600">
                {pending.length} pending • {completed.length} completed
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {todos.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-32 h-32 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <CheckSquare className="w-16 h-16 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">No todos yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Say “Add buy groceries to my todos” on WhatsApp — it appears here instantly.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Todos */}
            {pending.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-5">To Do</h2>
                <div className="space-y-4">
                  {pending.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => router.push(`/dashboard/todos/${t.id}`)}
                      className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-300 transition cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-lg font-medium text-gray-900">{t.task}</p>
                        <span className="text-emerald-600 group-hover:translate-x-1 transition">View</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Added {format(new Date(t.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Completed Todos */}
            {completed.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-5 mt-12">Completed</h2>
                <div className="space-y-4">
                  {completed.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => router.push(`/dashboard/todos/${t.id}`)}
                      className="group bg-white/70 rounded-2xl p-6 border border-gray-200 cursor-pointer opacity-80"
                    >
                      <div className="flex items-center gap-4">
                        <CheckSquare className="w-6 h-6 text-emerald-600" />
                        <p className="text-gray-700 line-through">{t.task}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => router.push("/dashboard/todos/new")}
        className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 hover:bg-emerald-700 transition-all z-50"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}