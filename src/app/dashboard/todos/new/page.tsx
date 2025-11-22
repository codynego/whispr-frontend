// app/dashboard/todos/new/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function NewTodo() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [task, setTask] = useState("");

  useEffect(() => inputRef.current?.focus(), []);

  const save = async () => {
    if (!task.trim()) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/todos/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ task: task.trim() }),
    });

    router.push("/dashboard/todos");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard/todos")}
            className="text-gray-700 hover:bg-gray-100 rounded-xl px-4 py-2 transition"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!task.trim()}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            Save Todo
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <input
          ref={inputRef}
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full text-3xl font-medium text-gray-900 bg-transparent outline-none placeholder-gray-400"
        />
      </main>
    </div>
  );
}