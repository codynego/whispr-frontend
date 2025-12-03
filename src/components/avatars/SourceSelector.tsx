"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from '@/context/AuthContext';
import {
  Book, Calendar, CheckSquare, Upload, Mail, Globe, Type,
  Brain, ChevronRight, ArrowLeft, Trash2, Save, Loader2, Sparkles,
  BookOpen, Zap, Plus, Check
} from "lucide-react";
import toast from "react-hot-toast";

type SourceType = "notes" | "reminders" | "todos" | "uploads" | "gmail" | "website" | "manual";

interface Item { id: string | number; title: string; }
interface BackendSource { id: string; source_type: SourceType; include_for_tone: boolean; include_for_knowledge: boolean; }

interface SourceConfig {
  type: SourceType;
  label: string;
  description: string;
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
  { type: "notes", label: "Notes", description: "Personal notes & documents", icon: Book, isEnabled: false, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: true, manualContent: "" },
  { type: "reminders", label: "Reminders", description: "Tasks & reminders", icon: Calendar, isEnabled: false, useForTone: false, useForKnowledge: false, selectedIds: [], hasItems: true, manualContent: "" },
  { type: "todos", label: "To-Dos", description: "Task lists & projects", icon: CheckSquare, isEnabled: false, useForTone: false, useForKnowledge: false, selectedIds: [], hasItems: true, manualContent: "" },
  { type: "uploads", label: "Files", description: "Uploaded documents", icon: Upload, isEnabled: false, useForTone: true, useForKnowledge: false, selectedIds: [], hasItems: true, manualContent: "" },
  { type: "gmail", label: "Gmail", description: "Email conversations", icon: Mail, isEnabled: false, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: false, manualContent: "" },
  { type: "website", label: "Website", description: "Web content & pages", icon: Globe, isEnabled: false, useForTone: false, useForKnowledge: false, selectedIds: [], hasItems: false, manualContent: "" },
  { type: "manual", label: "Custom Text", description: "Add your own content", icon: Type, isEnabled: false, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: false, manualContent: "" },
];

const ENDPOINTS: Record<string, string> = {
  notes: "notes/",
  reminders: "reminders/",
  todos: "todos/",
  uploads: "files/",
};

