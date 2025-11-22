"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Brain, Search, Settings, Clock, CheckCircle2, Calendar,
  FileText, Lightbulb, AlertCircle, ChevronRight, Sparkles
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// === Types ===
interface DailySummary {
  id: number;
  summary_text: string;
  summary_date: string;
}

interface Note { id: number; content: string; created_at: string; }
interface Reminder { id: number; text: string; remind_at: string; completed: boolean; }
interface Todo { id: number; task: string; done: boolean; }

interface OverviewResponse {
  has_summary: boolean;
  daily_summary: DailySummary | null;
  stats: { total_reminders: number; completed_todos: number };
  recent_notes: Note[];
}

// === Safe Helpers ===
const safeArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
};

const safeContent = (content: string | null | undefined): string => {
  return content ? content.replace(/\n/g, "<br />") : "";
};

export default function WhisoneDashboard() {
  const router = useRouter();
  const { user, accessToken } = useAuth();

  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toDateString();

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL + "/whisone";

        const [ovRes, notesRes, remRes, todoRes] = await Promise.all([
          fetch(`${base}/overview/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch(`${base}/notes/?ordering=-created_at&limit=6`, { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch(`${base}/reminders/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch(`${base}/todos/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        ]);

        if (ovRes.ok) setOverview(await ovRes.json());
        if (notesRes.ok) setNotes(safeArray(await notesRes.json()));
        if (remRes.ok) setReminders(safeArray(await remRes.json()));
        if (todoRes.ok) setTodos(safeArray(await todoRes.json()));
      } catch (err) {
        console.error("Dashboard failed to load:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [accessToken]);

  const todayReminders = reminders.filter(r => !r.completed && new Date(r.remind_at).toDateString() === today);
  const overdueTodos = todos.filter(t => !t.done);
  const recentTwoNotes = notes.slice(0, 2); // Only top 2

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-emerald-600 animate-pulse mb-6" />
          <p className="text-lg text-gray-600">Waking up your second brain...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Whisone</h1>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-xl px-4 py-2.5 w-80">
              <Search className="w-5 h-5 text-gray-500 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your memory..."
                className="bg-transparent outline-none flex-1 text-gray-700 placeholder-gray-500"
              />
            </form>
            <button className="p-2 hover:bg-gray-100 rounded-xl"><Settings className="w-6 h-6" /></button>
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.first_name?.[0]?.toUpperCase() || "U"}
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* Greeting */}
        <section className="text-center lg:text-left">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            {greeting}, {user?.first_name || "there"}
          </h2>
          <p className="text-lg text-gray-600">
            You have <strong>{todayReminders.length} reminder{todayReminders.length !== 1 && "s"}</strong> today
            {overdueTodos.length > 0 && (
              <> and <strong className="text-red-600">{overdueTodos.length} overdue</strong></>
            )}
          </p>
        </section>

        {/* Quick Actions */}
        <section className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 pb-4">
            {[
              { label: "Create Note", icon: FileText, path: "/dashboard/notes" },
              { label: "Add Reminder", icon: Clock, path: "/dashboard/reminders" },
              { label: "New Todo", icon: CheckCircle2, path: "/dashboard/todos" },
              { label: "Add Event", icon: Calendar, path: "/dashboard/calendar" },
              { label: "Ask Whisone", icon: Sparkles, path: "/dashboard/assistant" },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.path)}
                className="flex flex-col items-center gap-3 min-w-[130px] p-6 bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 hover:border-emerald-300 transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <action.icon className="w-8 h-8 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-gray-800">{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Morning Briefing */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-6">Morning Briefing</h3>
              {overview?.daily_summary?.summary_text ? (
                <div
                  className="text-white/90 text-base leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: safeContent(overview.daily_summary.summary_text) }}
                />
              ) : (
                <p className="text-white/90 text-base">
                  Your AI is watching everything. Briefing arrives tonight.
                </p>
              )}
            </div>

            {/* Today at a Glance */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-5">Today at a Glance</h3>
              <div className="space-y-4">
                {todayReminders.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-4">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-gray-900">{r.text}</p>
                        <p className="text-sm text-gray-600">{format(new Date(r.remind_at), "h:mm a")}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {overdueTodos.slice(0, 3).map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-center gap-4">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="font-medium text-gray-900">{t.task}</p>
                    </div>
                  </div>
                ))}

                {todayReminders.length === 0 && overdueTodos.length === 0 && (
                  <p className="text-center text-gray-500 py-8">All clear today</p>
                )}
              </div>
            </div>

            {/* Recent Memories — Only 2 */}
            {recentTwoNotes.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Memories</h3>
                <div className="grid md:grid-cols-2 gap-5">
                  {recentTwoNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => router.push(`/dashboard/notes/${note.id}`)}
                      className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
                    >
                      <p className="text-gray-800 text-sm line-clamp-3 leading-relaxed">{note.content}</p>
                      <p className="text-xs text-gray-500 mt-3">
                        {format(new Date(note.created_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-5">Your Second Brain</h3>
              <div className="grid grid-cols-2 gap-5 text-center">
                <div>
                  <FileText className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{notes.length}+</p>
                  <p className="text-sm text-gray-600">Notes</p>
                </div>
                <div>
                  <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{overview?.stats.total_reminders || 0}</p>
                  <p className="text-sm text-gray-600">Reminders</p>
                </div>
                <div>
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{overview?.stats.completed_todos || 0}</p>
                  <p className="text-sm text-gray-600">Done</p>
                </div>
                <div>
                  <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{overview?.has_summary ? "1" : "0"}</p>
                  <p className="text-sm text-gray-600">Summary</p>
                </div>
              </div>
            </div>

            {/* Smart Suggestion */}
            {(overdueTodos.length > 0 || todayReminders.length > 0) && (
              <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-6 h-6 text-red-600" />
                  <h4 className="text-lg font-bold text-gray-900">Smart Suggestion</h4>
                </div>
                <p className="text-gray-800 mb-5">
                  {overdueTodos.length > 0
                    ? `You have ${overdueTodos.length} overdue task${overdueTodos.length > 1 ? "s" : ""}`
                    : "You have tasks due today"}
                </p>
                <button
                  onClick={() => router.push("/dashboard/todos")}
                  className="w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition"
                >
                  Tackle Now
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}