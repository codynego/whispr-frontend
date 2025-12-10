"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Brain, Search, Settings, Clock, CheckCircle2, Calendar,
  FileText, Lightbulb, AlertCircle, Sparkles, ChevronRight,
  TrendingUp, Target, Zap, ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Interface definitions (kept for completeness)
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
  // All hook calls must be at the top level
  const { user, loading: authLoading } = useAuth();  
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  // This state handles the data fetching for the dashboard itself
  const [loading, setLoading] = useState(true);  
  // Variables derived from Date (safe to define here)
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toDateString(); 
  // Effect to load dashboard data
  useEffect(() => {
    // If Auth is still loading OR if no user is found after loading, we stop here.
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    } 
    const load = async () => {
      setLoading(true); // Ensure loading is true when fetching starts
      try {
        // You may want to use the axios instance from AuthContext instead of fetch
        const base = process.env.NEXT_PUBLIC_API_URL + "/whisone"; 
        const [ovRes, notesRes, remRes, todoRes] = await Promise.all([
          fetch(`${base}/overview/`, { credentials: "include" }),
          fetch(`${base}/notes/?ordering=-created_at&limit=6`, { credentials: "include" }),
          fetch(`${base}/reminders/`, { credentials: "include" }),
          fetch(`${base}/todos/`, { credentials: "include" }),
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
  }, [user, authLoading]); // Dependencies 
  // Search handlers (safe to define here)
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  }; 
  // --- ERROR FIX IMPLEMENTATION START ---
  // Check 1: Display loading spinner while Auth or Dashboard data is loading.
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Brain className="w-14 h-14 text-emerald-600" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-emerald-500 animate-bounce" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">Waking up your second brain</p>
          <p className="text-gray-600">Just a moment...</p>
        </div>
      </div>
    );
  } 


  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-xl text-gray-600">Please log in to access your dashboard</p>
        </div>
      </div>
    );
  }

    // FIX: ONLY calculate derived state AFTER ALL loading checks are passed.
  const todayReminders = reminders.filter(r => !r.completed && new Date(r.remind_at).toDateString() === today);
  const overdueTodos = todos.filter(t => !t.done);
  const recentTwoNotes = notes.slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="w-full">

        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-gray-200/50 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Whisone</h1>
              </div>

              <div className="flex items-center gap-3 min-w-0">
                {/* Desktop Search */}
                <div className="hidden md:flex items-center bg-gray-100 rounded-2xl px-4 py-2.5 w-full max-w-sm">
                  <Search className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    placeholder="Search your memory..."
                    className="bg-transparent outline-none flex-1 text-gray-800 placeholder-gray-500 text-sm min-w-0"
                  />
                </div>

                {/* Mobile Search */}
                <button
                  onClick={() => router.push("/dashboard/search")}
                  className="md:hidden p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex-shrink-0"
                >
                  <Search className="w-5 h-5 text-gray-600" />
                </button>

                <button
                onClick={() => router.push("/dashboard/settings")}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0">
                  <Settings className="w-5 h-5 text-gray-700" />
                </button>

                <div
                onClick={() => router.push("/dashboard/profile")}
                className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                  {user?.first_name?.[0]?.toUpperCase() || "U"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-10">

          {/* Hero Section */}
          <section className="w-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/5" />
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-yellow-300 flex-shrink-0" />
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                  {format(new Date(), "EEEE, MMMM d")}
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 break-words">
                {greeting}, {user?.first_name || "friend"}
              </h2>

              <p className="text-xl text-white/90 mb-8 max-w-4xl break-words">
                {todayReminders.length > 0 && overdueTodos.length > 0 ? (
                  <>You have <strong>{todayReminders.length}</strong> reminder{todayReminders.length !== 1 && "s"} and <strong>{overdueTodos.length}</strong> task{overdueTodos.length !== 1 && "s"} today</>
                ) : todayReminders.length > 0 ? (
                  <>You have <strong>{todayReminders.length}</strong> reminder{todayReminders.length !== 1 && "s"} today</>
                ) : overdueTodos.length > 0 ? (
                  <><strong>{overdueTodos.length}</strong> task{overdueTodos.length !== 1 && "s"} need your attention</>
                ) : (
                  "You're all caught up! Enjoy your productive day"
                )}
              </p>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5">
                  <FileText className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">{notes.length} Notes</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">{overview?.stats.completed_todos || 0} Completed</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5">
                  <TrendingUp className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">On Track</span>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="w-full">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
              <Zap className="w-6 h-6 text-emerald-500" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: "New Note", icon: FileText, path: "/dashboard/notes", color: "from-blue-500 to-blue-600" },
                { label: "Add Reminder", icon: Clock, path: "/dashboard/reminders", color: "from-amber-500 to-orange-600" },
                { label: "Create Todo", icon: CheckCircle2, path: "/dashboard/todos", color: "from-green-500 to-emerald-600" },
                { label: "Schedule Event", icon: Calendar, path: "/dashboard/calendar", color: "from-purple-500 to-violet-600" },
                { label: "Ask Whisone", icon: Sparkles, path: "/dashboard/assistant", color: "from-pink-500 to-rose-600", highlight: true },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => router.push(action.path)}
                  className="group relative bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm text-center break-words">{action.label}</p>
                  {action.highlight && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8 w-full">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Daily Briefing */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Lightbulb className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Daily Briefing</h3>
                        <p className="text-white/80 text-sm">Your personalized insights</p>
                      </div>
                    </div>
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                  </div>
                </div>

                <div className="p-6">
                  {overview?.daily_summary?.summary_text ? (
                    <div
                      className="prose prose-gray max-w-none text-gray-700 leading-relaxed text-base break-words"
                      dangerouslySetInnerHTML={{ __html: safeContent(overview.daily_summary.summary_text) }}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Brain className="w-9 h-9 text-emerald-600" />
                      </div>
                      <p className="text-gray-900 font-semibold mb-2">Learning your patterns</p>
                      <p className="text-gray-600 text-sm">Your AI briefing will be ready tonight</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Today at a Glance */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Today at a Glance</h3>
                  <Target className="w-6 h-6 text-emerald-500" />
                </div>

                {todayReminders.length === 0 && overdueTodos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <p className="text-xl font-semibold text-gray-900 mb-2">All clear!</p>
                    <p className="text-gray-600">No tasks or reminders for today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayReminders.map((r) => (
                      <div key={r.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 break-words">{r.text}</p>
                          <p className="text-sm text-amber-700">{format(new Date(r.remind_at), "h:mm a")}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                    ))}

                    {overdueTodos.slice(0, 4).map((t) => (
                      <div key={t.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 break-words">{t.task}</p>
                          <p className="text-sm text-red-700">Overdue</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Memories */}
              {recentTwoNotes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                    <h3 className="text-xl font-bold text-gray-900">Recent Memories</h3>
                    <button
                      onClick={() => router.push("/dashboard/notes")}
                      className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm group"
                    >
                      View all
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {recentTwoNotes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => router.push(`/dashboard/notes/${note.id}`)}
                        className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-emerald-600" />
                          </div>
                          <p className="text-gray-800 text-sm leading-relaxed line-clamp-3 flex-1 break-words">
                            {note.content}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{format(new Date(note.created_at), "MMM d, h:mm a")}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Your Progress</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: FileText, label: "Notes", value: notes.length, color: "from-blue-500 to-blue-600" },
                    { icon: Clock, label: "Reminders", value: overview?.stats.total_reminders || 0, color: "from-amber-500 to-orange-600" },
                    { icon: CheckCircle2, label: "Done", value: overview?.stats.completed_todos || 0, color: "from-green-500 to-emerald-600" },
                    { icon: Sparkles, label: "Insights", value: overview?.has_summary ? 1 : 0, color: "from-purple-500 to-violet-600" },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="text-center">
                      <div className={`w-14 h-14 mx-auto bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-3 shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{value}</p>
                      <p className="text-xs text-gray-600 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Needed */}
              {(overdueTodos.length > 0 || todayReminders.length > 0) && (
                <div className="bg-gradient-to-br from-red-500 via-pink-500 to-rose-600 rounded-3xl p-6 shadow-xl text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">Action Needed</h4>
                      <p className="text-white/80 text-xs">Don't fall behind</p>
                    </div>
                  </div>
                  <p className="mb-4 text-sm">
                    {overdueTodos.length > 0
                      ? `${overdueTodos.length} task${overdueTodos.length > 1 ? "s" : ""} waiting`
                      : `${todayReminders.length} reminder${todayReminders.length > 1 ? "s" : ""} today`}
                  </p>
                  <button
                    onClick={() => router.push("/dashboard/todos")}
                    className="w-full bg-white hover:bg-gray-50 text-red-600 font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group"
                  >
                    Take Action
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {/* Motivation */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 shadow-xl text-white">
                <Sparkles className="w-8 h-8 mb-3" />
                <h4 className="text-lg font-bold mb-2">Keep Growing</h4>
                <p className="text-white/90 text-sm leading-relaxed">
                  Your second brain is learning from every note, task, and reminder. Keep feeding it!
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}