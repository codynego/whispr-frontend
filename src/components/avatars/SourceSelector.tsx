"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from '@/context/AuthContext';
import {
  Book, Calendar, CheckSquare, Upload, Mail, Globe, Type,
  Brain, ChevronRight, ArrowLeft, Trash2, List, Save, Loader2, CheckCircle2, Circle
} from "lucide-react";
import toast from "react-hot-toast";

type SourceType = "notes" | "reminders" | "todos" | "uploads" | "gmail" | "website" | "manual";

interface Item { id: string | number; title: string; }
interface BackendSource { id: string; source_type: SourceType; include_for_tone: boolean; include_for_knowledge: boolean; }

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
  { type: "manual", label: "Manual Entry", icon: Type, isEnabled: false, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: false, manualContent: "" },
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
        title: i.title || i.name || "Untitled"
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
      if (res.ok) setBackendSources(await res.json());
    } catch {
      toast.error("Failed to load sources");
    } finally {
      setLoading(false);
    }
  }, [accessToken, avatarHandle]);

  const deleteSource = async (id: string) => {
    if (!confirm("Remove this source from training?")) return;
    setSaving(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/sources/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setBackendSources(prev => prev.filter(s => s.id !== id));
      toast.success("Source removed");
      onSaveSuccess();
    } catch {
      toast.error("Failed to remove");
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

  const save = async () => {
    if (!accessToken) return;
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      const count = sources.filter(s => s.useForTone || s.useForKnowledge).length;
      if (count === 0) throw new Error("Select at least one source");
      toast.success(`Training started with ${count} source${count > 1 ? "s" : ""}`);
      fetchBackendSources();
      onSaveSuccess();
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const Icon = ({ type }: { type: SourceType }) => {
    const C = CONFIG.find(c => c.type === type)?.icon || Book;
    return <C className="w-5 h-5 text-emerald-600" />;
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Brain className="w-10 h-10" />
              <div>
                <h2 className="text-2xl font-bold">Train Your Avatar</h2>
                <p className="text-emerald-100 text-sm">Choose what your AI learns from</p>
              </div>
            </div>
            <button
              onClick={() => { setView(view === "config" ? "manage" : "config"); setActiveType(null); }}
              className="px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition"
            >
              {view === "config" ? "Manage Sources" : "Add Sources"}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 pb-24 md:pb-6">
          {view === "config" ? (
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Source List */}
              <div className={`lg:col-span-5 space-y-3 ${activeType ? "hidden lg:block" : "block"}`}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Sources</h3>
                <div className="space-y-3">
                  {sources.map(s => (
                    <button
                      key={s.type}
                      onClick={() => { setActiveType(s.type); if (s.hasItems && !s.items) fetchItems(s.type); }}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                        activeType === s.type
                          ? "bg-emerald-50 border-emerald-500 shadow-md"
                          : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-emerald-100 rounded-lg">
                            <Icon type={s.type} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{s.label}</div>
                            <div className="text-xs text-gray-500">
                              {s.useForTone && "Tone"} {s.useForTone && s.useForKnowledge && "· "} {s.useForKnowledge && "Knowledge"}
                              {!s.useForTone && !s.useForKnowledge && "Not used"}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 transition ${activeType === s.type ? "text-emerald-600" : "text-gray-400"}`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail Panel */}
              <div className={`lg:col-span-7 ${activeType ? "block" : "hidden lg:block"}`}>
                {!activeType ? (
                  <div className="text-center py-20 text-gray-400">
                    <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Brain className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium">Select a source to configure</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Back button on mobile */}
                    <button onClick={() => setActiveType(null)} className="lg:hidden flex items-center gap-2 text-gray-600 mb-4">
                      <ArrowLeft className="w-5 h-5" /> Back
                    </button>

                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 rounded-xl">
                        <Icon type={activeType} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{active?.label ?? ""}</h3>
                    </div>

                    {/* Tone / Knowledge */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                        <div className="flex items-center gap-3">
                          <Book className="w-5 h-5 text-emerald-600" />
                          <div>
                            <div className="font-medium">Tone & Style</div>
                            <div className="text-xs text-gray-600">How the AI speaks</div>
                          </div>
                        </div>
                        <input type="checkbox" checked={active?.useForTone} onChange={e => toggle(activeType, "useForTone", e.target.checked)}
                          className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                        <div className="flex items-center gap-3">
                          <Brain className="w-5 h-5 text-emerald-600" />
                          <div>
                            <div className="font-medium">Knowledge</div>
                            <div className="text-xs text-gray-600">Facts & answers</div>
                          </div>
                        </div>
                        <input type="checkbox" checked={active?.useForKnowledge} onChange={e => toggle(activeType, "useForKnowledge", e.target.checked)}
                          className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" />
                      </label>
                    </div>

                    {/* Manual or Item Selection */}
                    {(active?.useForTone || active?.useForKnowledge) && (
                      active?.type === "manual" ? (
                        <div className="bg-gray-50 rounded-2xl p-5">
                          <textarea
                            value={active?.manualContent}
                            onChange={e => updateManual(activeType, e.target.value)}
                            rows={8}
                            className="w-full p-4 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                            placeholder="Paste Q&A, tone examples, or knowledge here..."
                          />
                        </div>
                      ) : active.hasItems ? (
                        <div className="bg-gray-50 rounded-2xl p-5 max-h-96 overflow-y-auto">
                          <p className="text-sm font-medium text-gray-700 mb-3">Select items (optional)</p>
                          {loading ? (
                            <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" /></div>
                          ) : active.items?.length ? (
                            <div className="space-y-2">
                              {active.items.map(item => (
                                <label key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow cursor-pointer">
                                  <span className="text-sm text-gray-700 truncate pr-4">{item.title}</span>
                                  {active.selectedIds.includes(item.id) ? 
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : 
                                    <Circle className="w-5 h-5 text-gray-400" />
                                  }
                                  <input type="checkbox" checked={active.selectedIds.includes(item.id)}
                                    onChange={e => toggleItem(activeType, item.id, e.target.checked)} className="sr-only" />
                                </label>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No items found</p>
                          )}
                        </div>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Manage View */
            <div>
              <h3 className="text-lg font-semibold mb-5">Active Training Sources</h3>
              {backendSources.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <List className="w-10 h-10 text-gray-400" />
                  </div>
                  <p>No sources added yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {backendSources.map(src => {
                    const cfg = CONFIG.find(c => c.type === src.source_type);
                    const IconC = cfg?.icon || Book;
                    return (
                      <div key={src.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-emerald-100 rounded-lg"><IconC className="w-5 h-5 text-emerald-700" /></div>
                          <div>
                            <div className="font-medium">{cfg?.label || src.source_type}</div>
                            <div className="text-xs text-gray-600">
                              {src.include_for_tone && "Tone"} {src.include_for_tone && src.include_for_knowledge && "· "} {src.include_for_knowledge && "Knowledge"}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => deleteSource(src.id)} disabled={saving}
                          className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Save Button (Always Visible) */}
        {view === "config" && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:static md:border-0 md:p-0">
            <div className="max-w-6xl mx-auto flex justify-end">
              <button
                onClick={save}
                disabled={saving || loading}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-2xl flex items-center gap-3 shadow-2xl transition min-w-[220px] justify-center"
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
          </div>
        )}
      </div>
    </div>
  );
};