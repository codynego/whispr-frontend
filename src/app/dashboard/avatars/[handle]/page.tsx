"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Settings, BarChart3, Loader2, AlertTriangle,
  Database, Trash2, Play, RefreshCw, CheckCircle2, Clock,
  FileText, Bell, CheckSquare, ChevronDown, Plus, Sparkles, Globe, Lock
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

interface SourceSelection {
  id: number;
  includeTone: boolean;
  includeKnowledge: boolean;
}

export default function AvatarConfigurationPage({ params }: { params: { handle: string } }) {
  const { accessToken } = useAuth();
  const avatarHandle = params.handle;

  const [avatar, setAvatar] = useState<FullAvatarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("training");
  const [saving, setSaving] = useState(false);

  // Sources
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  
  const [selectedNotes, setSelectedNotes] = useState<SourceSelection[]>([]);
  const [selectedReminders, setSelectedReminders] = useState<SourceSelection[]>([]);
  const [selectedTodos, setSelectedTodos] = useState<SourceSelection[]>([]);
  const [manualText, setManualText] = useState("");
  const [manualTextTone, setManualTextTone] = useState(true);
  const [manualTextKnowledge, setManualTextKnowledge] = useState(true);

  // Training state
  const [trainingJobId, setTrainingJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<"pending" | "running" | "completed" | "failed" | null>(null);
  const [isSavingSources, setIsSavingSources] = useState(false);
  const currentJobIdRef = useRef<string | null>(null);

  useEffect(() => { currentJobIdRef.current = trainingJobId; }, [trainingJobId]);

  // Fetch Avatar
  const fetchAvatar = useCallback(async (skipJobSync = false) => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error();
      const data: FullAvatarData = await res.json();
      setAvatar(data);

      if (!skipJobSync) {
        if (data.last_training_job_id && !data.trained) {
          setTrainingJobId(data.last_training_job_id);
        } else {
          setTrainingJobId(null);
          setJobStatus(null);
        }
      }
    } catch (err) {
      console.error("Failed to load avatar");
    } finally {
      setLoading(false);
    }
  }, [accessToken, avatarHandle]);

  // Fetch sources
  const fetchSources = useCallback(async () => {
    if (!accessToken) return;
    try {
      const [notesRes, remindersRes, todosRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/todos/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
      ]);

      const notesData = (await notesRes.json()).results || [];
      const remindersData = (await remindersRes.json()).results || [];
      const todosData = (await todosRes.json()).results || [];

      setNotes(notesData);
      setReminders(remindersData);
      setTodos(todosData);
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
        fetchAvatar(true);
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

  // Toggle selection
  const toggleSourceSelection = (
    id: number,
    selections: SourceSelection[],
    setSelections: React.Dispatch<React.SetStateAction<SourceSelection[]>>
  ) => {
    const existing = selections.find(s => s.id === id);
    if (existing) {
      setSelections(selections.filter(s => s.id !== id));
    } else {
      setSelections([...selections, { id, includeTone: true, includeKnowledge: true }]);
    }
  };

  // Update tone/knowledge flags
  const updateSourceFlags = (
    id: number,
    field: 'includeTone' | 'includeKnowledge',
    value: boolean,
    selections: SourceSelection[],
    setSelections: React.Dispatch<React.SetStateAction<SourceSelection[]>>
  ) => {
    setSelections(selections.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  // Save sources + train
  const saveSourcesAndTrain = async () => {
    if (!accessToken || !avatar) return;

    const hasSelection =
      selectedNotes.some(s => s.includeTone || s.includeKnowledge) ||
      selectedReminders.some(s => s.includeTone || s.includeKnowledge) ||
      selectedTodos.some(s => s.includeTone || s.includeKnowledge) ||
      manualText.trim() !== "";

    if (!hasSelection) {
      alert("Please select at least one source or add custom text.");
      return;
    }

    setIsSavingSources(true);
    try {
      const sourcesPayload = [
        ...selectedNotes.map(sel => ({
          source_type: "note",
          metadata: { item_ids: [sel.id] },
          include_for_tone: sel.includeTone,
          include_for_knowledge: sel.includeKnowledge,
        })),
        ...selectedReminders.map(sel => ({
          source_type: "reminder",
          metadata: { item_ids: [sel.id] },
          include_for_tone: sel.includeTone,
          include_for_knowledge: sel.includeKnowledge,
        })),
        ...selectedTodos.map(sel => ({
          source_type: "todo",
          metadata: { item_ids: [sel.id] },
          include_for_tone: sel.includeTone,
          include_for_knowledge: sel.includeKnowledge,
        })),
        ...(manualText.trim() ? [{
          source_type: "text",
          metadata: { content: manualText.trim() },
          include_for_tone: manualTextTone,
          include_for_knowledge: manualTextKnowledge,
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

      setSelectedNotes([]);
      setSelectedReminders([]);
      setSelectedTodos([]);
      setManualText("");
      setManualTextTone(true);
      setManualTextKnowledge(true);
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
      fetchAvatar(true);
    } catch (err) {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const CollapsibleSourceSection = ({ title, icon: Icon, items, selections, setSelections, getTitle, getContent }: {
    title: string;
    icon: any;
    items: any[];
    selections: SourceSelection[];
    setSelections: React.Dispatch<React.SetStateAction<SourceSelection[]>>;
    getTitle: (item: any) => string;
    getContent: (item: any) => string;
  }) => {
    const [open, setOpen] = useState(false);
    const selectedCount = selections.filter(s => s.includeTone || s.includeKnowledge).length;

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
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 space-y-3">
            {items.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-6">No {title.toLowerCase()} yet</p>
            ) : (
              items.map((item) => {
                const selection = selections.find(s => s.id === item.id);
                const isSelected = !!selection;

                return (
                  <div key={item.id} className="p-4 rounded-lg hover:bg-white transition bg-white border border-gray-100">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSourceSelection(item.id, selections, setSelections)}
                        className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{getTitle(item)}</p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {getContent(item).slice(0, 80)}{getContent(item).length > 80 && "..."}
                        </p>

                        {isSelected && selection && (
                          <div className="mt-3 flex gap-6 pl-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selection.includeTone}
                                onChange={(e) => updateSourceFlags(item.id, 'includeTone', e.target.checked, selections, setSelections)}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                              />
                              <span className="text-sm font-medium text-purple-700">Include for Tone</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selection.includeKnowledge}
                                onChange={(e) => updateSourceFlags(item.id, 'includeKnowledge', e.target.checked, selections, setSelections)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-blue-700">Include for Knowledge</span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
        <p className="text-lg text-gray-600 font-medium">Loading your avatar...</p>
      </div>
    </div>
  );

  if (!avatar) return (
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

  const isPublic = avatar.settings?.is_public ?? false;
  const isTrainingActive = !!trainingJobId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                {avatar.photo ? (
                  <img src={avatar.photo} alt={avatar.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <Sparkles className="w-12 h-12 text-emerald-600" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-1">{avatar.name}</h1>
                <div className="flex items-center gap-3">
                  <p className="text-emerald-50 text-lg">@{avatar.handle}</p>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${isPublic ? "bg-emerald-100 text-emerald-700" : "bg-gray-700 text-white"}`}>
                    {isPublic ? <Globe className="w-3 h-3 inline mr-1" /> : <Lock className="w-3 h-3 inline mr-1" />}
                    {isPublic ? "Public" : "Private"}
                  </div>
                </div>
              </div>
              {avatar.trained && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">Trained</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {[
              { id: "training" as Tab, label: "Training", icon: Database },
              { id: "settings" as Tab, label: "Settings", icon: Settings },
              { id: "analytics" as Tab, label: "Analytics", icon: BarChart3 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition ${
                  activeTab === id
                    ? "text-emerald-600 border-b-4 border-emerald-500 bg-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
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
                  <p className="text-emerald-50">Fine-tune your AI&apos;s knowledge and personality</p>
                </div>

                <div className="p-6 space-y-6">
                  <CollapsibleSourceSection
                    title="Notes"
                    icon={FileText}
                    items={notes}
                    selections={selectedNotes}
                    setSelections={setSelectedNotes}
                    getTitle={(n) => n.title || "Untitled Note"}
                    getContent={(n) => n.content}
                  />
                  <CollapsibleSourceSection
                    title="Reminders"
                    icon={Bell}
                    items={reminders}
                    selections={selectedReminders}
                    setSelections={setSelectedReminders}
                    getTitle={(r) => r.text}
                    getContent={(r) => r.text}
                  />
                  <CollapsibleSourceSection
                    title="Todos"
                    icon={CheckSquare}
                    items={todos}
                    selections={selectedTodos}
                    setSelections={setSelectedTodos}
                    getTitle={(t) => t.task}
                    getContent={(t) => t.task}
                  />

                  <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 bg-emerald-50/30">
                    <div className="flex items-center gap-3 mb-4">
                      <Plus className="w-6 h-6 text-emerald-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Add Custom Text</h3>
                    </div>
                    <textarea
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                      placeholder="Paste articles, documents, or any text..."
                      className="w-full h-48 px-4 py-3 border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={manualTextTone}
                            onChange={(e) => setManualTextTone(e.target.checked)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm font-medium text-purple-700">Include for Tone</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={manualTextKnowledge}
                            onChange={(e) => setManualTextKnowledge(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-blue-700">Include for Knowledge</span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">{manualText.length} characters</p>
                    </div>
                  </div>

                  <button
                    onClick={saveSourcesAndTrain}
                    disabled={isSavingSources || isTrainingActive || !(
                      selectedNotes.some(s => s.includeTone || s.includeKnowledge) ||
                      selectedReminders.some(s => s.includeTone || s.includeKnowledge) ||
                      selectedTodos.some(s => s.includeTone || s.includeKnowledge) ||
                      manualText.trim() !== ""
                    )}
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
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
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

        {/* SETTINGS & ANALYTICS — unchanged */}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Disclaimer Text</label>
                <textarea
                  value={avatar.settings?.disclaimer_text || ""}
                  onChange={(e) => setAvatar(a => a ? { ...a, settings: { ...a.settings, disclaimer_text: e.target.value } } : null)}
                  placeholder="Add a disclaimer for users (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Response Delay (ms)</label>
                <input
                  type="number"
                  value={avatar.settings?.response_delay_ms || 0}
                  onChange={(e) => setAvatar(a => a ? { ...a, settings: { ...a.settings, response_delay_ms: parseInt(e.target.value) || 0 } } : null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  min="0"
                />
              </div>
              <div className="p-6 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Enable Owner Takeover</h3>
                    <p className="text-sm text-gray-600">Allow you to take over conversations</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={avatar.settings?.enable_owner_takeover ?? false}
                      onChange={(e) => setAvatar(a => a ? { ...a, settings: { ...a.settings, enable_owner_takeover: e.target.checked } } : null)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
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