"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Settings, BarChart3, Loader2, AlertTriangle,
  Database, Trash2, Play, RefreshCw, CheckCircle2, Clock,
  FileText, Bell, CheckSquare, ChevronDown, Plus
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

interface Note { id: number; title: string; content: string; }
interface Reminder { id: number; text: string; }
interface Todo { id: number; task: string; }

// Source item with tone/knowledge flags
interface SourceItem {
  id: number;
  title: string;
  content: string;
  include_for_knowledge: boolean;
  include_for_tone: boolean;
}

export default function AvatarConfigurationPage({ params }: { params: { handle: string } }) {
  const { accessToken } = useAuth();
  const avatarHandle = params.handle;

  const [avatar, setAvatar] = useState<FullAvatarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("training");
  const [saving, setSaving] = useState(false);

  // Sources grouped with toggle states
  const [notes, setNotes] = useState<SourceItem[]>([]);
  const [reminders, setReminders] = useState<SourceItem[]>([]);
  const [todos, setTodos] = useState<SourceItem[]>([]);
  const [manualText, setManualText] = useState("");

  // Training state
  const [trainingJobId, setTrainingJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<"pending" | "running" | "completed" | "failed" | null>(null);
  const [isSavingSources, setIsSavingSources] = useState(false);
  const currentJobIdRef = useRef<string | null>(null);

  useEffect(() => { currentJobIdRef.current = trainingJobId; }, [trainingJobId]);

  // Fetch Avatar
  const fetchAvatar = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error();
      const data: FullAvatarData = await res.json();
      setAvatar(data);
      if (data.last_training_job_id) {
        setTrainingJobId(data.last_training_job_id);
      } else {
        setTrainingJobId(null);
        setJobStatus(null);
      }
    } catch (err) {
      console.error("Failed to load avatar");
    } finally {
      setLoading(false);
    }
  }, [accessToken, avatarHandle]);

  // Fetch sources and map to SourceItem
  const fetchSources = useCallback(async () => {
    if (!accessToken) return;
    try {
      const [notesRes, remindersRes, todosRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/todos/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
      ]);

      const notesRaw = (await notesRes.json()).results || [];
      const remindersRaw = (await remindersRes.json()).results || [];
      const todosRaw = (await todosRes.json()).results || [];

      setNotes(notesRaw.map((n: Note) => ({
        id: n.id,
        title: n.title || "Untitled Note",
        content: n.content,
        include_for_knowledge: true,
        include_for_tone: true,
      })));

      setReminders(remindersRaw.map((r: Reminder) => ({
        id: r.id,
        title: r.text,
        content: r.text,
        include_for_knowledge: false,
        include_for_tone: true,
      })));

      setTodos(todosRaw.map((t: Todo) => ({
        id: t.id,
        title: t.task,
        content: t.task,
        include_for_knowledge: false,
        include_for_tone: true,
      })));
    } catch (err) {
      console.error("Failed to load sources");
    }
  }, [accessToken]);

  // Poll job status
  const pollJobStatus = useCallback(async () => {
    const jobId = currentJobIdRef.current;
    if (!jobId || !accessToken) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/training-jobs/${jobId}/status/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setJobStatus(data.status);

      if (data.status === "completed" || data.status === "failed") {
        setTrainingJobId(null);
        currentJobIdRef.current = null;
        setJobStatus(null);
        fetchAvatar();
      }
    } catch (err) {
      console.error("Polling failed", err);
      setTrainingJobId(null);
      currentJobIdRef.current = null;
      setJobStatus(null);
    }
  }, [accessToken, fetchAvatar]);

  useEffect(() => {
    if (!trainingJobId) {
      setJobStatus(null);
      return;
    }
    setJobStatus("running");
    const interval = setInterval(pollJobStatus, 5000);
    return () => clearInterval(interval);
  }, [trainingJobId, pollJobStatus]);

  useEffect(() => {
    fetchAvatar();
    fetchSources();
  }, [fetchAvatar, fetchSources]);

  // Save sources with tone/knowledge flags
  const saveSourcesAndTrain = async () => {
    if (!accessToken || !avatar) return;

    const selectedNotesItems = notes.filter(n => n.include_for_knowledge || n.include_for_tone);
    const selectedRemindersItems = reminders.filter(r => r.include_for_knowledge || r.include_for_tone);
    const selectedTodosItems = todos.filter(t => t.include_for_knowledge || t.include_for_tone);

    const hasSelection = selectedNotesItems.length > 0 || selectedRemindersItems.length > 0 || selectedTodosItems.length > 0 || manualText.trim() !== "";

    if (!hasSelection) {
      alert("Please select at least one source or add custom text.");
      return;
    }

    setIsSavingSources(true);
    try {
      const sourcesPayload = [
        ...selectedNotesItems.map(n => ({
          source_type: "note",
          metadata: { item_ids: [n.id] },
          include_for_knowledge: n.include_for_knowledge,
          include_for_tone: n.include_for_tone,
        })),
        ...selectedRemindersItems.map(r => ({
          source_type: "reminder",
          metadata: { item_ids: [r.id] },
          include_for_knowledge: r.include_for_knowledge,
          include_for_tone: r.include_for_tone,
        })),
        ...selectedTodosItems.map(t => ({
          source_type: "todo",
          metadata: { item_ids: [t.id] },
          include_for_knowledge: t.include_for_knowledge,
          include_for_tone: t.include_for_tone,
        })),
        ...(manualText.trim() ? [{
          source_type: "text",
          metadata: { content: manualText.trim() },
          include_for_knowledge: true,
          include_for_tone: true,
        }] : []),
      ];

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/sources/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(sourcesPayload),
      });

      const trainRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/train/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({}),
      });

      if (!trainRes.ok) throw new Error();
      const trainData = await trainRes.json();
      setTrainingJobId(trainData.job_id);
      setManualText("");
    } catch (err) {
      alert("Failed to save sources or start training.");
    } finally {
      setIsSavingSources(false);
    }
  };

  const saveSettings = async () => {
    if (!accessToken || !avatar) return;
    setSaving(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ name: avatar.name, settings: avatar.settings }),
      });
      fetchAvatar();
    } catch (err) {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  // Reusable Collapsible Section with Tone & Knowledge Toggles
  const CollapsibleSourceSection = <T extends SourceItem>({
    title, icon: Icon, items, updateItem
  }: {
    title: string;
    icon: any;
    items: T[];
    updateItem: (id: number, updates: Partial<T>) => void;
  }) => {
    const [open, setOpen] = useState(false);
    const selectedCount = items.filter(i => i.include_for_knowledge || i.include_for_tone).length;

    return (
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <button onClick={() => setOpen(!open)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-emerald-600" />
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500">{items.length} items • {selectedCount} selected</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-6">No {title.toLowerCase()} yet</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="p-4 bg-white rounded-xl shadow-sm hover:shadow transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {item.content.slice(0, 100)}{item.content.length > 100 && "..."}
                      </p>
                    </div>
                    <div className="flex gap-6 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.include_for_knowledge}
                          onChange={(e) => updateItem(item.id, { include_for_knowledge: e.target.checked } as Partial<T>)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700 font-medium">Knowledge</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.include_for_tone}
                          onChange={(e) => updateItem(item.id, { include_for_tone: e.target.checked } as Partial<T>)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-gray-700 font-medium">Tone</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6"><div className="text-center"><Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" /><p className="text-lg text-gray-600 font-medium">Loading your avatar...</p></div></div>;
  if (!avatar) return <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6"><div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md"><div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle className="w-10 h-10 text-red-500" /></div><h2 className="text-2xl font-bold text-gray-900 mb-2">Avatar Not Found</h2><p className="text-gray-600">@{avatarHandle}</p></div></div>;

  const isPublic = avatar.settings?.is_public ?? false;
  const isTrainingActive = !!trainingJobId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header & Tabs — unchanged */}
        {/* ... (same as before) ... */}

        {activeTab === "training" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2"><Database className="w-7 h-7" /><h2 className="text-2xl font-bold">Training Data Sources</h2></div>
                  <p className="text-emerald-50">Fine-tune what your AI knows and how it speaks</p>
                </div>

                <div className="p-6 space-y-6">
                  <CollapsibleSourceSection
                    title="Notes"
                    icon={FileText}
                    items={notes}
                    updateItem={(id, updates) => setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n))}
                  />
                  <CollapsibleSourceSection
                    title="Reminders"
                    icon={Bell}
                    items={reminders}
                    updateItem={(id, updates) => setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))}
                  />
                  <CollapsibleSourceSection
                    title="Todos"
                    icon={CheckSquare}
                    items={todos}
                    updateItem={(id, updates) => setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))}
                  />

                  <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 bg-emerald-50/30">
                    <div className="flex items-center gap-3 mb-4"><Plus className="w-6 h-6 text-emerald-600" /><h3 className="text-lg font-semibold text-gray-900">Add Custom Text</h3></div>
                    <textarea value={manualText} onChange={(e) => setManualText(e.target.value)} placeholder="Paste articles, documents, or any text..." className="w-full h-48 px-4 py-3 border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                    <p className="text-xs text-gray-500 mt-2 text-right">{manualText.length} characters</p>
                  </div>

                  <button
                    onClick={saveSourcesAndTrain}
                    disabled={isSavingSources || isTrainingActive}
                    className="w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingSources ? (
                      <>Saving Sources... <Loader2 className="w-6 h-6 animate-spin" /></>
                    ) : isTrainingActive ? (
                      <>Training in Progress... <RefreshCw className="w-6 h-6 animate-spin" /></>
                    ) : (
                      <>Save Sources & Start Training <Play className="w-6 h-6" /></>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Training Status + Danger Zone */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <RefreshCw className={`w-6 h-6 ${isTrainingActive ? 'text-emerald-500 animate-spin' : 'text-gray-400'}`} />
                  <h3 className="text-lg font-bold text-gray-900">Training Status</h3>
                </div>
                {isTrainingActive ? (
                  <div className="p-6 bg-emerald-50 rounded-xl text-center">
                    <Clock className="w-10 h-10 text-emerald-600 animate-pulse mx-auto mb-3" />
                    <p className="font-bold text-emerald-900">Training in Progress</p>
                    <p className="text-xs text-emerald-600 mt-1">Job: {trainingJobId?.slice(0, 8)}...</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Ready to train</p>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-2 border-red-200 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-white" /></div>
                  <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
                </div>
                <p className="text-sm text-red-800 mb-4">Permanently delete this avatar and all data.</p>
                <button className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete Avatar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS & ANALYTICS — unchanged (kept clean) */}
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
                    <input type="checkbox" checked={isPublic} onChange={(e) => setAvatar(a => a ? { ...a, settings: { ...a.settings, is_public: e.target.checked } } : null)} className="sr-only peer" />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Avatar Name</label>
                <input type="text" value={avatar.name} onChange={(e) => setAvatar(a => a ? { ...a, name: e.target.value } : null)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <button onClick={saveSettings} disabled={saving} className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition shadow-md disabled:opacity-50">
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}

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