// app/dashboard/todos/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, CheckSquare, Square, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Todo {
  id: number;
  task: string;
  done: boolean;
  created_at: string;
  updated_at: string;
}

export default function TodoDetail() {
  const router = useRouter();
  const { id } = useParams();
  const { accessToken } = useAuth();
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !accessToken) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/todos/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.ok ? r.json() : router.replace("/dashboard/todos"))
      .then(setTodo)
      .finally(() => setLoading(false));
  }, [id, accessToken, router]);

  const toggleDone = async () => {
    if (!todo) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/todos/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ done: !todo.done }),
    });
    setTodo({ ...todo, done: !todo.done });
  };

  const deleteTodo = async () => {
    if (!confirm("Delete this todo permanently?")) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/todos/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    router.push("/dashboard/todos");
  };

  if (loading || !todo) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard/todos")}
            className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-xl px-4 py-2 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            All Todos
          </button>
          <button
            onClick={deleteTodo}
            className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100">
          <div className="flex items-start justify-between mb-8">
            <h1 className={`text-3xl font-bold ${todo.done ? "line-through text-gray-500" : "text-gray-900"}`}>
              {todo.task}
            </h1>
            <button
              onClick={toggleDone}
              className={`px-6 py-3 rounded-2xl font-medium transition ${
                todo.done
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {todo.done ? "Undo" : "Mark Done"}
            </button>
          </div>

          <div className="space-y-4 text-gray-600">
            <div className="flex items-center gap-4">
              {todo.done ? (
                <CheckSquare className="w-5 h-5 text-emerald-600" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
              <span>{todo.done ? "Completed" : "Pending"}</span>
            </div>
            <p className="text-sm">
              Created {format(new Date(todo.created_at), "PPP 'at' p")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}