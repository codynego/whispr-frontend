"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Settings, BarChart3, Loader2, AlertTriangle,
  Database, Trash2, Play, RefreshCw, CheckCircle2, Clock,
  FileText, Bell, CheckSquare, ChevronDown, Plus, File, Save
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/navigation'; // Import useRouter

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

// ... Interface definitions remain the same ...
interface Note { id: number; title: string; content: string; }
interface Reminder { id: number; text: string; }
interface Todo { id: number; task: string; }
interface UploadedFile {
  id: number;
  original_filename: string;
  file: string;
  file_type: string;
  size: number;
  content?: string;
  uploaded_at?: string;
}

export default function AvatarConfigurationPage({ params }: { params: Promise<{ handle: string }> }) {
  const router = useRouter(); // Initialize router
  const { user, loading: authLoading } = useAuth();
  const [avatarHandle, setAvatarHandle] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => setAvatarHandle(p.handle));
  }, [params]);

  const [avatar, setAvatar] = useState<FullAvatarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("training");
  const [saving, setSaving] = useState(false); // For settings save

  // Sources
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<number[]>([]);
  const [selectedReminders, setSelectedReminders] = useState<number[]>([]);
  const [selectedTodos, setSelectedTodos] = useState<number[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [manualText, setManualText] = useState("");

  // Training state
  const [trainingJobId, setTrainingJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<"pending" | "running" | "completed" | "error" | null>(null);
  const [isSavingSources, setIsSavingSources] = useState(false);
  const currentJobIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentJobIdRef.current = trainingJobId;
  }, [trainingJobId]);

  // Fetch Avatar
  const fetchAvatar = useCallback(async (skipJobSync = false) => {
    if (!avatarHandle || authLoading || !user) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load avatar");
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
      console.error("Failed to load avatar:", err);
      if (err instanceof Error && err.message === "Failed to load avatar") {
        setAvatar(null); // Explicitly set to null if 404/failure occurs
      }
    } finally {
      setLoading(false);
    }
  }, [avatarHandle, user, authLoading]);

  // Fetch sources - (Unchanged for brevity, but kept the function)
  const fetchSources = useCallback(async () => {
    if (!user || authLoading) return;

    try {
      const [notesRes, remindersRes, todosRes, filesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/`, { credentials: "include" }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/`, { credentials: "include" }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/todos/`, { credentials: "include" }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/files/`, { credentials: "include" }),
      ]);

      const [notesData, remindersData, todosData, filesData] = await Promise.all([
        notesRes.json(), remindersRes.json(), todosRes.json(), filesRes.json()
      ]);

      setNotes(notesData.results || []);
      setReminders(remindersData.results || []);
      setTodos(todosData.results || []);
      setFiles(filesData.results || []);
    } catch (err) {
      console.error("Failed to load sources:", err);
    }
  }, [user, authLoading]);

  // Poll job status - (Unchanged for brevity, but kept the function)
  const pollJobStatus = useCallback(async () => {
    const jobId = currentJobIdRef.current;
    if (!jobId || !user) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/training-jobs/${jobId}/status/`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setJobStatus(data.status);

      if (data.status === "completed" || data.status === "error") {
        setTrainingJobId(null);
        currentJobIdRef.current = null;
        setJobStatus(null);
        fetchAvatar(true);
      }
    } catch (err) {
      console.error("Polling failed:", err);
      setTrainingJobId(null);
      currentJobIdRef.current = null;
      setJobStatus(null);
    }
  }, [user, fetchAvatar]);

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

  // Save sources + train - (Unchanged for brevity, but kept the function)
  const saveSourcesAndTrain = async () => {
    // ... existing logic ...
    if (!user || !avatar) return;

    const hasSelection = selectedNotes.length > 0 ||
      selectedReminders.length > 0 ||
      selectedTodos.length > 0 ||
      selectedFiles.length > 0 ||
      manualText.trim() !== "";

    if (!hasSelection) {
      alert("Please select at least one source or add custom text.");
      return;
    }

    setIsSavingSources(true);
    try {
      const sourcesPayload = [
        ...(selectedNotes.length > 0 ? [{ source_type: "notes", metadata: { item_ids: selectedNotes } }] : []),
        ...(selectedReminders.length > 0 ? [{ source_type: "reminders", metadata: { item_ids: selectedReminders } }] : []),
        ...(selectedTodos.length > 0 ? [{ source_type: "todos", metadata: { item_ids: selectedTodos } }] : []),
        ...(selectedFiles.length > 0 ? [{ source_type: "uploads", metadata: { item_ids: selectedFiles } }] : []),
        ...(manualText.trim() ? [{ source_type: "text", metadata: { text: manualText.trim() } }] : []),
      ];

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/sources/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(sourcesPayload),
      });

      const trainRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/train/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      if (!trainRes.ok) throw new Error("Training failed");
      const { job_id } = await trainRes.json();
      setTrainingJobId(job_id);

      // Reset form
      setSelectedNotes([]);
      setSelectedReminders([]);
      setSelectedTodos([]);
      setSelectedFiles([]);
      setManualText("");
    } catch (err) {
      alert("Failed to save sources or start training.");
    } finally {
      setIsSavingSources(false);
    }
  };

  /**
   * UPDATED: Separated Avatar Name and Settings updates to match the backend structure.
   * - Avatar Name uses PATCH to the main endpoint: /avatars/{handle}/ (handled by AvatarSerializer)
   * - Settings uses PATCH to the dedicated settings endpoint: /avatars/{handle}/settings/ (handled by AvatarSettingsSerializer)
   */
  const saveSettings = async () => {
    if (!user || !avatar) return;
    setSaving(true);
    try {
      // 1. Update Avatar Name (PATCH to main avatar endpoint)
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/profile/${avatar.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: avatar.name }),
      });

      // 2. Update Avatar Settings (PATCH to dedicated settings endpoint)
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/settings/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        // Send all fields in settings object
        body: JSON.stringify(avatar.settings),
      });

      alert("Settings saved successfully!");
      fetchAvatar(); // Re-fetch to confirm latest state
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Failed to save settings. Check console for details.");
    } finally {
      setSaving(false);
    }
  };
  
  /**
   * NEW: Function to handle avatar deletion.
   */
  const deleteAvatar = async () => {
    if (!user || !avatar || !confirm(`Are you sure you want to permanently delete the avatar "@${avatar.handle}"? This cannot be undone.`)) {
        return;
    }

    setSaving(true); // Reuse saving state for visual feedback
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/profile/${avatar.id}/`, {
            method: "DELETE",
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error("Failed to delete avatar");
        }

        alert(`Avatar @${avatar.handle} deleted successfully.`);
        // Redirect the user to the dashboard or avatar list page after successful deletion
        router.push('/dashboard'); 
    } catch (err) {
        console.error("Failed to delete avatar:", err);
        alert("Failed to delete avatar. Please try again.");
    } finally {
        setSaving(false);
    }
  };


  const CollapsibleSourceSection = ({ title, icon: Icon, items, selectedIds, onToggle, getTitle, getSubtitle }: {
    title: string;
    icon: any;
    items: any[];
    selectedIds: number[];
    onToggle: (id: number) => void;
    getTitle: (item: any) => string;
    getSubtitle: (item: any) => string;
  }) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <button onClick={() => setOpen(!open)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-emerald-600" />
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500">{items.length} items • {selectedIds.length} selected</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 space-y-3">
            {items.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-6">No {title.toLowerCase()} yet</p>
            ) : (
              items.map((item) => (
                <label key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => onToggle(item.id)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{getTitle(item)}</p>
                    <p className="text-xs text-gray-600 truncate">{getSubtitle(item)}</p>
                  </div>
                </label>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  if (authLoading || loading) return (
    <div className="w-full min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
        <p className="text-lg text-gray-600 font-medium">Loading your avatar...</p>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6">
        <p className="text-xl text-gray-600">Please log in to configure your avatar</p>
      </div>
    );
  }

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

  const isTrainingActive = !!trainingJobId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex space-x-4 mb-8">
            <button
                onClick={() => setActiveTab('training')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition ${
                    activeTab === 'training'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
                <Database className="w-5 h-5" /> Training
            </button>
            <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition ${
                    activeTab === 'settings'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
                <Settings className="w-5 h-5" /> Settings
            </button>
            <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition ${
                    activeTab === 'analytics'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
                <BarChart3 className="w-5 h-5" /> Analytics
            </button>
        </div>
        
        {/* TRAINING TAB */}
        {activeTab === "training" && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Database className="w-7 h-7" />
                    <h2 className="text-2xl font-bold">Training Data Sources</h2>
                  </div>
                  <p className="text-emerald-50">Choose what your AI learns from</p>
                </div>

                <div className="p-6 space-y-6">
                  <CollapsibleSourceSection
                    title="Notes"
                    icon={FileText}
                    items={notes}
                    selectedIds={selectedNotes}
                    onToggle={(id) => setSelectedNotes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                    getTitle={(n) => n.title || "Untitled"}
                    getSubtitle={(n) => n.content.slice(0, 80) + (n.content.length > 80 ? "..." : "")}
                  />
                  <CollapsibleSourceSection
                    title="Reminders"
                    icon={Bell}
                    items={reminders}
                    selectedIds={selectedReminders}
                    onToggle={(id) => setSelectedReminders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                    getTitle={(r) => r.text}
                    getSubtitle={() => "Reminder"}
                  />
                  <CollapsibleSourceSection
                    title="Todos"
                    icon={CheckSquare}
                    items={todos}
                    selectedIds={selectedTodos}
                    onToggle={(id) => setSelectedTodos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                    getTitle={(t) => t.task}
                    getSubtitle={() => "Task"}
                  />
                  <CollapsibleSourceSection
                    title="Files & Documents"
                    icon={File}
                    items={files}
                    selectedIds={selectedFiles}
                    onToggle={(id) => setSelectedFiles(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                    getTitle={(f) => f.original_filename}
                    getSubtitle={(f) => `${f.file_type.toUpperCase()} • ${(f.size / 1024 / 1024).toFixed(2)} MB`}
                  />

                  <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 bg-emerald-50/30">
                    <div className="flex items-center gap-3 mb-4">
                      <Plus className="w-6 h-6 text-emerald-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Add Custom Text</h3>
                    </div>
                    <textarea
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                      placeholder="Paste bio, instructions, articles..."
                      className="w-full h-48 px-4 py-3 border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
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

            {/* Sidebar */}
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
                ) : avatar.trained ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
                    <p className="text-emerald-600 font-medium">Trained & Ready</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Not trained yet</p>
                  </div>
                )}
              </div>

              {/* DANGER ZONE - UPDATED with deleteAvatar function */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-2 border-red-200 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
                </div>
                <p className="text-sm text-red-800 mb-4">Permanently delete this avatar and all data associated with it.</p>
                <button
                    onClick={deleteAvatar}
                    disabled={saving}
                    className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                      <>Deleting... <Loader2 className="w-4 h-4 animate-spin" /></>
                  ) : (
                      <> <Trash2 className="w-4 h-4" /> Delete Avatar </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB - UPDATED with saveSettings, additional fields, and visual updates */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-8">
              <Settings className="w-7 h-7 text-emerald-600" />
              <h2 className="text-2xl font-bold text-gray-900">Avatar Settings</h2>
            </div>
            <div className="space-y-8 max-w-3xl">
              {/* Avatar Name */}
              <div>
                <label htmlFor="avatar-name" className="block text-sm font-semibold text-gray-700 mb-2">Avatar Name</label>
                <input
                  id="avatar-name"
                  type="text"
                  value={avatar.name}
                  onChange={(e) => setAvatar(a => a ? { ...a, name: e.target.value } : null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                {/* Public Access */}
                <div className="flex items-center justify-between col-span-full border-b pb-4 mb-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Public Access</h3>
                        <p className="text-sm text-gray-600">Allow others to chat with your avatar</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={avatar.settings?.is_public ?? false}
                            onChange={(e) => setAvatar(a => a ? { ...a, settings: { ...a.settings, is_public: e.target.checked } } : null)}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>
                
                {/* Response Delay */}
                <div>
                    <label htmlFor="response-delay" className="block text-sm font-semibold text-gray-700 mb-2">Response Delay (ms)</label>
                    <input
                        id="response-delay"
                        type="number"
                        min="0"
                        value={avatar.settings?.response_delay_ms ?? 0}
                        onChange={(e) => setAvatar(a => a ? { ...a, settings: { ...a.settings, response_delay_ms: parseInt(e.target.value) || 0 } } : null)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Simulate human-like response time.</p>
                </div>

                {/* Owner Takeover */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-white bg-white">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Enable Owner Takeover</h3>
                        <p className="text-sm text-gray-600">Owner can temporarily control the chat.</p>
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

                {/* Disclaimer Text */}
                <div className="col-span-full">
                    <label htmlFor="disclaimer-text" className="block text-sm font-semibold text-gray-700 mb-2">Disclaimer Text</label>
                    <textarea
                        id="disclaimer-text"
                        value={avatar.settings?.disclaimer_text ?? ""}
                        onChange={(e) => setAvatar(a => a ? { ...a, settings: { ...a.settings, disclaimer_text: e.target.value } } : null)}
                        placeholder="e.g., 'This avatar is for entertainment purposes only.'"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Text displayed before a public conversation starts.</p>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={saveSettings}
                disabled={saving}
                className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition shadow-md disabled:opacity-50"
              >
                {saving ? (
                    <>Saving Settings... <Loader2 className="w-5 h-5 animate-spin" /></>
                ) : (
                    <>Save All Settings <Save className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB - (Unchanged for brevity, but kept the function) */}
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
                <p className="text-3xl font-bold text-purple-900">{((avatar.analytics?.average_response_time_ms || 0) / 1000).toFixed(1)}s</p>
              </div>
            </div>
            <div className="h-80 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
              <p className="text-gray-400 text-lg">Detailed analytics coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}