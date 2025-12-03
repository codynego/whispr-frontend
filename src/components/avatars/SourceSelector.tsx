"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Book, Calendar, CheckSquare, Upload, Type,
  Brain, ChevronRight, Trash2, Loader2, Sparkles,
 Check, ArrowLeft,
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
  include_for_tone: boolean;
  include_for_knowledge: boolean;
}

interface SourceConfig {
  type: SourceType;
  label: string;
  description: string;
  icon: React.ElementType;
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

const CONFIG: Omit<SourceConfig, "useForTone" | "useForKnowledge" | "selectedIds" | "items" | "manualContent">[] = [
  { type: "notes", label: "Notes", description: "Personal notes & documents", icon: Book, hasItems: true },
  { type: "reminders", label: "Reminders", description: "Tasks & reminders", icon: Calendar, hasItems: true },
  { type: "todos", label: "To-Dos", description: "Task lists & projects", icon: CheckSquare, hasItems: true },
  { type: "uploads", label: "Files", description: "Uploaded documents", icon: Upload, hasItems: true },
  { type: "manual", label: "Custom Text", description: "Add your own content", icon: Type, hasItems: false },
];

const ENDPOINTS: Record<string, string> = {
  notes: "notes/",
  reminders: "reminders/",
  todos: "todos/",
  uploads: "files/",
};

export default function SourceSelector({ avatarHandle, onSaveSuccess }: Props) {
  const { accessToken } = useAuth();

  const [sources, setSources] = useState<SourceConfig[]>(() =>
    CONFIG.map(c => ({
      ...c,
      useForTone: false,
      useForKnowledge: false,
      selectedIds: [],
      manualContent: "",
    }))
  );

  const [backendSources, setBackendSources] = useState<BackendSource[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeType, setActiveType] = useState<SourceType | null>(null);
  const [view, setView] = useState<"config" | "manage">("config");

  const active = sources.find(s => s.type === activeType);
  const activeCount = sources.filter(s => s.useForTone || s.useForKnowledge).length;

  // Fetch items for a source type
  const fetchItems = useCallback(async (type: SourceType) => {
    const endpoint = ENDPOINTS[type];
    if (!endpoint || !accessToken) return;

    const existing = sources.find(s => s.type === type);
    if (existing?.items) return;

    setLoadingItems(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/${endpoint}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error("Failed to load items");

      const data = await res.json();
      const items = (Array.isArray(data) ? data : data.results || []).map((i: any) => ({
        id: i.id,
        title: i.title || i.name || i.filename || "Untitled"
      }));

      setSources(prev => prev.map(s =>
        s.type === type ? { ...s, items } : s
      ));
    } catch (err) {
      toast.error(`Failed to load ${type}`);
    } finally {
      setLoadingItems(false);
    }
  }, [accessToken, sources]);

  // Fetch currently active sources for this avatar
  const fetchBackendSources = useCallback(async () => {
    if (!accessToken || !avatarHandle) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/sources/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        setBackendSources(data);
      }
    } catch (err) {
      toast.error("Failed to load active sources");
    }
  }, [accessToken, avatarHandle]);

  // Delete a source from training
  const deleteSource = async (id: string) => {
    if (!confirm("Remove this source from training?")) return;

    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/sources/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error("Failed to remove");

      setBackendSources(prev => prev.filter(s => s.id !== id));
      toast.success("Source removed");
      onSaveSuccess();
    } catch {
      toast.error("Failed to remove source");
    } finally {
      setSaving(false);
    }
  };

  // Save training sources
  const save = async () => {
    if (activeCount === 0) {
      toast.error("Select at least one source");
      return;
    }

    setSaving(true);
    try {
      const payload = sources
        .filter(s => s.useForTone || s.useForKnowledge)
        .map(source => {
          const base: any = {
            source_type: source.type,
            include_for_tone: source.useForTone,
            include_for_knowledge: source.useForKnowledge,
            metadata: {},
          };

          if (source.type === "manual" && source.manualContent.trim()) {
            base.metadata.content = source.manualContent.trim();
          } else if (source.hasItems && source.selectedIds.length > 0) {
            base.metadata.item_ids = source.selectedIds;
          }

          return base;
        });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/sources/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to save");
      }

      await fetchBackendSources();
      toast.success("Training started successfully!");
      onSaveSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to save training sources");
    } finally {
      setSaving(false);
    }
  };

  // Load active sources when switching to manage view
  useEffect(() => {
    if (view === "manage") fetchBackendSources();
  }, [view, fetchBackendSources]);

  const toggle = (type: SourceType, field: "useForTone" | "useForKnowledge", value: boolean) => {
    setSources(prev => prev.map(s =>
      s.type === type ? { ...s, [field]: value } : s
    ));
  };

  const toggleItem = (type: SourceType, id: string | number, checked: boolean) => {
    setSources(prev => prev.map(s =>
      s.type === type
        ? {
            ...s,
            selectedIds: checked
              ? [...s.selectedIds, id]
              : s.selectedIds.filter(x => x !== id),
          }
        : s
    ));
  };

  const updateManual = (type: SourceType, content: string) => {
    setSources(prev => prev.map(s =>
      s.type === type ? { ...s, manualContent: content } : s
    ));
  };

  const IconComponent = ({ type }: { type: SourceType }) => {
    const Icon = CONFIG.find(c => c.type === type)?.icon || Book;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 lg:pb-10">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Training Studio</h1>
                <p className="text-gray-600 mt-1">Configure your avatar&apos;s learning sources</p>
              </div>
            </div>
            <button
              onClick={() => { setView(view === "config" ? "manage" : "config"); setActiveType(null); }}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            >
              {view === "config" ? "View Active Sources" : "Configure Sources"}
            </button>
          </div>

          {view === "config" && activeCount > 0 && (
            <div className="flex items-center gap-6 px-6 py-4 bg-white border border-emerald-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  <strong className="text-emerald-600">{activeCount}</strong> source{activeCount !== 1 ? 's' : ''} selected
                </span>
              </div>
            </div>
          )}
        </header>

        {/* CONFIG VIEW */}
        {view === "config" && (
          <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
            {/* Sidebar */}
            <aside className={`space-y-3 ${activeType ? "hidden lg:block" : "block"}`}>
              {sources.map(s => {
                const isActive = s.useForTone || s.useForKnowledge;
                const isSelected = activeType === s.type;
                const Icon = s.icon;

                return (
                  <button
                    key={s.type}
                    onClick={() => {
                      setActiveType(s.type);
                      if (s.hasItems && !s.items) fetchItems(s.type);
                    }}
                    className={`w-full rounded-xl border p-5 text-left transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? "bg-emerald-100" : "bg-gray-100"}`}>
                          <Icon className={`w-6 h-6 ${isActive ? "text-emerald-600" : "text-gray-500"}`} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{s.label}</div>
                          <div className="text-sm text-gray-500 mt-1">{s.description}</div>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? "text-emerald-600 translate-x-1" : "text-gray-400"}`} />
                    </div>
                  </button>
                );
              })}
            </aside>

            {/* Detail Panel */}
            <main className={`min-w-0 ${activeType ? "block" : "hidden lg:block"}`}>
              {!activeType ? (
                <div className="flex h-96 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-center">
                  <Brain className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900">Select a Source</h3>
                  <p className="text-gray-500 mt-2">Choose a data source to configure training</p>
                </div>
              ) : (
                <div className="rounded-2xl bg-white shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white">
                    <button onClick={() => setActiveType(null)} className="lg:hidden mb-4 flex items-center gap-2 text-white/90 hover:text-white text-sm">
                      <ArrowLeft className="w-5 h-5" /> Back
                    </button>
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <IconComponent type={active?.type ?? "notes"} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{active?.label}</h2>
                        <p className="text-emerald-100 mt-1">{active?.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-8">
                    {/* Training Options */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Use this source for</h3>
                      <div className="grid sm:grid-cols-2 gap-5">
                        <label className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${active?.useForTone ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:bg-gray-50"}`}>
                          <input type="checkbox" checked={active?.useForTone} onChange={e => toggle(activeType, "useForTone", e.target.checked)} className="sr-only" />
                          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <div className="font-semibold">Tone & Style</div>
                            <div className="text-sm text-gray-600">Writing personality & voice</div>
                          </div>
                          {active?.useForTone && <Check className="ml-auto w-6 h-6 text-emerald-600" />}
                        </label>

                        <label className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${active?.useForKnowledge ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:bg-gray-50"}`}>
                          <input type="checkbox" checked={active?.useForKnowledge} onChange={e => toggle(activeType, "useForKnowledge", e.target.checked)} className="sr-only" />
                          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                            <Brain className="w-6 h-6 text-teal-600" />
                          </div>
                          <div>
                            <div className="font-semibold">Knowledge</div>
                            <div className="text-sm text-gray-600">Facts, info & expertise</div>
                          </div>
                          {active?.useForKnowledge && <Check className="ml-auto w-6 h-6 text-teal-600" />}
                        </label>
                      </div>
                    </div>

                    {(active?.useForTone || active?.useForKnowledge) && (
                      <div className="space-y-6">
                        {active?.type === "manual" ? (
                          <div>
                            <label className="block text-lg font-semibold mb-3">Custom Content</label>
                            <textarea
                              value={active?.manualContent}
                              onChange={e => updateManual(activeType, e.target.value)}
                              rows={10}
                              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                              placeholder="Paste Q&A, tone examples, facts..."
                            />
                          </div>
                        ) : active?.hasItems && (
                          <div>
                            <label className="block text-lg font-semibold mb-3">
                              Select Items <span className="text-gray-500 font-normal">(optional)</span>
                            </label>
                            <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-xl p-2">
                              {loadingItems ? (
                                <div className="py-12 text-center">
                                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
                                </div>
                              ) : active?.items?.length ? (
                                active?.items.map(item => {
                                  const checked = active?.selectedIds.includes(item.id);
                                  return (
                                    <label key={item.id} className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${checked ? "bg-emerald-50 border-emerald-300" : "border-gray-200 hover:bg-gray-50"}`}>
                                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${checked ? "bg-emerald-600 border-emerald-600" : "border-gray-300"}`}>
                                        {checked && <Check className="w-4 h-4 text-white" />}
                                      </div>
                                      <span className="flex-1 text-sm font-medium text-gray-700">{item.title}</span>
                                      <input type="checkbox" checked={checked} onChange={e => toggleItem(activeType, item.id, e.target.checked)} className="sr-only" />
                                    </label>
                                  );
                                })
                              ) : (
                                <div className="py-12 text-center text-gray-500">No items found</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </main>
          </div>
        )}

        {/* MANAGE VIEW */}
        {view === "manage" && (
          <div className="rounded-2xl bg-white shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Active Training Sources</h2>
              <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-semibold">
                {backendSources.length} active
              </span>
            </div>
            {backendSources.length === 0 ? (
              <div className="text-center py-20">
                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No active sources yet</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {backendSources.map(src => {
                  const cfg = CONFIG.find(c => c.type === src.source_type);
                  const Icon = cfg?.icon || Book;
                  return (
                    <div key={src.id} className="p-5 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-emerald-700" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{cfg?.label || src.source_type}</div>
                            <div className="flex gap-2 mt-2">
                              {src.include_for_tone && <span className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-full">Tone</span>}
                              {src.include_for_knowledge && <span className="px-3 py-1 bg-teal-600 text-white text-xs rounded-full">Knowledge</span>}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => deleteSource(src.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Save Button */}
      {view === "config" && (
        <>
          <div className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 z-50 lg:hidden">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <button
                onClick={save}
                disabled={saving || activeCount === 0}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Starting Training...
                  </>
                ) : (
                  <>Save & Train Avatar</>
                )}
              </button>
            </div>
          </div>

          <div className="hidden lg:flex justify-end mt-10">
            <button
              onClick={save}
              disabled={saving || activeCount === 0}
              className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xl flex items-center gap-4"
            >
              {saving ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Starting Training...
                </>
              ) : (
                <>Save & Train Avatar</>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}