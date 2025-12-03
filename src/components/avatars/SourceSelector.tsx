"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from '@/context/AuthContext';
import {
  Book, Calendar, CheckSquare, Upload, Type,
  Brain, ChevronRight, Trash2, Loader2, Sparkles,
  BookOpen, Check, ArrowLeft
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
  { type: "manual", label: "Custom Text", description: "Add your own content", icon: Type, isEnabled: false, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: false, manualContent: "" },
];

const ENDPOINTS: Record<string, string> = {
  notes: "notes/",
  reminders: "reminders/",
  todos: "todos/",
  uploads: "files/",
};

export default function SourceSelector({ avatarHandle, onSaveSuccess }: Props) {
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
  }, [accessToken, view, fetchItems, fetchBackendSources]);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">

        {/* Header */}
        <header className="mb-6 md:mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Training Studio</h1>
                <p className="text-sm text-gray-500">Configure learning sources</p>
              </div>
            </div>

            <button
              onClick={() => { setView(view === "config" ? "manage" : "config"); setActiveType(null); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {view === "config" ? "View Active" : "Add Sources"}
            </button>
          </div>

          {view === "config" && (
            <div className="flex items-center gap-4 px-4 py-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-gray-600">
                  <strong className="font-medium text-gray-900">{activeCount}</strong> selected
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Training Mode</span>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        {view === "config" ? (
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Source List */}
            <aside className={`lg:w-80 flex-shrink-0 ${activeType ? 'hidden lg:block' : 'block'}`}>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900">Data Sources</h2>
                </div>
                <nav className="divide-y divide-gray-100">
                  {sources.map(s => {
                    const Icon = s.icon;
                    const isActive = s.useForTone || s.useForKnowledge;
                    const isSelected = activeType === s.type;
                    
                    return (
                      <button
                        key={s.type}
                        onClick={() => { setActiveType(s.type); if (s.hasItems && !s.items) fetchItems(s.type); }}
                        className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-emerald-50 border-l-4 border-emerald-600' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                            isActive ? 'bg-emerald-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-500'}`} />
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <div className="font-medium text-sm text-gray-900">{s.label}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{s.description}</div>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'text-emerald-600 translate-x-1' : 'text-gray-400'}`} />
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Detail Panel */}
            <main className={`flex-1 min-w-0 ${activeType ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {!activeType ? (
                  <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
                      <Brain className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Source</h3>
                    <p className="text-gray-500">Choose a data source from the left to configure training</p>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 md:p-7">
                      <button 
                        onClick={() => setActiveType(null)} 
                        className="lg:hidden flex items-center gap-2 text-white/90 hover:text-white mb-4 text-sm font-medium"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        Back to sources
                      </button>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                          <IconComponent type={active?.type ?? "notes"} />
                        </div>
                        <div className="text-white">
                          <h3 className="text-xl font-bold">{active?.label}</h3>
                          <p className="text-emerald-100 text-sm mt-1">{active?.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Scrollable Content Area (Full Page Scroll) */}
                    <div className="p-6 md:p-8 space-y-8">
                      
                      {/* Training Type */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">How should this source be used?</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <label className={`relative flex items-start p-5 rounded-xl border-2 cursor-pointer transition-all ${
                            active?.useForTone ? 'bg-emerald-50 border-emerald-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <input type="checkbox" checked={active?.useForTone} onChange={e => toggle(activeType!, "useForTone", e.target.checked)} className="sr-only" />
                            <div className="flex items-center gap-4 flex-1">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                active?.useForTone ? 'bg-emerald-100' : 'bg-gray-100'
                              }`}>
                                <Sparkles className={`w-6 h-6 ${active?.useForTone ? 'text-emerald-600' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">Tone & Style</div>
                                <div className="text-sm text-gray-600 mt-1">Learn your writing voice and personality</div>
                              </div>
                            </div>
                            {active?.useForTone && <Check className="w-5 h-5 text-emerald-600" />}
                          </label>

                          <label className={`relative flex items-start p-5 rounded-xl border-2 cursor-pointer transition-all ${
                            active?.useForKnowledge ? 'bg-teal-50 border-teal-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <input type="checkbox" checked={active?.useForKnowledge} onChange={e => toggle(activeType!, "useForKnowledge", e.target.checked)} className="sr-only" />
                            <div className="flex items-center gap-4 flex-1">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                active?.useForKnowledge ? 'bg-teal-100' : 'bg-gray-100'
                              }`}>
                                <Brain className={`w-6 h-6 ${active?.useForKnowledge ? 'text-teal-600' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">Knowledge</div>
                                <div className="text-sm text-gray-600 mt-1">Teach facts, preferences, and expertise</div>
                              </div>
                            </div>
                            {active?.useForKnowledge && <Check className="w-5 h-5 text-teal-600" />}
                          </label>
                        </div>
                      </div>

                      {/* Content Selection - NO inner scroll! */}
                      {(active?.useForTone || active?.useForKnowledge) && (
                        <div className="space-y-6">
                          {active?.type === "manual" ? (
                            <div>
                              <h4 className="text-lg font-semibold text-gray-800 mb-4">Custom Training Content</h4>
                              <textarea
                                value={active?.manualContent}
                                onChange={e => updateManual(activeType!, e.target.value)}
                                rows={10}
                                className="w-full p-4 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none font-mono text-gray-700"
                                placeholder="Paste Q&A, writing samples, facts, or guidelines..."
                              />
                            </div>
                          ) : active?.hasItems ? (
                            <div>
                              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                Select Specific Items <span className="text-gray-500 font-normal">(optional)</span>
                              </h4>
                              <div className="space-y-1">
                                {loading ? (
                                  <div className="py-16 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
                                    <p className="text-gray-500">Loading your items...</p>
                                  </div>
                                ) : active?.items?.length ? (
                                  active?.items.map(item => {
                                    const isSelected = active?.selectedIds.includes(item.id);
                                    return (
                                      <label 
                                        key={item.id} 
                                        className={`flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer hover:bg-gray-50 ${
                                          isSelected ? 'bg-emerald-50 border-emerald-300 shadow-sm' : 'border-gray-200'
                                        }`}
                                      >
                                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                          isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'
                                        }`}>
                                          {isSelected && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 flex-1">{item.title}</span>
                                        <input type="checkbox" checked={isSelected} onChange={e => toggleItem(activeType!, item.id, e.target.checked)} className="sr-only" />
                                      </label>
                                    );
                                  })
                                ) : (
                                  <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
                                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                      <IconComponent type={activeType!} />
                                    </div>
                                    <p className="text-gray-500">No items found</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </main>
          </div>
        ) : (
          /* Manage View - unchanged */
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Active Training Sources</h2>
              <span className="text-sm text-gray-500">{backendSources.length} active</span>
            </div>
            {backendSources.length === 0 ? (
              <div className="py-20 text-center">
                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No active sources yet</p>
              </div>
            ) : (
              <div className="p-5 grid sm:grid-cols-2 gap-4">
                {backendSources.map(src => {
                  const cfg = CONFIG.find(c => c.type === src.source_type);
                  const Icon = cfg?.icon || Book;
                  return (
                    <div key={src.id} className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">{cfg?.label || src.source_type}</div>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {src.include_for_tone && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">Tone</span>}
                            {src.include_for_knowledge && <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">Knowledge</span>}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => deleteSource(src.id)} className="ml-3 text-red-600 hover:text-red-700">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Fixed Save Button (Mobile) */}
        {view === "config" && (
          <>
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur border-t border-gray-200 z-50 lg:hidden">
              <button
                onClick={save}
                disabled={saving || activeCount === 0}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg"
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

            <div className="hidden lg:block mt-10 text-right">
              <button
                onClick={save}
                disabled={saving || activeCount === 0}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center gap-3 transition-all shadow-lg"
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

            <div className="h-24 lg:hidden" />
          </>
        )}
      </div>
    </div>
  );
}