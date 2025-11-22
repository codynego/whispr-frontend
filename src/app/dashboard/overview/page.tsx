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
  return content ? content : "";
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

  // === Load Data Safely ===
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

  // === Safe Calculations ===
  const todayReminders = reminders.filter(
    r => !r.completed && new Date(r.remind_at).toDateString() === today
  );

  const overdueTodos = todos.filter(t => !t.done);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-20 h-20 text-emerald-600 animate-pulse mx-auto mb-8" />
          <p className="text-2xl font-medium text-gray-700">Waking up your second brain...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Whisone</h1>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-2xl px-5 py-3 w-96 shadow-sm">
              <Search className="w-5 h-5 text-gray-500 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your entire memory..."
                className="bg-transparent outline-none flex-1 text-gray-800 placeholder-gray-500"
              />
            </form>
            <button className="p-3 hover:bg-gray-100 rounded-2xl transition">
              <Settings className="w-6 h-6 text-gray-700" />
            </button>
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {user?.first_name?.[0]?.toUpperCase() || "U"}
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Greeting */}
        <section className="text-center lg:text-left">
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            {greeting}, {user?.first_name || "there"}
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600">
            You have <strong>{todayReminders.length} reminder{todayReminders.length !== 1 && "s"}</strong> today
            {overdueTodos.length > 0 && (
              <> and <strong className="text-red-600">{overdueTodos.length} overdue task{overdueTodos.length !== 1 && "s"}</strong></>
            )}
            .
          </p>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="flex gap-10 overflow-x-auto pb-6 lg:pb-0 lg:justify-center scrollbar-hide">
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
                className="group flex flex-col items-center gap-5 min-w-[180px] p-10 bg-white rounded-3xl shadow-xl hover:shadow-2xl border-2 border-transparent hover:border-emerald-400 transition-all duration-300 hover:-translate-y-4"
              >
                <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center group-hover:scale-110 transition">
                  <action.icon className="w-14 h-14 text-emerald-600" />
                </div>
                <span className="text-lg font-semibold text-gray-800">{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Morning Briefing */}
            <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white rounded-3xl p-12 shadow-2xl">
              <h3 className="text-4xl font-bold mb-10 flex items-center gap-4">
                <Sparkles className="w-10 h-10" />
                Morning Briefing
              </h3>

              {overview?.daily_summary?.summary_text ? (
                <div
                  className="prose prose-invert max-w-none text-lg leading-relaxed space-y-6"
                  dangerouslySetInnerHTML={{ __html: safeContent(overview.daily_summary.summary_text) }}
                />
              ) : (
                <div className="text-white/90 text-lg space-y-4">
                  <p>Your second brain is quietly watching everything you say on WhatsApp.</p>
                  <p className="font-medium">Your personalized briefing will arrive tonight — perfectly summarized.</p>
                </div>
              )}

              <div className="mt-12 pt-8 border-t border-white/30 flex justify-between text-sm">
                <button className="hover:underline font-medium">Mark as read</button>
                <button className="hover:underline font-medium">Save for later</button>
              </div>
            </div>

            {/* Today at a Glance */}
            <div className="bg-white rounded-3xl p-10 shadow-2xl border border-gray-100">
              <h3 className="text-3xl font-bold text-gray-900 mb-8">Today at a Glance</h3>
              <div className="space-y-6">
                {todayReminders.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-6 bg-amber-50 rounded-2xl border border-amber-200">
                    <div className="flex items-center gap-5">
                      <Clock className="w-8 h-8 text-amber-600" />
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">{r.text}</p>
                        <p className="text-gray-600">{format(new Date(r.remind_at), "h:mm a")}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {overdueTodos.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-6 bg-red-50 rounded-2xl border border-red-200">
                    <div className="flex items-center gap-5">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                      <p className="font-semibold text-gray-900 text-lg">{t.task}</p>
                    </div>
                    <input type="checkbox" className="w-7 h-7 rounded text-emerald-600" />
                  </div>
                ))}

                {todayReminders.length === 0 && overdueTodos.length === 0 && (
                  <p className="text-center text-gray-500 py-16 text-xl font-medium">
                    All clear today — you&lsquo;re absolutely crushing it
                  </p>
                )}
              </div>
            </div>

            {/* Recent Memories */}
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-10">Recent Memories</h3>
              <div className="grid md:grid-cols-2 gap-8">
                {notes.length > 0 ? (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => router.push(`/dashboard/notes/${note.id}`)}
                      className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition cursor-pointer group"
                    >
                      <p className="text-gray-800 leading-relaxed line-clamp-5 group-hover:text-gray-900">
                        {note.content}
                      </p>
                      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                        <span>{format(new Date(note.created_at), "MMM d, h:mm a")}</span>
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="col-span-2 text-center text-gray-500 py-16 text-xl">
                    No memories yet — just talk to me on WhatsApp and everything appears here
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-12">
            {/* Stats */}
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-10">Your Second Brain</h3>
              <div className="grid grid-cols-2 gap-8">
                {[
                  { icon: FileText, label: "Notes Saved", value: notes.length + "+" },
                  { icon: Clock, label: "Active Reminders", value: overview?.stats.total_reminders ?? 0 },
                  { icon: CheckCircle2, label: "Todos Done", value: overview?.stats.completed_todos ?? 0 },
                  { icon: Sparkles, label: "Today's Summary", value: overview?.has_summary ? "1" : "0" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100 text-center">
                    <stat.icon className="w-14 h-14 text-emerald-600 mx-auto mb-6" />
                    <p className="text-5xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-gray-600 mt-3 text-lg">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Suggestion */}
            {(overdueTodos.length > 0 || todayReminders.length > 0) && (
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-10 border-4 border-red-200 shadow-2xl">
                <div className="flex items-center gap-5 mb-8">
                  <Lightbulb className="w-12 h-12 text-red-600" />
                  <h4 className="text-3xl font-bold text-gray-900">Smart Suggestion</h4>
                </div>
                <p className="text-xl text-gray-800 mb-10">
                  You have{" "}
                  {overdueTodos.length > 0
                    ? `${overdueTodos.length} overdue task${overdueTodos.length > 1 ? "s" : ""}`
                    : "important tasks due today"}
                  .
                </p>
                <button
                  onClick={() => router.push("/dashboard/todos")}
                  className="w-full bg-red-600 text-white py-6 rounded-3xl font-bold text-xl hover:bg-red-700 transition shadow-lg"
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