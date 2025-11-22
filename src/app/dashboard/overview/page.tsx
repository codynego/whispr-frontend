"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Brain, Search, Settings, Clock, CheckCircle2, Calendar,
  FileText, Lightbulb, AlertCircle, ChevronRight, Sparkles
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// === Types from your real backend ===
interface DailySummary {
  id: number;
  content: string;
  summary_date: string;
}

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

interface OverviewResponse {
  has_summary: boolean;
  daily_summary: DailySummary | null;
  stats: { total_reminders: number; completed_todos: number };
  recent_notes: Note[];
}

// === Safe array extractor (handles both paginated and plain responses) ===
const getResults = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
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

  // === Load all data safely ===
  useEffect(() => {
    if (!accessToken) return;

    const load = async () => {
      try {
        const [ovRes, notesRes, remRes, todoRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/overview/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/?ordering=-created_at&limit=6`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/todos/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        if (ovRes.ok) setOverview(await ovRes.json());

        if (notesRes.ok) {
          const data = await notesRes.json();
          setNotes(getResults(data));
        }

        if (remRes.ok) {
          const data = await remRes.json();
          setReminders(getResults(data));
        }

        if (todoRes.ok) {
          const data = await todoRes.json();
          setTodos(getResults(data));
        }
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [accessToken]);

  // === Safe calculations (never crashes) ===
  const todayReminders = reminders.filter(
    (r) => !r.completed && new Date(r.remind_at).toDateString() === today
  );

  const overdueTodos = todos.filter((t) => !t.done);

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
          <Brain className="w-16 h-16 text-emerald-600 animate-pulse mx-auto mb-6" />
          <p className="text-xl text-gray-700">Waking up your second brain...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* === Header === */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-emerald-600 rounded-2xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Whisone</h1>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-2xl px-5 py-3 w-96">
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
            <div className="w-11 h-11 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.first_name?.[0]?.toUpperCase() || "U"}
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* === Greeting === */}
        <section className="text-center lg:text-left">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            {greeting}, {user?.first_name || "there"}
          </h2>
          <p className="text-xl text-gray-600">
            You have{" "}
            <strong>
              {todayReminders.length} reminder{todayReminders.length !== 1 && "s"}
            </strong>{" "}
            today
            {overdueTodos.length > 0 && (
              <>
                {" and "}
                <strong className="text-red-600">
                  {overdueTodos.length} overdue task{overdueTodos.length !== 1 && "s"}
                </strong>
              </>
            )}
            .
          </p>
        </section>

        {/* === Quick Actions === */}
        <section>
          <div className="flex gap-8 overflow-x-auto pb-6 lg:pb-0 lg:justify-center scrollbar-hide">
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
                className="flex flex-col items-center gap-4 min-w-[160px] p-10 bg-white rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 hover:border-emerald-400 transition-all hover:-translate-y-3"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center">
                  <action.icon className="w-12 h-12 text-emerald-600" />
                </div>
                <span className="text-lg font-semibold text-gray-800">{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* === Main Content === */}
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left: Summary + Today + Recent */}
          <div className="lg:col-span-2 space-y-10">
            {/* Morning Briefing */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-12 shadow-2xl">
              <h3 className="text-3xl font-bold mb-8">Morning Briefing</h3>
              {overview?.daily_summary ? (
                <div
                  className="prose prose-invert max-w-none text-lg leading-relaxed space-y-6"
                  dangerouslySetInnerHTML={{
                    __html: overview.daily_summary.content.replace(/\n/g, "<br />"),
                  }}
                />
              ) : (
                <p className="text-white/90 text-lg">
                  Your AI is quietly watching everything you say on WhatsApp.
                  <br />
                  Your personalized briefing arrives tonight.
                </p>
              )}
            </div>

            {/* Today at a Glance */}
            <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Today at a Glance</h3>
              <div className="space-y-6">
                {todayReminders.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-6 bg-amber-50 rounded-2xl border border-amber-200"
                  >
                    <div className="flex items-center gap-5">
                      <Clock className="w-7 h-7 text-amber-600" />
                      <div>
                        <p className="font-semibold text-gray-900">{r.text}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(r.remind_at), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {overdueTodos.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-6 bg-red-50 rounded-2xl border border-red-200"
                  >
                    <div className="flex items-center gap-5">
                      <AlertCircle className="w-7 h-7 text-red-600" />
                      <p className="font-semibold text-gray-900">{t.task}</p>
                    </div>
                    <input type="checkbox" className="w-6 h-6 rounded text-emerald-600" />
                  </div>
                ))}

                {todayReminders.length === 0 && overdueTodos.length === 0 && (
                  <p className="text-center text-gray-500 py-12 text-lg">
                    All clear today — you’re crushing it
                  </p>
                )}
              </div>
            </div>

            {/* Recent Memories */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Recent Memories</h3>
              <div className="grid md:grid-cols-2 gap-8">
                {notes.length > 0 ? (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => router.push(`/dashboard/notes/${note.id}`)}
                      className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition cursor-pointer"
                    >
                      <p className="text-gray-800 leading-relaxed line-clamp-4">{note.content}</p>
                      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                        <span>{format(new Date(note.created_at), "MMM d, h:mm a")}</span>
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="col-span-2 text-center text-gray-500 py-12 text-lg">
                    No memories yet — just talk to me on WhatsApp
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Stats + Smart Suggestion */}
          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Your Second Brain</h3>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: FileText, label: "Notes Saved", value: notes.length + "+" },
                  { icon: Clock, label: "Active Reminders", value: overview?.stats.total_reminders || 0 },
                  { icon: CheckCircle2, label: "Todos Done", value: overview?.stats.completed_todos || 0 },
                  { icon: Sparkles, label: "Today's Summary", value: overview?.has_summary ? "1" : "0" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center">
                    <stat.icon className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                    <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600 mt-2">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {(overdueTodos.length > 0 || todayReminders.length > 0) && (
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-10 border-2 border-red-200">
                <div className="flex items-center gap-4 mb-6">
                  <Lightbulb className="w-10 h-10 text-red-600" />
                  <h4 className="text-2xl font-bold text-gray-900">Smart Suggestion</h4>
                </div>
                <p className="text-gray-800 text-lg mb-8">
                  You have{" "}
                  {overdueTodos.length > 0
                    ? `${overdueTodos.length} overdue task${overdueTodos.length > 1 ? "s" : ""}`
                    : "important tasks due today"}
                  .
                </p>
                <button
                  onClick={() => router.push("/dashboard/todos")}
                  className="w-full bg-red-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-red-700 transition"
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