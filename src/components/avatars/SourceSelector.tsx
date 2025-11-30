"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Book,
  Calendar,
  CheckSquare,
  Upload,
  Mail,
  Globe,
  Settings,
  Loader2,
  Save,
  Brain,
  ChevronRight,
  ArrowLeft,
  Trash2,
  List,
  Type,
  FileText,
  CheckCircle2,
  Circle,
} from "lucide-react";
import toast from "react-hot-toast";

type SourceType = "notes" | "reminders" | "todos" | "uploads" | "gmail" | "website" | "manual";

interface Item {
  id: string | number;
  title: string;
}

interface BackendSource {
  id: string;
  source_type: SourceType;
  metadata: Record<string, any>;
  include_for_tone: boolean;
  include_for_knowledge: boolean;
  created_at: string;
}

interface SourceConfig {
  type: SourceType;
  label: string;
  icon: React.ElementType;
  isEnabled: boolean;
  useForTone: boolean;
  useForKnowledge: boolean;
  selectedIds: (string | number)[];
  items?: Item[];
  hasItems: boolean;
  manualContent: string;
}

interface Props {
  avatarHandle: string;
  onSaveSuccess: () => void;
}

const CONFIG: SourceConfig[] = [
  { type: "notes", label: "Whisone Notes", icon: Book, isEnabled: false, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: true, manualContent: "" },
  { type: "reminders", label: "Reminders", icon: Calendar, isEnabled: false, useForTone: false, useForKnowledge: false, selectedIds: [], hasItems: true, manualContent: "" },
  { type: "todos", label: "To-Dos", icon: CheckSquare, isEnabled: false, useForTone: false, useForKnowledge: false, selectedIds: [], hasItems: true, manualContent: "" },
  { type: "uploads", label: "File Uploads", icon: Upload, isEnabled: false, useForTone: true, useForKnowledge: false, selectedIds: [], hasItems: true, manualContent: "" },
  { type: "gmail", label: "Gmail", icon: Mail, isEnabled: false, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: false, manualContent: "" },
  { type: "website", label: "Website", icon: Globe, isEnabled: false, useForTone: false, useForKnowledge: false, selectedIds: [], hasItems: false, manualContent: "" },
  { type: "manual", label: "Manual Data Entry", icon: Type, isEnabled: false, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: false, manualContent: "" },
];

const ENDPOINTS: Record<string, string> = {
  notes: "notes/",
  reminders: "reminders/",
  todos: "todos/",
  uploads: "files/",
};

const Icon = ({ type, className }: { type: SourceType; className?: string }) => {
  const cfg = CONFIG.find((c) => c.type === type);
  const C = cfg?.icon || Settings;
  return <C className={`w-5 h-5 ${className || "text-emerald-600"}`} />;
};

const ManualDataEntry = ({ content, onChange }: { content: string; onChange: (c: string) => void }) => (
  <div className="space-y-3">
    <label className="block text-sm font-semibold text-gray-800">Manual Text Input</label>
    <p className="text-xs text-gray-600">Add custom Q&A, tone examples, or knowledge directly. This will be chunked and used for training.</p>
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      rows={10}
      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none transition-all"
      placeholder="Example:
Q: What is your favorite programming language?
A: I love Python because it's clean and powerful.

I’m a helpful AI who speaks casually and uses emojis sometimes."
    />
  </div>
);

