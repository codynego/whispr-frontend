// app/dashboard/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Brain, Search, Settings, Clock, CheckCircle2, Calendar,
  FileText, Lightbulb, AlertCircle, Sparkles, ChevronRight,
  TrendingUp, Target, Zap, ArrowRight, Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
}

const safeArray = (data: any): any[] => Array.isArray(data) ? data : data?.results || [];
const safeContent = (text: string | null | undefined): string =>
  text ? text.replace(/\n/g, "<br />") : "Your AI is still learning your patterns...";

export default function WhisoneDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dataLoading, setDataLoading] = useState(true);

  // Prevent double execution in React 18+ StrictMode (dev only)
  const hasInitialized = useRef(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (hasInitialized.current) return;
    if (authLoading) return;
    if (!user) {
      setDataLoading(false);
      hasInitialized.current = true;
      return;
    }

    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL + "/whisone";

        const [ovRes, notesRes, remRes, todoRes] = await Promise.all([
          fetch(`${base}/overview/`, { credentials: "include" }),
          fetch(`${base}/notes/?ordering=-created_at&limit=6`, { credentials: "include" }),
          fetch(`${base}/reminders/`, { credentials: "include" }),
          fetch(`${base}/todos/`, { credentials: "include" }),
        ]);

        if (cancelled) return;

        const [ovData, notesData, remData, todoData] = await Promise.all([
          ovRes.ok ? ovRes.json() : null,
          notesRes.ok ? notesRes.json() : [],
          remRes.ok ? remRes.json() : [],
          todoRes.ok ? todoRes.json() : [],
        ]);

        if (!cancelled) {
          setOverview(ovData);
          setNotes(safeArray(notesData));
          setReminders(safeArray(remData));
          setTodos(safeArray(todoData));
        }
      } catch (err) {
        console.error("Dashboard failed to load:", err);
      } finally {
        if (!cancelled) {
          setDataLoading(false);
          hasInitialized.current = true;
        }
      }
    };

    loadDashboard();

    return () => { cancelled = true; };
  }, [user, authLoading]);

  const today = new Date();
  const todayStr = today.toDateString();
  const todayReminders = reminders.filter(r => !r.completed && new Date(r.remind_at).toDateString() === todayStr);
  const overdueTodos = todos.filter(t => !t.done);
  const recentNotes = notes.slice(0, 2);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Loading State
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="relative">
            <div className="w-32 h-32 bg-emerald-100 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
              <Brain className="w-20 h-20 text-emerald-600" />
            </div>
            <Sparkles className="absolute -top-4 -right-4 w-12 h-12 text-emerald-500 animate-bounce" />
          </div>
          <h2 className="mt-10 text-4xl font-extrabold text-gray-900">Waking up your second brain</h2>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-xl text-gray-600">Loading your world...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not Authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <Brain className="w-24 h-24 text-gray-300 mx-auto mb-8" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Whisone</h2>
          <p className="text-lg text-gray-600">
            Please <a href="/auth/login" className="text-emerald-600 font-bold underline hover:text-emerald-700">sign in</a> to access your second brain.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
        <div className="px-6 lg:px-8 py-5 max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Brain className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Whisone</h1>
            </div>

            <div className="flex items-center gap-5 flex-1 max-w-2xl">
              <div className="hidden lg:flex flex-1 items-center bg-gray-100 rounded-2xl px-6 py-4 shadow-inner">
                <Search className="w-6 h-6 text-gray-500 mr-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search your entire memory..."
                  className="bg-transparent outline-none flex-1 text-gray-800 placeholder-gray-500 text-lg"
                />
              </div>

              <button
                onClick={() => router.push("/dashboard/search")}
                className="lg:hidden p-4 bg-gray-100 hover:bg-gray-200 rounded-2xl transition"
              >
                <Search className="w-7 h-7 text-gray-600" />
              </button>

              <button className="p-4 hover:bg-gray-100 rounded-2xl transition">
                <Settings className="w-7 h-7 text-gray-700" />
              </button>

              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                {user.first_name?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 lg:px-8 py-12 max-w-7xl mx-auto space-y-16">
        {/* Hero Greeting */}
        <section className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-5 mb-8">
              <Sparkles className="w-10 h-10 text-yellow-300" />
              <span className="px-6 py-3 bg-white/20 backdrop-blur rounded-full font-bold text-lg">
                {format(today, "EEEE, MMMM d")}
              </span>
            </div>

            <h2 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
              {greeting},<br />{user.first_name || "friend"}!
            </h2>

            <p className="text-2xl text-white/90 mb-10 max-w-4xl">
              {todayReminders.length || overdueTodos.length ? (
                <>You have {todayReminders.length ? <strong>{todayReminders.length} reminder{todayReminders.length > 1 && "s"}</strong> : ""}{" "}
                  {todayReminders.length && overdueTodos.length && "and "}
                  {overdueTodos.length ? <strong>{overdueTodos.length} task{overdueTodos.length > 1 && "s"}</strong> : ""} today</>
              ) : (
                "You’re all caught up — have a powerful day!"
              )}
            </p>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-4 bg-white/20 backdrop-blur px-6 py-4 rounded-2xl">
                <FileText className="w-7 h-7" />
                <span className="text-xl font-bold">{notes.length} Notes</span>
              </div>
              <div className="flex items-center gap-4 bg-white/20 backdrop-blur px-6 py-4 rounded-2xl">
                <CheckCircle2 className="w-7 h-7" />
                <span className="text-xl font-bold">{overview?.stats.completed_todos || 0} Done</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-4xl font-extrabold text-gray-900">Quick Actions</h3>
            <Zap className="w-10 h-10 text-emerald-500" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {[
              { label: "New Note", icon: FileText, path: "/dashboard/notes", color: "from-blue-500 to-blue-600" },
              { label: "Reminder", icon: Clock, path: "/dashboard/reminders", color: "from-amber-500 to-orange-600" },
              { label: "Todo", icon: CheckCircle2, path: "/dashboard/todos", color: "from-green-500 to-emerald-600" },
              { label: "Calendar", icon: Calendar, path: "/dashboard/calendar", color: "from-purple-500 to-violet-600" },
              { label: "Ask Whisone", icon: Sparkles, path: "/dashboard/assistant", color: "from-pink-500 to-rose-600", pulse: true },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.path)}
                className="group relative bg-white rounded-3xl p-10 border-2 border-gray-100 hover:border-emerald-400 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-3"
              >
                <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-10 h-10 text-white" />
                </div>
                <p className="mt-6 text-xl font-bold text-gray-900 text-center">{action.label}</p>
                {action.pulse && (
                  <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse shadow-xl">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Daily Briefing + Today at a Glance */}
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Daily Briefing */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                    <Lightbulb className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-extrabold text-white">Daily Briefing</h3>
                    <p className="text-white/80 text-lg">Your AI-powered insights</p>
                  </div>
                </div>
                <Sparkles className="w-10 h-10 text-yellow-300" />
              </div>
            </div>

            <div className="p-10">
              {overview?.daily_summary?.summary_text ? (
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: safeContent(overview.daily_summary.summary_text) }}
                />
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <Brain className="w-14 h-14 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-3">Learning your patterns</p>
                  <p className="text-lg text-gray-600">Your first AI briefing arrives tonight</p>
                </div>
              )}
            </div>
          </div>

          {/* Today at a Glance */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-4">
              <Target className="w-8 h-8 text-emerald-500" />
              Today at a Glance
            </h3>

            {todayReminders.length === 0 && overdueTodos.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-16 h-16 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">All clear!</p>
                <p className="text-xl text-gray-600 mt-3">No pending tasks</p>
              </div>
            ) : (
              <div className="space-y-6">
                {todayReminders.map((r) => (
                  <div key={r.id} className="flex items-center gap-5 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 hover:shadow-lg transition-shadow group cursor-pointer">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{r.text}</p>
                      <p className="text-amber-700 font-medium">{format(new Date(r.remind_at), "h:mm a")}</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}

                {overdueTodos.slice(0, 4).map((t) => (
                  <div key={t.id} className="flex items-center gap-5 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200 hover:shadow-lg transition-shadow group cursor-pointer">
                    <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{t.task}</p>
                      <p className="text-red-700 font-medium">Overdue</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Memories */}
        {recentNotes.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-extrabold text-gray-900">Recent Memories</h3>
              <button
                onClick={() => router.push("/dashboard/notes")}
                className="flex items-center gap-3 text-emerald-600 hover:text-emerald-700 font-bold text-lg group"
              >
                View all
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {recentNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => router.push(`/dashboard/notes/${note.id}`)}
                  className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl hover:border-emerald-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-5 mb-5">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-7 h-7 text-emerald-600" />
                    </div>
                    <p className="text-lg text-gray-800 leading-relaxed line-clamp-4 flex-1">
                      {note.content}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="font-medium">{format(new Date(note.created_at), "MMM d, h:mm a")}</span>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}