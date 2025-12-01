"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Brain,
  Search,
  Settings,
  Clock,
  CheckCircle2,
  Calendar,
  FileText,
  Lightbulb,
  AlertCircle,
  Sparkles,
  ChevronRight,
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
  recent_notes: Note[];
}

const safeArray = (data: any): any[] => Array.isArray(data) ? data : data?.results || [];
const safeContent = (content: string | null | undefined): string =>
  content ? content.replace(/\n/g, "<br />") : "";

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
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [accessToken]);

  const todayReminders = reminders.filter(r => !r.completed && new Date(r.remind_at).toDateString() === today);
  const overdueTodos = todos.filter(t => !t.done);
  const recentTwoNotes = notes.slice(0, 2);

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
          <Brain className="w-20 h-20 text-emerald-600 animate-pulse mb-6" />
          <p className="text-xl font-medium text-gray-700">Waking up your second brain...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">Whisone</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-100 rounded-2xl px-5 py-3.5 w-96 shadow-sm">
              <Search className="w-5 h-5 text-gray-500 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your memory..."
                className="bg-transparent outline-none flex-1 text-gray-800 placeholder-gray-500"
              />
            </form>

            {/* Mobile Search Button */}
            <button
              onClick={() => router.push("/dashboard/search")}
              className="md:hidden p-3 bg-gray-100 rounded-xl"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-3 hover:bg-gray-100 rounded-xl transition">
              <Settings className="w-6 h-6 text-gray-700" />
            </button>

            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user?.first_name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Greeting & Status */}
        <section className="text-center lg:text-left">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4">
            {greeting}, {user?.first_name || "friend"}
          </h2>
          <p className="text-xl text-gray-600">
            {todayReminders.length > 0 && (
              <>You have <span className="font-bold text-emerald-600">{todayReminders.length}</span> reminder{todayReminders.length !== 1 && "s"} today</>
            )}
            {todayReminders.length > 0 && overdueTodos.length > 0 && " • "}
            {overdueTodos.length > 0 && (
              <span className="text-red-600 font-bold">{overdueTodos.length} overdue task{overdueTodos.length !== 1 && "s"}</span>
            )}
            {!todayReminders.length && !overdueTodos.length && "You’re all clear today — enjoy the calm"}
          </p>
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { label: "New Note", icon: FileText, path: "/dashboard/notes" },
              { label: "Add Reminder", icon: Clock, path: "/dashboard/reminders" },
              { label: "Create Todo", icon: CheckCircle2, path: "/dashboard/todos" },
              { label: "Schedule Event", icon: Calendar, path: "/dashboard/calendar" },
              { label: "Ask Whisone", icon: Sparkles, path: "/dashboard/assistant", highlight: true },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.path)}
                className={`group relative p-8 rounded-3xl border-2 transition-all hover:shadow-2xl ${
                  action.highlight
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-transparent shadow-xl hover:shadow-emerald-600/30"
                    : "bg-white border-gray-100 hover:border-emerald-400"
                }`}
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 transition ${
                  action.highlight ? "bg-white/20" : "bg-emerald-100 group-hover:bg-emerald-200"
                }`}>
                  <action.icon className={`w-9 h-9 ${action.highlight ? "text-white" : "text-emerald-600"}`} />
                </div>
                <p className="font-semibold text-lg">{action.label}</p>
                {action.highlight && (
                  <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left: Briefing + Today */}
          <div className="lg:col-span-2 space-y-10">
            {/* Morning Briefing */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-10 text-white shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold">Morning Briefing</h3>
                <Lightbulb className="w-10 h-10 text-yellow-300 opacity-80" />
              </div>

              {overview?.daily_summary?.summary_text ? (
                <div
                  className="prose prose-invert max-w-none text-white/95 text-lg leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: safeContent(overview.daily_summary.summary_text) }}
                />
              ) : (
                <div className="text-white/90 text-lg">
                  <p>Your AI is quietly learning from everything you do.</p>
                  <p className="mt-4 font-medium">Your personalized briefing arrives tonight</p>
                </div>
              )}
            </div>

            {/* Today at a Glance */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Today at a Glance</h3>
              <div className="space-y-4">
                {todayReminders.length === 0 && overdueTodos.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
                    <p className="text-xl font-medium">All clear — enjoy your day!</p>
                  </div>
                ) : (
                  <>
                    {todayReminders.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-5 bg-amber-50 rounded-2xl border border-amber-200">
                        <div className="flex items-center gap-4">
                          <Clock className="w-6 h-6 text-amber-700" />
                          <div>
                            <p className="font-semibold text-gray-900">{r.text}</p>
                            <p className="text-sm text-amber-700">{format(new Date(r.remind_at), "h:mm a")}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-amber-600" />
                      </div>
                    ))}

                    {overdueTodos.slice(0, 4).map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-5 bg-red-50 rounded-2xl border-2 border-red-200">
                        <div className="flex items-center gap-4">
                          <AlertCircle className="w-6 h-6 text-red-600" />
                          <p className="font-semibold text-gray-900">{t.task}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-red-600" />
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Recent Memories */}
            {recentTwoNotes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Recent Memories</h3>
                  <button
                    onClick={() => router.push("/dashboard/notes")}
                    className="text-emerald-600 font-medium hover:underline flex items-center gap-2"
                  >
                    View all <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {recentTwoNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => router.push(`/dashboard/notes/${note.id}`)}
                      className="bg-white p-7 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:border-emerald-300 transition cursor-pointer group"
                    >
                      <p className="text-gray-800 leading-relaxed line-clamp-4 group-hover:line-clamp-none transition">
                        {note.content}
                      </p>
                      <p className="text-sm text-gray-500 mt-5">
                        {format(new Date(note.created_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Stats */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Your Second Brain</h3>
              <div className="grid grid-cols-2 gap-8">
                {[
                  { icon: FileText, label: "Notes", value: notes.length },
                  { icon: Clock, label: "Reminders", value: overview?.stats.total_reminders || 0 },
                  { icon: CheckCircle2, label: "Completed", value: overview?.stats.completed_todos || 0 },
                  { icon: Sparkles, label: "Summaries", value: overview?.has_summary ? 1 : 0 },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="text-center">
                    <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-3xl flex items-center justify-center mb-4">
                    <Icon className="w-10 h-10 text-emerald-600" />
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900">{value}+</p>
                    <p className="text-sm text-gray-600 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Suggestion */}
            {(overdueTodos.length > 0 || todayReminders.length > 0) && (
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-8 border-2 border-red-200 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <Lightbulb className="w-10 h-10 text-red-600" />
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">Smart Suggestion</h4>
                    <p className="text-red-700">Don’t fall behind</p>
                  </div>
                </div>
                <p className="text-gray-800 mb-8">
                  {overdueTodos.length > 0
                    ? `You have ${overdueTodos.length} overdue task${overdueTodos.length > 1 ? "s" : ""}`
                    : "You have tasks due today"}
                </p>
                <button
                  onClick={() => router.push("/dashboard/todos")}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition shadow-lg"
                >
                  Tackle Them Now
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}