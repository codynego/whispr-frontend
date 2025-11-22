"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Brain, Search, Settings, Clock, CheckCircle2, Calendar,
  FileText, Lightbulb, AlertCircle, ChevronRight, Sparkles
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Types from your real backend
interface DailySummary { id: number; content: string; summary_date: string; }
interface Note { id: number; content: string; created_at: string; }
interface Reminder { id: number; text: string; remind_at: string; completed: boolean; }
interface Todo { id: number; task: string; done: boolean; }

interface OverviewResponse {
  has_summary: boolean;
  daily_summary: DailySummary | null;
  stats: { total_reminders: number; completed_todos: number; };
  recent_notes: Note[];
}

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
  const todayStr = new Date().toDateString();

  // Fetch all real data in parallel
  useEffect(() => {
    if (!accessToken) return;

    const loadData = async () => {
      try {
        const [ovRes, notesRes, remRes, todoRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/overview/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/?ordering=-created_at&limit=6`, { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/todos/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        ]);

        if (ovRes.ok) setOverview(await ovRes.json());
        if (notesRes.ok) setNotes(await notesRes.json());
        if (remRes.ok) setReminders(await remRes.json());
        if (todoRes.ok) setTodos(await todoRes.json());
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [accessToken]);

  // Real-time calculations
  const todayReminders = reminders.filter(r => !r.completed && new Date(r.remind_at).toDateString() === todayStr);
  const overdueTodos = todos.filter(t => !t.done);

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
          <Brain className="w-16 h-16 text-emerald-600 animate-pulse mx-auto mb-4" />
          <p className="text-xl text-gray-600">Waking up your second brain...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 1. Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Whisone</h1>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-xl px-4 py-2.5 w-96">
              <Search className="w-5 h-5 text-gray-500 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search everything you've ever said..."
                className="bg-transparent outline-none flex-1 text-gray-700 placeholder-gray-500"
              />
            </form>
            <button className="p-2 hover:bg-gray-100 rounded-xl transition"><Settings className="w-6 h-6 text-gray-700" /></button>
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.first_name?.[0] || "U"}
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* 2. Greeting */}
        <section className="text-center lg:text-left">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            {greeting}, {user?.first_name || "there"}
          </h2>
          <p className="text-xl text-gray-600">
            You have <strong>{todayReminders.length} reminder{todayReminders.length !== 1 && "s"}</strong> today
            {overdueTodos.length > 0 && <> and <strong className="text-red-600">{overdueTodos.length} overdue task{overdueTodos.length !== 1 && "s"}</strong></>}
          </p>
        </section>

        {/* 3. Quick Action Tiles */}
        <section>
          <div className="flex gap-6 overflow-x-auto pb-4 lg:pb-0 lg:justify-center scrollbar-hide">
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
                className="flex flex-col items-center gap-4 min-w-[140px] p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 hover:border-emerald-300 transition-all hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <action.icon className="w-10 h-10 text-emerald-600" />
                </div>
                <span className="font-medium text-gray-800">{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left Column: Daily Summary + Today + Recent */}
          <div className="lg:col-span-2 space-y-10">
            {/* 4. Morning Briefing */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-10 shadow-2xl">
              <h3 className="text-3xl font-bold mb-8 flex items-center gap-3">
                Morning Briefing
              </h3>
              {overview?.daily_summary ? (
                <div
                  className="prose prose-invert max-w-none text-lg leading-relaxed space-y-5"
                  dangerouslySetInnerHTML={{ __html: overview.daily_summary.content.replace(/\n/g, "<br />") }}
                />
              ) : (
                <p className="text-white/90 text-lg">Your AI is watching everything you say on WhatsApp. Your full briefing arrives tonight.</p>
              )}
              <div className="mt-8 pt-6 border-t border-white/30 flex justify-between text-sm">
                <button className="hover:underline">Mark as read</button>
                <button className="hover:underline">Save for later</button>
              </div>
            </div>

            {/* 6. Today at a Glance */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Today at a Glance</h3>
              <div className="space-y-4">
                {todayReminders.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-5 bg-amber-50 rounded-2xl border border-amber-200">
                    <div className="flex items-center gap-4">
                      <Clock className="w-6 h-6 text-amber-600" />
                      <div>
                        <p className="font-medium text-gray-900">{r.text}</p>
                        <p className="text-sm text-gray-600">{format(new Date(r.remind_at), "h:mm a")}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {overdueTodos.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-5 bg-red-50 rounded-2xl border border-red-200">
                    <div className="flex items-center gap-4">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                      <p className="font-medium text-gray-900">{t.task}</p>
                    </div>
                    <input type="checkbox" className="w-6 h-6 rounded text-emerald-600" />
                  </div>
                ))}
                {todayReminders.length === 0 && overdueTodos.length === 0 && (
                  <p className="text-center text-gray-500 py-10">All clear today — you’re crushing it</p>
                )}
              </div>
            </div>

            {/* 7. Recent Notes */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Memories</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {notes.length > 0 ? notes.map(note => (
                  <div key={note.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition cursor-pointer"
                    onClick={() => router.push(`/dashboard/notes/${note.id}`)}>
                    <p className="text-gray-800 line-clamp-4 leading-relaxed">{note.content}</p>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <span>{format(new Date(note.created_at), "MMM d, h:mm a")}</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 col-span-2 text-center py-8">No notes yet — say anything on WhatsApp and it appears here</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Stats + Smart Suggestion */}
          <div className="space-y-10">
            {/* 5. Stats Cards */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Second Brain</h3>
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 text-center">
                  <FileText className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-900">{notes.length}+</p>
                  <p className="text-sm text-gray-600">Notes Saved</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 text-center">
                  <Clock className="w-10 h-10 text-amber-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-900">{overview?.stats.total_reminders || 0}</p>
                  <p className="text-sm text-gray-600">Active Reminders</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-900">{overview?.stats.completed_todos || 0}</p>
                  <p className="text-sm text-gray-600">Todos Done</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 text-center">
                  <Sparkles className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-900">{overview?.has_summary ? "1" : "0"}</p>
                  <p className="text-sm text-gray-600">Today&apos;s Summary</p>
                </div>
              </div>
            </div>

            {/* 8. Smart Suggestion */}
            {(overdueTodos.length > 0 || todayReminders.length > 0) && (
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-8 border-2 border-red-200">
                <div className="flex items-center gap-3 mb-5">
                  <Lightbulb className="w-8 h-8 text-red-600" />
                  <h4 className="text-xl font-bold text-gray-900">Smart Suggestion</h4>
                </div>
                <p className="text-gray-800 mb-6">
                  You have {overdueTodos.length > 0 ? `${overdueTodos.length} overdue task${overdueTodos.length > 1 ? "s" : ""}` : "tasks due today"}.
                  Want to clear them now?
                </p>
                <button
                  onClick={() => router.push("/dashboard/todos")}
                  className="w-full bg-red-600 text-white py-4 rounded-2xl font-semibold hover:bg-red-700 transition"
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