"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Brain, Settings, BarChart3, Loader2, Lock, Globe, AlertTriangle,
  Sparkles, Database, Trash2, Play, RefreshCw, CheckCircle2, Clock,
  FileText, Bell, CheckSquare
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Tab = "training" | "settings" | "analytics";

interface AvatarSettings {
  is_public: boolean;
  disclaimer_text?: string;
  response_delay_ms?: number;
  enable_owner_takeover?: boolean;
}

interface AvatarAnalytics {
  visitors_count: number;
  total_conversations: number;
  total_messages: number;
  average_response_time_ms: number;
}

interface AvatarSource {
  id: string;
  source_type: "note" | "reminder" | "todo" | "document" | "chat";
  metadata: { id: number; title?: string; content?: string };
  include_for_tone: boolean;
  include_for_knowledge: boolean;
}

interface FullAvatarData {
  id: string;
  name: string;
  handle: string;
  photo: string | null;
  trained: boolean;
  trained_at: string | null;
  last_training_job_id: string | null;
  settings: AvatarSettings;
  analytics: AvatarAnalytics;
}

export default function AvatarConfigurationPage({ params }: { params: { handle: string } }) {
  const { accessToken } = useAuth();
  const avatarHandle = params.handle;

  const [avatar, setAvatar] = useState<FullAvatarData | null>(null);
  const [sources, setSources] = useState<AvatarSource[]>([]);
  const [trainingJobId, setTrainingJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<"pending" | "running" | "completed" | "failed" | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("training");

  // Fetch Avatar + Settings + Analytics
  const fetchAvatar = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error();
      const data: FullAvatarData = await res.json();
      setAvatar(data);
      setTrainingJobId(data.last_training_job_id);
    } catch (err) {
      console.error("Failed to load avatar");
    } finally {
      setLoading(false);
    }
  }, [accessToken, avatarHandle]);

  // Fetch Training Sources (Notes, Reminders, Todos)
  const fetchSources = useCallback(async () => {
    if (!accessToken) return;
    try {
      const [notesRes, remindersRes, todosRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/todos/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
      ]);

      const notes = (await notesRes.json()).results || [];
      const reminders = (await remindersRes.json()).results || [];
      const todos = (await todosRes.json()).results || [];

      const mapped: AvatarSource[] = [
        ...notes.map((n: any) => ({
          id: `note-${n.id}`,
          source_type: "note" as const,
          metadata: { id: n.id, title: n.title || "Untitled Note", content: n.content },
          include_for_tone: true,
          include_for_knowledge: true,
        })),
        ...reminders.map((r: any) => ({
          id: `reminder-${r.id}`,
          source_type: "reminder" as const,
          metadata: { id: r.id, title: r.text, content: r.text },
          include_for_tone: true,
          include_for_knowledge: false,
        })),
        ...todos.map((t: any) => ({
          id: `todo-${t.id}`,
          source_type: "todo" as const,
          metadata: { id: t.id, title: t.task, content: t.task },
          include_for_tone: true,
          include_for_knowledge: false,
        })),
      ];

      setSources(mapped);
    } catch (err) {
      console.error("Failed to load sources");
    }
  }, [accessToken]);

  // Poll Training Job Status
  const pollJobStatus = useCallback(async (jobId: string) => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/training-jobs/${jobId}/status/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setJobStatus(data.status);

      if (data.status === "completed" || data.status === "failed") {
        setTrainingJobId(null);
        fetchAvatar();
      }
    } catch (err) {
      console.error("Job poll failed");
    }
  }, [accessToken, fetchAvatar]);

  useEffect(() => {
    fetchAvatar();
    fetchSources();
  }, [fetchAvatar, fetchSources]);

  useEffect(() => {
    if (trainingJobId) {
      setJobStatus("running");
      const interval = setInterval(() => pollJobStatus(trainingJobId), 4000);
      return () => clearInterval(interval);
    }
  }, [trainingJobId, pollJobStatus]);

  // Save Settings
  const saveSettings = async () => {
    if (!avatar || !accessToken) return;
    setSaving(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/settings/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          is_public: avatar.settings.is_public,
          // Add more fields as needed
        }),
      });
    } catch (err) {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Start Training
  const startTraining = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/train/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          sources: sources
            .filter(s => s.include_for_knowledge || s.include_for_tone)
            .map(s => ({
              source_type: s.source_type,
              source_id: s.metadata.id,
              include_for_tone: s.include_for_tone,
              include_for_knowledge: s.include_for_knowledge,
            })),
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTrainingJobId(data.job_id);
    } catch (err) {
      alert("Failed to start training");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">Loading avatar...</p>
        </div>
      </div>
    );
  }

  if (!avatar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Avatar Not Found</h2>
          <p className="text-gray-600">@{avatarHandle}</p>
        </div>
      </div>
    );
  }

  const isPublic = avatar.settings?.is_public ?? false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">

        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 border-2 border-emerald-100">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <div className={`absolute -bottom-2 -right-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${isPublic ? "bg-emerald-500 text-white" : "bg-gray-700 text-white"}`}>
                {isPublic ? <Globe className="w-3 h-3 inline mr-1" /> : <Lock className="w-3 h-3 inline mr-1" />}
                {isPublic ? "Public" : "Private"}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{avatar.name}</h1>
              <div className="flex items-center gap-3">
                <span className="text-lg text-gray-500">@{avatar.handle}</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">AI Avatar</span>
              </div>
            </div>

            <div className="hidden md:flex flex-col gap-2">
              {[{ id: "training", icon: Brain, label: "Training" }, { id: "settings", icon: Settings, label: "Settings" }, { id: "analytics", icon: BarChart3, label: "Analytics" }].map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => setActiveTab(id as Tab)} className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === id ? "bg-emerald-500 text-white shadow-lg scale-105" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  <Icon className="w-5 h-5" /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:hidden mt-6 grid grid-cols-3 gap-2">
            {[{ id: "training", icon: Brain }, { id: "settings", icon: Settings }, { id: "analytics", icon: BarChart3 }].map(({ id, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id as Tab)} className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl text-xs font-semibold transition-all ${activeTab === id ? "bg-emerald-500 text-white shadow-md" : "bg-gray-100 text-gray-600"}`}>
                <Icon className="w-5 h-5" /> {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* TRAINING TAB */}
        {activeTab === "training" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Database className="w-7 h-7" />
                    <h2 className="text-2xl font-bold">Training Data Sources</h2>
                  </div>
                  <p className="text-emerald-50">Select what your AI learns from</p>
                </div>
                <div className="p-6 space-y-4">
                  {sources.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No data sources available</p>
                  ) : (
                    sources.map((source) => {
                      const Icon = source.source_type === "note" ? FileText : source.source_type === "reminder" ? Bell : CheckSquare;
                      return (
                        <div key={source.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <Icon className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{source.metadata.title || "Untitled"}</p>
                              <p className="text-xs text-gray-500 capitalize">{source.source_type}</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={source.include_for_knowledge} onChange={(e) => {
                                setSources(s => s.map(s2 => s2.id === source.id ? { ...s2, include_for_knowledge: e.target.checked } : s2));
                              }} className="w-4 h-4 text-emerald-600 rounded" />
                              <span className="text-xs text-gray-600">Knowledge</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={source.include_for_tone} onChange={(e) => {
                                setSources(s => s.map(s2 => s2.id === source.id ? { ...s2, include_for_tone: e.target.checked } : s2));
                              }} className="w-4 h-4 text-emerald-600 rounded" />
                              <span className="text-xs text-gray-600">Tone</span>
                            </label>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <button onClick={startTraining} disabled={trainingJobId !== null} className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                    <Play className="w-5 h-5" />
                    {trainingJobId ? "Training in Progress..." : "Start Training"}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <RefreshCw className={`w-6 h-6 ${trainingJobId ? 'text-emerald-500 animate-spin' : 'text-gray-400'}`} />
                  <h3 className="text-lg font-bold text-gray-900">Training Status</h3>
                </div>
                {trainingJobId ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-xl text-center">
                      <Clock className="w-8 h-8 text-emerald-600 animate-pulse mx-auto mb-2" />
                      <p className="font-semibold text-emerald-900">Training in Progress</p>
                      <p className="text-xs text-emerald-600">Job: {trainingJobId.slice(0, 8)}...</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Ready to train</p>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-2 border-red-200 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
                    <p className="text-xs text-red-600">Irreversible action</p>
                  </div>
                </div>
                <p className="text-sm text-red-800 mb-4">Permanently delete this avatar and all data.</p>
                <button className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Avatar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-8">
              <Settings className="w-7 h-7 text-emerald-600" />
              <h2 className="text-2xl font-bold text-gray-900">Avatar Settings</h2>
            </div>

            <div className="space-y-8 max-w-2xl">
              <div className="p-6 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Public Access</h3>
                    <p className="text-sm text-gray-600">Allow others to chat with your avatar</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setAvatar(a => a ? { ...a, settings: { ...a.settings, is_public: e.target.checked } } : null)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Avatar Name</label>
                <input
                  type="text"
                  value={avatar.name}
                  onChange={(e) => setAvatar(a => a ? { ...a, name: e.target.value } : null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button onClick={saveSettings} disabled={saving} className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition shadow-md disabled:opacity-50">
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-8">
              <BarChart3 className="w-7 h-7 text-emerald-600" />
              <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <p className="text-sm text-emerald-700 font-medium mb-1">Total Interactions</p>
                <p className="text-3xl font-bold text-emerald-900">{avatar.analytics?.total_messages || 0}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700 font-medium mb-1">Conversations</p>
                <p className="text-3xl font-bold text-blue-900">{avatar.analytics?.total_conversations || 0}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <p className="text-sm text-purple-700 font-medium mb-1">Avg Response Time</p>
                <p className="text-3xl font-bold text-purple-900">{(avatar.analytics?.average_response_time_ms || 0) / 1000}s</p>
              </div>
            </div>

            <div className="h-80 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
              <p className="text-gray-400 text-lg">Detailed charts coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}