export const SourceSelector = ({ avatarHandle, onSaveSuccess }: Props) => {
  const { accessToken } = useAuth();
  const [sources, setSources] = useState(CONFIG);
  const [backendSources, setBackendSources] = useState<BackendSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeType, setActiveType] = useState<SourceType | null>(null);
  const [view, setView] = useState<"config" | "manage">("config");

  const active = sources.find(s => s.type === activeType);
  const activeCount = sources.filter(s => s.useForTone || s.useForKnowledge).length;

  const fetchItems = useCallback(async (type: SourceType) => {
    const endpoint = ENDPOINTS[type];
    if (!endpoint || !accessToken) return;
    const src = sources.find(s => s.type === type);
    if (src?.items) return;

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/${endpoint}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const items = (data.results || data).map((i: any) => ({
        id: i.id,
        title: i.title || i.name || i.content?.slice(0, 50) || "Untitled"
      }));
      setSources(prev => prev.map(s => s.type === type ? { ...s, items } : s));
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
      if (res.ok) {
        const data = await res.json();
        setBackendSources(data);
      }
    } catch {
      toast.error("Failed to load active sources");
    } finally {
      setLoading(false);
    }
  }, [accessToken, avatarHandle]);

  const deleteSource = async (id: string) => {
    if (!confirm("Remove this source from training?")) return;
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/sources/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error();
      setBackendSources(prev => prev.filter(s => s.id !== id));
      toast.success("Source removed");
      onSaveSuccess();
    } catch {
      toast.error("Failed to remove source");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchItems("notes");
      fetchItems("uploads");
      if (view === "manage") fetchBackendSources();
    }
  }, [accessToken, view]);

  const toggle = (type: SourceType, field: "useForTone" | "useForKnowledge", value: boolean) => {
    setSources(prev => prev.map(s => {
      if (s.type !== type) return s;
      const updated = { ...s, [field]: value };
      return { ...updated, isEnabled: updated.useForTone || updated.useForKnowledge };
    }));
  };

  const toggleItem = (type: SourceType, id: string | number, checked: boolean) => {
    setSources(prev => prev.map(s => s.type === type ? {
      ...s,
      selectedIds: checked ? [...s.selectedIds, id] : s.selectedIds.filter(x => x !== id)
    } : s));
  };

  const updateManual = (type: SourceType, content: string) => {
    setSources(prev => prev.map(s => s.type === type ? { ...s, manualContent: content } : s));
  };

  // THIS IS THE REAL SAVE FUNCTION — NOW ACTUALLY SAVES TO API
  const save = async () => {
    if (!accessToken || activeCount === 0) {
      toast.error("Select at least one source");
      return;
    }

    setSaving(true);
    try {
      const payload = sources
        .filter(s => s.useForTone || s.useForKnowledge)
        .map(source => {
          const base = {
            source_type: source.type,
            include_for_tone: source.useForTone,
            include_for_knowledge: source.useForKnowledge,
            metadata: {} as any,
          };

          if (source.type === "manual" && source.manualContent.trim()) {
            base.metadata = { content: source.manualContent.trim() };
          } else if (source.hasItems && source.selectedIds.length > 0) {
            base.metadata = { item_ids: source.selectedIds };
          } else if (["gmail", "website"].includes(source.type)) {
            base.metadata = { full_sync: true };
          }

          return base;
        });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/sources/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to save sources");
      }

      await fetchBackendSources();
      toast.success(`Training started with ${payload.length} source${payload.length > 1 ? "s" : ""}`);
      onSaveSuccess();
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save training sources");
    } finally {
      setSaving(false);
    }
  };

  const IconComponent = ({ type }: { type: SourceType }) => {
    const C = CONFIG.find(c => c.type === type)?.icon || Book;
    return <C className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="w-full px-4 py-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  AI Training Studio
                </h1>
              </div>
              <p className="text-gray-600">Configure your avatar&apos;s learning sources</p>
            </div>

            <button
              onClick={() => { setView(view === "config" ? "manage" : "config"); setActiveType(null); }}
              className="px-5 py-3 bg-white hover:bg-gray-50 rounded-xl font-medium text-gray-700 shadow-md border border-gray-200 transition-all hover:shadow-lg flex items-center gap-2"
            >
              {view === "config" ? (
                <>View Active</>
              ) : (
                <>Add Sources</>
              )}
            </button>
          </div>

          {view === "config" && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{activeCount}</span> sources selected
                  </span>
                </div>
                <div className="hidden sm:block h-4 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-gray-600">Training Mode</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rest of your UI — unchanged but beautiful */}
        {view === "config" ? (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Source List */}
            <div className={`lg:col-span-4 ${activeType ? "hidden lg:block" : "block"}`}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  Data Sources
                </h2>
                <div className="space-y-2">
                  {sources.map(s => {
                    const Icon = s.icon;
                    const isActive = s.useForTone || s.useForKnowledge;
                    return (
                      <button
                        key={s.type}
                        onClick={() => { setActiveType(s.type); if (s.hasItems && !s.items) fetchItems(s.type); }}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all group ${
                          activeType === s.type
                            ? "bg-emerald-50 border-emerald-400 shadow-md"
                            : isActive
                            ? "border-emerald-200 bg-emerald-50/50 hover:border-emerald-300"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-lg ${isActive ? "bg-emerald-100" : "bg-gray-100"}`}>
                              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-gray-500"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-sm">{s.label}</div>
                              <div className="text-xs text-gray-500 truncate">{s.description}</div>
                            </div>
                          </div>
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                          <ChevronRight className={`w-4 h-4 ml-2 transition ${activeType === s.type ? "text-emerald-600" : "text-gray-400"}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detail Panel */}
            <div className={`lg:col-span-8 ${activeType ? "block" : "hidden lg:block"}`}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {!activeType ? (
                  <div className="text-center py-20 px-6">
                    <div className="bg-gradient-to-br from-emerald-100 to-teal-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Source</h3>
                    <p className="text-gray-500">Choose a data source from the left to configure it</p>
                  </div>
                ) : (
                  <div>
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
                      <button onClick={() => setActiveType(null)} className="lg:hidden flex items-center gap-2 text-white/90 hover:text-white mb-4 text-sm">
                        Back to sources
                      </button>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                          <IconComponent type={activeType} />
                        </div>
                        <div className="text-white">
                          <h3 className="text-xl font-bold">{active?.label}</h3>
                          <p className="text-emerald-100 text-sm">{active?.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Training Options */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Training Configuration</h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${active?.useForTone ? "bg-emerald-50 border-emerald-400" : "bg-gray-50 border-gray-200 hover:border-gray-300"}`}>
                            <input type="checkbox" checked={active?.useForTone} onChange={e => toggle(activeType, "useForTone", e.target.checked)} className="sr-only" />
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`p-2 rounded-lg ${active?.useForTone ? "bg-emerald-100" : "bg-white"}`}>
                                <Sparkles className={`w-4 h-4 ${active?.useForTone ? "text-emerald-600" : "text-gray-400"}`} />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm">Tone & Style</div>
                                <div className="text-xs text-gray-500">Writing personality</div>
                              </div>
                            </div>
                            {active?.useForTone && <Check className="w-5 h-5 text-emerald-600" />}
                          </label>

                          <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${active?.useForKnowledge ? "bg-teal-50 border-teal-400" : "bg-gray-50 border-gray-200 hover:border-gray-300"}`}>
                            <input type="checkbox" checked={active?.useForKnowledge} onChange={e => toggle(activeType, "useForKnowledge", e.target.checked)} className="sr-only" />
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`p-2 rounded-lg ${active?.useForKnowledge ? "bg-teal-100" : "bg-white"}`}>
                                <Brain className={`w-4 h-4 ${active?.useForKnowledge ? "text-teal-600" : "text-gray-400"}`} />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm">Knowledge Base</div>
                                <div className="text-xs text-gray-500">Facts & information</div>
                              </div>
                            </div>
                            {active?.useForKnowledge && <Check className="w-5 h-5 text-teal-600" />}
                          </label>
                        </div>
                      </div>

                      {/* Content Selection */}
                      {(active?.useForTone || active?.useForKnowledge) && (
                        <div>
                          {active?.type === "manual" ? (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">Add Your Content</h4>
                              <textarea
                                value={active?.manualContent}
                                onChange={e => updateManual(activeType, e.target.value)}
                                rows={10}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                placeholder="Paste Q&A pairs, tone examples, or any knowledge..."
                              />
                            </div>
                          ) : active.hasItems ? (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                Select Items <span className="text-gray-400 font-normal">(optional)</span>
                              </h4>
                              <div className="border-2 border-gray-200 rounded-xl p-4 max-h-80 overflow-y-auto">
                                {loading ? (
                                  <div className="py-12 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
                                    <p className="text-sm text-gray-500 mt-3">Loading items...</p>
                                  </div>
                                ) : active.items?.length ? (
                                  <div className="space-y-2">
                                    {active.items.map(item => {
                                      const isSelected = active.selectedIds.includes(item.id);
                                      return (
                                        <label key={item.id} className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? "bg-emerald-50 border-emerald-300" : "bg-white border-gray-200 hover:border-gray-300"}`}>
                                          <span className="text-sm text-gray-700 truncate pr-4 flex-1">{item.title}</span>
                                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-emerald-600 border-emerald-600" : "border-gray-300"}`}>
                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                          </div>
                                          <input type="checkbox" checked={isSelected} onChange={e => toggleItem(activeType, item.id, e.target.checked)} className="sr-only" />
                                        </label>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="py-12 text-center">
                                    <div className="bg-gray-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3">
                                      <IconComponent type={activeType} />
                                    </div>
                                    <p className="text-sm text-gray-500">No items found</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Manage View — unchanged */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Active Training Sources</h2>
              <div className="text-sm text-gray-500">{backendSources.length} sources</div>
            </div>
            {backendSources.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Sources</h3>
                <p className="text-gray-500 mb-6">Add sources to start training your avatar</p>
                <button onClick={() => setView("config")} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors inline-flex items-center gap-2">
                  Add Sources
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {backendSources.map(src => {
                  const cfg = CONFIG.find(c => c.type === src.source_type);
                  const Icon = cfg?.icon || Book;
                  return (
                    <div key={src.id} className="flex items-center justify-between p-4 bg-gradient-to-br from-emerald-50 to-white rounded-xl border-2 border-emerald-200">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2.5 bg-emerald-100 rounded-lg">
                          <Icon className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">{cfg?.label || src.source_type}</div>
                          <div className="text-xs text-gray-600 flex items-center gap-1.5 flex-wrap">
                            {src.include_for_tone && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">Tone</span>}
                            {src.include_for_knowledge && <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded">Knowledge</span>}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => deleteSource(src.id)} disabled={saving} className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Save Buttons */}
        {view === "config" && (
          <>
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 p-4 md:hidden z-50">
              <button
                onClick={save}
                disabled={saving || loading || activeCount === 0}
                className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-2xl transition-all"
              >
                {saving ? <>Training...</> : <>Save & Train Avatar</>}
              </button>
            </div>

            <div className="hidden md:flex justify-end mt-8">
              <button
                onClick={save}
                disabled={saving || loading || activeCount === 0}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center gap-3 shadow-xl transition-all min-w-[260px] justify-center"
              >
                {saving ? <>Training Avatar...</> : <>Save & Train Avatar</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};