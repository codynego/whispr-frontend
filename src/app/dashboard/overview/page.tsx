"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, MessageCircle, Zap, Clock, TrendingUp, TrendingDown, CheckCircle, Eye, Settings, Sparkles, Mail, MessageSquare, FileText, User, Brain } from "lucide-react";
import Chart from "chart.js/auto";
import { useAuth } from "@/context/AuthContext";

interface Summary {
  greeting: string;
  summary_text: string;
  suggestions: string[];
}

interface ChannelBreakdown {
  email: number;
  whatsapp: number;
}

interface Stats {
  total_messages: number;
  unread_messages: number;
  important_emails: number;
  channel_breakdown: ChannelBreakdown;
}

interface Task {
  id: number;
  task_type: string;
  status: string;
  input_text: string;
  due_datetime: string | null;
  is_completed: boolean;
  created_at: string;
}

interface Performance {
  response_time_avg: string;
  ai_replies_sent: number;
  important_threads: number;
  missed_messages: number;
  trend: string;
}

interface DashboardData {
  summary: Summary;
  stats: Stats;
  tasks: Task[];
  performance: Performance;
}

export default function OverviewPage() {
  const { accessToken } = useAuth();
  const [userName] = useState("Abednego");
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric'
});


  const lineChartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/unified/dashboard/overview/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.status === 401) {
          console.error("Unauthorized");
          return;
        }

        const fetchedData = await res.json();
        setData(fetchedData as DashboardData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  useEffect(() => {
    const lineCtx = document.getElementById("miniChart") as HTMLCanvasElement;
    if (lineCtx) {
      if (lineChartRef.current) {
        lineChartRef.current.destroy();
      }
      lineChartRef.current = new Chart(lineCtx, {
        type: "line",
        data: {
          labels: ["8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM"],
          datasets: [{
            label: "Messages",
            data: [5, 12, 8, 15, 10, 18, 14],
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { 
            x: { display: false },
            y: { display: false },
          },
        },
      });
    }

    return () => {
      if (lineChartRef.current) {
        lineChartRef.current.destroy();
        lineChartRef.current = null;
      }
    };
  }, [isCompactMode, loading]);

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">Loading...</div>;
  }

  if (!data) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">Error loading data</div>;
  }

  const { summary, stats, tasks, performance } = data;

  const aiSummary = summary.summary_text;

  const inboxInsights = {
    total: stats.total_messages,
    unread: stats.unread_messages,
    prioritized: stats.important_emails,
    responseTime: `${performance.trend} faster than yesterday`,
    channels: {
      email: stats.total_messages > 0 ? Math.round((stats.channel_breakdown.email / stats.total_messages) * 100) : 0,
      whatsapp: stats.total_messages > 0 ? Math.round((stats.channel_breakdown.whatsapp / stats.total_messages) * 100) : 0,
      others: 100 - (stats.total_messages > 0 ? Math.round((stats.channel_breakdown.email / stats.total_messages) * 100) : 0) - (stats.total_messages > 0 ? Math.round((stats.channel_breakdown.whatsapp / stats.total_messages) * 100) : 0),
    },
  };

  const focusSuggestions = summary.suggestions[0] || "You’ve got important threads that require fast replies. Should I bring them up first?";

  const aiToDos = tasks
    .filter((t: Task) => !t.is_completed)
    .slice(0, 3)
    .map((t: Task) => ({
      task: t.input_text,
      icon: t.task_type === 'reply' ? MessageCircle : t.task_type === 'summarize' ? FileText : CheckCircle,
    }));

  const aiSuggestions = summary.suggestions.slice(1);

  const performanceMetrics = [
    { metric: "Avg Response Time", today: performance.response_time_avg, trend: "↓ Faster" },
    { metric: "Important Threads", today: performance.important_threads, trend: "↑" },
    { metric: "AI Helped Replies", today: performance.ai_replies_sent, trend: "+3" },
    { metric: "Missed Messages", today: performance.missed_messages, trend: "👍" },
  ];

  const aiComment = `Great consistency today, ${userName} — you’ve replied well. Trend: ${performance.trend}`;

  const compactStats = {
    totalMessages: stats.total_messages,
    unread: stats.unread_messages,
    urgent: stats.important_emails,
    tasksPending: tasks.filter((t: Task) => !t.is_completed).length,
    tasksCompleted: tasks.filter((t: Task) => t.is_completed).length,
    trend: performance.trend,
  };

  if (isCompactMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Compact Mode Header */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Whisone Dashboard — {currentDate}</h1>
          <button
            onClick={() => setIsCompactMode(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Assistant Mode
          </button>
        </div>

        {/* Compact Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-900">{compactStats.totalMessages}</p>
            <p className="text-sm text-gray-600">Total Messages Today</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-900">{compactStats.unread}</p>
            <p className="text-sm text-gray-600">Unread</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
            <p className="text-2xl font-bold text-red-600">{compactStats.urgent}</p>
            <p className="text-sm text-gray-600">Urgent</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-900">{compactStats.tasksCompleted}</p>
            <p className="text-sm text-gray-600">Tasks Completed</p>
          </div>
        </section>

        {/* Compact Summary */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Inbox Summary</h2>
          <p className="text-gray-700 mb-4">{stats.total_messages} new messages, {stats.unread_messages} unread, {stats.important_emails} urgent</p>
          <p className="text-gray-700 mb-4">Tasks: {compactStats.tasksPending} pending | {compactStats.tasksCompleted} completed</p>
          <p className="text-green-600 font-medium">Trend: {compactStats.trend}</p>
          <div className="h-32 mt-4">
            <canvas id="miniChart"></canvas>
          </div>
        </section>
      </div>
    );
  }

  // Assistant Mode (default full layout)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Assistant Mode Header */}
      <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-sm border border-white/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-600" />
              AI Summary — {currentDate}
            </h1>
            <button
              onClick={() => setIsCompactMode(true)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
            >
              Compact Mode
            </button>
          </div>
          <p className="text-lg text-gray-700 mb-4 leading-relaxed">{summary.greeting}</p>
          <p className="text-lg text-gray-700 mb-4 leading-relaxed">{aiSummary}</p>
          <div className="flex gap-2 mb-6">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-1">
              <Eye className="w-4 h-4" />
              Review Drafts
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Mark Done
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors">
              Ignore
            </button>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>Replies ↑</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span>Time ↓</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <span>Conversations</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Middle Section — Inbox Insights & Focus */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inbox Insights */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Inbox Insights
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Total Messages Today:</span> {inboxInsights.total}</p>
                  <p><span className="font-semibold">Unread:</span> {inboxInsights.unread}</p>
                  <p><span className="font-semibold">AI Prioritized:</span> {inboxInsights.prioritized}</p>
                  <p><span className="font-semibold">Response Time:</span> <span className="text-green-600">{inboxInsights.responseTime}</span></p>
                </div>
                <div className="mt-4 space-y-1 text-xs">
                  <p><span className="font-semibold">Top Channels:</span></p>
                  <p>Email {inboxInsights.channels.email}%</p>
                  <p>WhatsApp {inboxInsights.channels.whatsapp}%</p>
                  <p>Others {inboxInsights.channels.others}%</p>
                </div>
              </div>
              <div className="h-48">
                <canvas id="miniChart"></canvas>
              </div>
            </div>
          </section>

          {/* Focus Mode */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Focus Mode
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">{focusSuggestions}</p>
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1">
                <MessageSquare className="w-4 h-4" />
                Open Priority Threads
              </button>
              <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4" />
                Let AI Handle Follow-ups
              </button>
            </div>
          </section>
        </div>

        {/* Right Panel — Tasks & Smart Actions */}
        <section className="lg:col-span-1 space-y-6">
          {/* AI To-Dos */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI To-Dos</h3>
            <div className="space-y-3">
              {aiToDos.map((todo, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <todo.icon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{todo.task}</p>
                    <div className="flex gap-2 mt-2">
                      <button className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors">
                        <CheckCircle className="w-3 h-3 inline" /> Done
                      </button>
                      <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors">
                        <Eye className="w-3 h-3 inline" /> View
                      </button>
                      <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">
                        <Settings className="w-3 h-3 inline" /> Delegate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Suggestions</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {aiSuggestions.map((suggestion, i) => (
                <li key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <User className="w-3 h-3 text-blue-600" />
                  {suggestion}
                </li>
              ))}
            </ul>
            <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4" />
              Generate Today’s Summary
            </button>
          </div>
        </section>
      </div>

      {/* Bottom Section — Performance & Mood */}
      <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance & Mood</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3">Metric</th>
                <th className="text-left py-3">Today</th>
                <th className="text-left py-3">Trend</th>
              </tr>
            </thead>
            <tbody>
              {performanceMetrics.map((metric, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-3">{metric.metric}</td>
                  <td className="py-3 font-semibold">{metric.today}</td>
                  <td className="py-3">
                    <span className={`flex items-center gap-1 ${metric.trend.includes("↓") || metric.trend === "👍" ? "text-green-600" : "text-blue-600"}`}>
                      {metric.trend.includes("↓") && <TrendingDown className="w-4 h-4" />}
                      {metric.trend.includes("↑") && <TrendingUp className="w-4 h-4" />}
                      {metric.trend === "👍" && <CheckCircle className="w-4 h-4" />}
                      {metric.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-gray-700 italic text-center">{aiComment}</p>
      </section>
    </div>
  );
}