export const SourceSelector = ({ avatarHandle, onSaveSuccess }: Props) => {
  const { accessToken } = useAuth();
  const [sources, setSources] = useState(CONFIG);
  const [backendSources, setBackendSources] = useState<BackendSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mainPanel, setMainPanel] = useState<"config" | "manage">("config");
  const [activeType, setActiveType] = useState<SourceType | null>(null);

  const active = sources.find((s) => s.type === activeType);

  const fetchItems = useCallback(async (type: SourceType) => {
    const endpoint = ENDPOINTS[type];
    if (!endpoint || !accessToken) return;

    const src = sources.find((s) => s.type === type);
    if (src?.items) return;

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/${endpoint}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      const items: Item[] = (data.results || data).map((item: any) => ({
        id: item.id,
        title: item.name || item.filename || item.title || `Item ${item.id}`,
      }));

      setSources((prev) => prev.map((s) => (s.type === type ? { ...s, items } : s)));
    } catch {
      toast.error(`Failed to load ${type}`);
    } finally {
      setLoading(false);
    }
  }, [accessToken, sources]);

  const fetchBackendSources = useCallback(async () => {
    if (!accessToken || !avatarHandle) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/sources/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setBackendSources(data);
    } catch {
      toast.error("Failed to load existing sources");
    } finally {
      setLoading(false);
    }
  }, [accessToken, avatarHandle]);

  const deleteSource = async (id: string) => {
    if (!accessToken || !window.confirm("Delete this source? It will be removed from training.")) return;

    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/sources/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Source deleted");
      fetchBackendSources();
      onSaveSuccess();
    } catch {
      toast.error("Failed to delete source");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchItems("notes");
      fetchItems("uploads");
      fetchBackendSources();
    }
  }, [accessToken]);

  const toggle = (type: SourceType, field: "useForTone" | "useForKnowledge", value: boolean) => {
    setSources((prev) =>
      prev.map((s) => {
        if (s.type !== type) return s;
        const updated = { ...s, [field]: value };
        const enabled = updated.useForTone || updated.useForKnowledge;
        return { ...updated, isEnabled: enabled };
      })
    );
  };

  const toggleItem = (type: SourceType, id: string | number, checked: boolean) => {
    setSources((prev) =>
      prev.map((s) =>
        s.type === type
          ? {
              ...s,
              selectedIds: checked ? [...s.selectedIds, id] : s.selectedIds.filter((x) => x !== id),
            }
          : s
      )
    );
  };

  const updateManualContent = (type: SourceType, content: string) => {
    setSources((prev) => prev.map((s) => (s.type === type ? { ...s, manualContent: content } : s)));
  };

  const save = async () => {
    if (!accessToken) return;
    setSaving(true);

    const payload = sources
      .filter((s) => s.useForTone || s.useForKnowledge)
      .map((s) => {
        const base: any = {
          source_type: s.type,
          include_for_tone: s.useForTone,
          include_for_knowledge: s.useForKnowledge,
        };

        if (s.type === "manual") {
          if (!s.manualContent.trim()) {
            toast.error("Manual source is enabled but empty");
            return null;
          }
          base.metadata = { content: s.manualContent.trim() };
        } else if (s.hasItems) {
          base.metadata = { ids: s.selectedIds.length > 0 ? s.selectedIds : [] };
        } else {
          base.metadata = {};
        }
        return base;
      })
      .filter(Boolean);

    if (payload.length === 0) {
      toast.error("No sources selected");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/sources/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Save failed");
      }

      toast.success("Training sources saved!");
      fetchBackendSources();
      onSaveSuccess();
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-5xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Brain className="w-10 h-10" />
            <div>
              <h2 className="text-2xl font-bold">Avatar Training Data</h2>
              <p className="text-emerald-100">Choose what your AI learns from</p>
            </div>
          </div>
          <button
            onClick={() => {
              setMainPanel(mainPanel === "config" ? "manage" : "config");
              setActiveType(null);
              if (mainPanel === "config") fetchBackendSources();
            }}
            className="px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition backdrop-blur"
          >
            {mainPanel === "config" ? "Manage Sources" : "Add Sources"}
          </button>
        </div>
      </div>

      <div className="p-6">
        {mainPanel === "config" ? (
          <div className="grid md:grid-cols-12 gap-8">
            {/* Source List - Always visible on desktop */}
            <div className="md:col-span-5 space-y-3">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Available Sources</h3>
              {sources.map((s) => (
                <button
                  key={s.type}
                  onClick={() => {
                    setActiveType(s.type);
                    if (s.hasItems && !s.items) fetchItems(s.type);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                    activeType === s.type
                      ? "bg-emerald-50 border-emerald-500 shadow-md"
                      : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Icon type={s.type} className="w-6 h-6 text-emerald-700" />
                      </div>
                      <div>
                        <div className="font-semibold">{s.label}</div>
                        <div className="text-xs text-gray-500">
                          {s.useForTone && "Tone "}
                          {s.useForTone && s.useForKnowledge && "· "}
                          {s.useForKnowledge && "Knowledge"}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform ${activeType === s.type ? "rotate-90" : ""}`} />
                  </div>
                </button>
              ))}
            </div>

            {/* Details Panel */}
            <div className="md:col-span-7">
              {!active ? (
                <div className="text-center py-16 text-gray-400">
                  <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select a source to configure</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                      <Icon type={active.type} className="w-8 h-8 text-emerald-600" />
                      {active.label}
                    </h3>
                    <button
                      onClick={() => setActiveType(null)}
                      className="md:hidden text-gray-500 hover:text-gray-700"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-6 border border-emerald-200">
                    <h4 className="font-bold text-lg mb-4">How should this be used?</h4>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow transition">
                        <div className="flex items-center gap-3">
                          <Book className="w-5 h-5 text-emerald-600" />
                          <div>
                            <div className="font-medium">Tone & Style</div>
                            <div className="text-xs text-gray-600">How the AI writes and speaks</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={active.useForTone}
                          onChange={(e) => toggle(active.type, "useForTone", e.target.checked)}
                          className="w-6 h-6 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow transition">
                        <div className="flex items-center gap-3">
                          <Brain className="w-5 h-5 text-emerald-600" />
                          <div>
                            <div className="font-medium">Knowledge</div>
                            <div className="text-xs text-gray-600">Facts, files, notes the AI remembers</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={active.useForKnowledge}
                          onChange={(e) => toggle(active.type, "useForKnowledge", e.target.checked)}
                          className="w-6 h-6 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                      </label>
                    </div>
                  </div>

                  {(active.useForTone || active.useForKnowledge) && (
                    <>
                      {active.type === "manual" ? (
                        <ManualDataEntry content={active.manualContent} onChange={(c) => updateManualContent(active.type, c)} />
                      ) : active.hasItems ? (
                        <div className="bg-gray-50 rounded-2xl p-6 border">
                          <p className="font-semibold mb-4">Select specific items (optional)</p>
                          <div className="max-h-96 overflow-y-auto space-y-1">
                            {loading ? (
                              <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                              </div>
                            ) : active.items?.length ? (
                              active.items.map((item) => (
                                <label
                                  key={item.id}
                                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white transition cursor-pointer"
                                >
                                  <span className="text-sm text-gray-700 truncate pr-4">{item.title}</span>
                                  {active.selectedIds.includes(item.id) ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-gray-400" />
                                  )}
                                  <input
                                    type="checkbox"
                                    checked={active.selectedIds.includes(item.id)}
                                    onChange={(e) => toggleItem(active.type, item.id, e.target.checked)}
                                    className="sr-only"
                                  />
                                </label>
                              ))
                            ) : (
                              <p className="text-center text-gray-500 py-8">No items found</p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-3">Leave empty to include all items</p>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <List className="w-8 h-8 text-emerald-600" />
              Current Training Sources
            </h3>
            {backendSources.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 font-medium">No sources added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {backendSources.map((src) => {
                  const cfg = CONFIG.find((c) => c.type === src.source_type);
                  const IconC = cfg?.icon || FileText;
                  const label = cfg?.label || src.source_type;

                  return (
                    <div key={src.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 rounded-xl">
                          <IconC className="w-6 h-6 text-emerald-700" />
                        </div>
                        <div>
                          <div className="font-semibold">{label}</div>
                          <div className="text-sm text-gray-600">
                            {src.include_for_tone && "Tone"}
                            {src.include_for_tone && src.include_for_knowledge && " · "}
                            {src.include_for_knowledge && "Knowledge"}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSource(src.id)}
                        disabled={saving}
                        className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
                      >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {mainPanel === "config" && (
          <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={save}
              disabled={saving || loading}
              className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center gap-3 shadow-xl hover:shadow-2xl transition disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  Save & Train Avatar
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};