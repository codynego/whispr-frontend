"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Brain, Search, Settings, Clock, CheckCircle2, Calendar, Sparkles,
  FileText, Lightbulb, AlertCircle, 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface DailySummary {
  id: number;
  summary_date: string;
  content: string;
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
  created_at: string;
}

interface Todo {
  id: number;
  task: string;
  done: boolean;
  created_at: string;
}

interface OverviewData {
  has_summary: boolean;
  daily_summary: DailySummary | null;
  stats: {
    total_reminders: number;
    completed_todos: number;
  };
  recent_notes: Note[];
}

export default function WhisoneDashboard() {
  const { user, accessToken } = useAuth();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), "EEEE, MMMM d");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Fetch all real data
  useEffect(() => {
    if (!accessToken) return;

    const fetchAll = async () => {
      try {
        const [overviewRes, notesRes, remindersRes, todosRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/overview/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/todos/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        ]);

        if (overviewRes.ok) setOverview(await overviewRes.json());
        if (notesRes.ok) setNotes((await notesRes.json()).slice(0, 6));
        if (remindersRes.ok) setReminders(await remindersRes.json());
        if (todosRes.ok) setTodos(await todosRes.json());
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [accessToken]);

  // Derive today’s reminders & overdue todos
  const todayReminders = reminders
    .filter(r => !r.completed && new Date(r.remind_at).toDateString() === new Date().toDateString());

  const overdueTodos = todos.filter(t => !t.done && new Date(t.created_at) < new Date(Date.now() - 86400000));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-emerald-600 animate-pulse mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading your second brain...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Whisone</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button className="flex items-center gap-3 px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
              <Search className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Search your memory...</span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-xl"><Settings className="w-6 h-6" /></button>
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.first_name?.[0] || "U"}
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-8">
        {/* Greeting */}
        <section className="mb-10 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {greeting}, {user?.first_name || "there"}
          </h2>
          <p className="text-lg text-gray-600">
            You have <strong>{todayReminders.length} reminder{todayReminders.length !== 1 && "s"}</strong> today
            {overdueTodos.length > 0 && <> and <strong className="text-red-600">{overdueTodos.length} overdue</strong></>}
          </p>
        </section>

        {/* Quick Actions */}
        <section className="mb-10 overflow-x-auto md:overflow-visible">
          <div className="flex gap-5 pb-4 md:pb-0 md:justify-center">
            {[
              { label: "Create Note", icon: FileText, color: "emerald" },
              { label: "Add Reminder", icon: Clock, color: "amber" },
              { label: "New Todo", icon: CheckCircle2, color: "blue" },
              { label: "Add Event", icon: Calendar, color: "purple" },
              { label: "Ask Whisone", icon: Sparkles, color: "pink" },
            ].map((a) => (
              <button key={a.label} className="flex flex-col items-center gap-3 min-w-[120px] p-6 bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-transparent hover:border-emerald-300 transition-all hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl bg-${a.color}-100 flex items-center justify-center`}>
                  <a.icon className={`w-8 h-8 text-${a.color}-600`} />
                </div>
                <span className="text-sm font-medium text-gray-800">{a.label}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Daily Summary + Today at a Glance + Recent Notes */}
          <div className="lg:col-span-2 space-y-8">
            {/* Daily Summary */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-6">Morning Briefing</h3>
              {overview?.daily_summary ? (
                <div className="prose prose-invert max-w-none text-lg leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: overview.daily_summary.content.replace(/\n/g, "<br />") }}
                />
              ) : (
                <p className="text-white/90 text-lg">Your AI is watching everything. Summary coming tonight.</p>
              )}
            </div>

            {/* Today at a Glance */}
            <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Today at a Glance</h3>
              <div className="space-y-4">
                {todayReminders.map(r => (
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
                {overdueTodos.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-center gap-4">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="font-medium text-gray-900">{t.task}</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 rounded text-emerald-600" />
                  </div>
                ))}
                {todayReminders.length === 0 && overdueTodos.length === 0 && (
                  <p className="text-gray-500 text-center py-8">All clear for today</p>
                )}
              </div>
            </div>

            {/* Recent Notes */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-5">Recent Memories</h3>
              <div className="grid md:grid-cols-2 gap-5">
                {notes.map(note => (
                  <div key={note.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
                    <p className="text-gray-900 text-sm leading-relaxed line-clamp-4">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-4">{format(new Date(note.created_at), "MMM d, h:mm a")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Stats + Smart Suggestion */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-5">Your Brain</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                  <FileText className="w-8 h-8 text-emerald-600 mb-3" />
                  <p className="text-2xl font-bold text-gray-900">{notes.length}+</p>
                  <p className="text-sm text-gray-600">Notes Saved</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                  <Clock className="w-8 h-8 text-amber-600 mb-3" />
                  <p className="text-2xl font-bold text-gray-900">{overview?.stats.total_reminders || 0}</p>
                  <p className="text-sm text-gray-600">Active Reminders</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-3" />
                  <p className="text-2xl font-bold text-gray-900">{overview?.stats.completed_todos || 0}</p>
                  <p className="text-sm text-gray-600">Todos Completed</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                  <Sparkles className="w-8 h-8 text-purple-600 mb-3" />
                  <p className="text-2xl font-bold text-gray-900">{overview?.has_summary ? 1 : 0}</p>
                  <p className="text-sm text-gray-600">Today’s Summary</p>
                </div>
              </div>
            </div>

            {(overdueTodos.length > 0 || todayReminders.length > 0) && (
              <div className="bg-red-50 rounded-3xl p-6 border-2 border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-7 h-7 text-red-600" />
                  <h4 className="text-lg font-bold text-gray-900">Smart Suggestion</h4>
                </div>
                <p className="text-gray-800 mb-4">
                  You have {overdueTodos.length > 0 ? "overdue tasks" : "tasks due today"}. Want to clear them now?
                </p>
                <button className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition font-medium">
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
