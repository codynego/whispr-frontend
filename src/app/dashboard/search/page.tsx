// app/dashboard/search/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { FileText, Clock, CheckCircle2, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Note {
  id: number;
  content: string;
  created_at: string;
}

interface Reminder {
  id: number;
  text: string;
  remind_at: string;
  completed: boolean;
}

interface Todo {
  id: number;
  task: string;
  done: boolean;
}

interface SearchResults {
  query: string;
  notes: Note[];
  reminders: Reminder[];
  todos: Todo[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const { user, loading: authLoading } = useAuth(); // No accessToken!

  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const search = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/whisone/search/?q=${encodeURIComponent(query)}`,
          {
            credentials: "include", // Sends HttpOnly cookies automatically
          }
        );

        if (!res.ok) {
          if (res.status === 401) {
            console.warn("Unauthorized — user may be logged out");
            return;
          }
          throw new Error("Search failed");
        }

        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [query, user, authLoading]);

  if (!query) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center px-6">
        <div className="text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Type something to search your second brain</p>
        </div>
      </div>
    );
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center px-6">
        <div className="text-center">
          <Search className="w-12 h-12 text-emerald-600 animate-pulse mx-auto mb-4" />
          <p className="text-lg text-gray-600">Searching your entire memory...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center px-6">
        <p className="text-xl text-gray-600">Please log in to search</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center px-6">
        <p className="text-red-600">Something went wrong. Please try again.</p>
      </div>
    );
  }

  const hasResults =
    results && (results.notes.length > 0 || results.reminders.length > 0 || results.todos.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <Search className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Search results for <span className="text-emerald-600">&quot;{query}&quot;</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {!hasResults ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-xl text-gray-600 mb-2">No results found</p>
            <p className="text-gray-500">Try searching for something else</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Notes */}
            {results!.notes.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-emerald-600" />
                  Notes ({results!.notes.length})
                </h2>
                <div className="space-y-4">
                  {results!.notes.map((note) => (
                    <Link
                      key={note.id}
                      href={`/dashboard/notes/${note.id}`}
                      className="block p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition"
                    >
                      <p className="text-gray-800 leading-relaxed line-clamp-3">{note.content}</p>
                      <p className="text-xs text-gray-500 mt-3">
                        {format(new Date(note.created_at), "MMM d, yyyy · h:mm a")}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Reminders */}
            {results!.reminders.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-amber-600" />
                  Reminders ({results!.reminders.length})
                </h2>
                <div className="space-y-4">
                  {results!.reminders.map((r) => (
                    <div
                      key={r.id}
                      className={`p-5 rounded-xl border ${
                        r.completed
                          ? "bg-gray-50 border-gray-200 opacity-70"
                          : "bg-amber-50 border-amber-200"
                      }`}
                    >
                      <p className="font-medium text-gray-900">{r.text}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(r.remind_at), "MMM d, yyyy · h:mm a")}
                        {r.completed && " · Completed"}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Todos */}
            {results!.todos.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  Todos ({results!.todos.length})
                </h2>
                <div className="space-y-4">
                  {results!.todos.map((t) => (
                    <div
                      key={t.id}
                      className={`p-5 rounded-xl border ${
                        t.done
                          ? "bg-gray-50 border-gray-200 opacity-70"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <p className={`${t.done ? "line-through text-gray-500" : "text-gray-900 font-medium"}`}>
                        {t.task}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}