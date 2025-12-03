"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Book, Calendar, CheckSquare, Upload, Type,
  Brain, ChevronRight, Trash2, Loader2, Sparkles,
  BookOpen, Check, ArrowLeft, AlertCircle
} from "lucide-react";

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
  const [sources, setSources] = useState(CONFIG);
  const [backendSources, setBackendSources] = useState<BackendSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeType, setActiveType] = useState<SourceType | null>(null);
  const [view, setView] = useState<"config" | "manage">("config");

  const active = sources.find(s => s.type === activeType);
  const activeCount = sources.filter(s => s.useForTone || s.useForKnowledge).length;

  // Mock fetch functions for demo
  const fetchItems = useCallback(async (type: SourceType) => {
    const endpoint = ENDPOINTS[type];
    if (!endpoint) return;
    const src = sources.find(s => s.type === type);
    if (src?.items) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockItems = Array.from({ length: 8 }, (_, i) => ({
        id: `${type}-${i}`,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Item ${i + 1}`
      }));
      setSources(prev => prev.map(s => s.type === type ? { ...s, items: mockItems } : s));
      setLoading(false);
    }, 500);
  }, [sources]);

  const fetchBackendSources = useCallback(async () => {
    setLoading(true);
    setTimeout(() => {
      setBackendSources([
        { id: "1", source_type: "notes", include_for_tone: true, include_for_knowledge: false },
        { id: "2", source_type: "uploads", include_for_tone: false, include_for_knowledge: true },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const deleteSource = async (id: string) => {
    if (!confirm("Remove this source from training?")) return;
    setSaving(true);
    setTimeout(() => {
      setBackendSources(prev => prev.filter(s => s.id !== id));
      setSaving(false);
      onSaveSuccess();
    }, 500);
  };

  useEffect(() => {
    fetchItems("notes");
    fetchItems("uploads");
    if (view === "manage") fetchBackendSources();
  }, [view, fetchItems, fetchBackendSources]);

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
    if (activeCount === 0) {
      alert("Select at least one source");
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSaveSuccess();
    }, 1000);
  };

  const IconComponent = ({ type }: { type: SourceType }) => {
    const C = CONFIG.find(c => c.type === type)?.icon || Book;
    return <C className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-600/20">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Training Studio</h1>
                <p className="text-sm text-gray-600 mt-0.5">Configure your avatar's learning sources</p>
              </div>
            </div>

            <button
              onClick={() => { setView(view === "config" ? "manage" : "config"); setActiveType(null); }}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
            >
              {view === "config" ? "View Active Sources" : "Configure Sources"}
            </button>
          </div>

          {view === "config" && (
            <div className="flex items-center gap-6 px-5 py-4 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm text-gray-600">
                  <strong className="font-semibold text-gray-900">{activeCount}</strong> source{activeCount !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="w-px h-5 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Training Mode</span>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        {view === "config" ? (
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Source List */}
            <aside className={`lg:w-96 flex-shrink-0 ${activeType ? 'hidden lg:block' : 'block'}`}>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-semibold text-gray-900">Data Sources</h2>
                  <p className="text-xs text-gray-500 mt-1">Select a source to configure</p>
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
                        className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-all group ${
                          isSelected ? 'bg-emerald-50 border-l-4 border-emerald-600' : 'border-l-4 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                            isActive ? 'bg-emerald-100' : 'bg-gray-100 group-hover:bg-gray-200'
                          }`}>
                            <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-500'}`} />
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <div className="font-medium text-sm text-gray-900 truncate">{s.label}</div>
                            <div className="text-xs text-gray-500 truncate mt-0.5">{s.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isActive && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                          <ChevronRight className={`w-5 h-5 transition-colors ${isSelected ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Detail Panel */}
            <main className={`flex-1 min-w-0 ${activeType ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {!activeType ? (
                  <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-5">
                      <Brain className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Data Source</h3>
                    <p className="text-sm text-gray-500 max-w-sm">Choose a source from the left sidebar to configure its training settings</p>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-6">
                      <button 
                        onClick={() => setActiveType(null)} 
                        className="lg:hidden flex items-center gap-2 text-white/90 hover:text-white mb-4 text-sm font-medium transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Sources
                      </button>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                          {active && <IconComponent type={active.type} />}
                        </div>
                        <div className="text-white min-w-0">
                          <h3 className="font-bold text-xl mb-1">{active?.label}</h3>
                          <p className="text-emerald-100 text-sm">{active?.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-8">
                      
                      {/* Training Options */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <h4 className="text-sm font-semibold text-gray-900">Training Type</h4>
                          <div className="flex-1 h-px bg-gray-200"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          <label className={`relative flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            active?.useForTone 
                              ? 'bg-emerald-50 border-emerald-500 shadow-sm' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}>
                            <input 
                              type="checkbox" 
                              checked={active?.useForTone} 
                              onChange={e => activeType && toggle(activeType, "useForTone", e.target.checked)} 
                              className="sr-only" 
                            />
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                                active?.useForTone ? 'bg-emerald-100' : 'bg-gray-100'
                              }`}>
                                <Sparkles className={`w-5 h-5 transition-colors ${active?.useForTone ? 'text-emerald-600' : 'text-gray-400'}`} />
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-sm text-gray-900">Tone & Style</div>
                                <div className="text-xs text-gray-500 mt-0.5">Learn writing personality</div>
                              </div>
                            </div>
                            {active?.useForTone && (
                              <div className="absolute top-3 right-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            )}
                          </label>

                          <label className={`relative flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            active?.useForKnowledge 
                              ? 'bg-teal-50 border-teal-500 shadow-sm' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}>
                            <input 
                              type="checkbox" 
                              checked={active?.useForKnowledge} 
                              onChange={e => activeType && toggle(activeType, "useForKnowledge", e.target.checked)} 
                              className="sr-only" 
                            />
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                                active?.useForKnowledge ? 'bg-teal-100' : 'bg-gray-100'
                              }`}>
                                <Brain className={`w-5 h-5 transition-colors ${active?.useForKnowledge ? 'text-teal-600' : 'text-gray-400'}`} />
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-sm text-gray-900">Knowledge Base</div>
                                <div className="text-xs text-gray-500 mt-0.5">Learn facts & information</div>
                              </div>
                            </div>
                            {active?.useForKnowledge && (
                              <div className="absolute top-3 right-3">
                                <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Content Selection */}
                      {(active?.useForTone || active?.useForKnowledge) && (
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {active?.type === "manual" ? "Your Content" : "Select Items"}
                            </h4>
                            {active?.hasItems && (
                              <span className="text-xs text-gray-500 font-normal">(optional - leave empty to use all)</span>
                            )}
                            <div className="flex-1 h-px bg-gray-200"></div>
                          </div>

                          {active?.type === "manual" ? (
                            <div className="relative">
                              <textarea
                                value={active?.manualContent}
                                onChange={e => activeType && updateManual(activeType, e.target.value)}
                                rows={10}
                                className="w-full p-4 border-2 border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-all"
                                placeholder="Paste Q&A pairs, tone examples, or knowledge content here...&#10;&#10;Example:&#10;Q: How do you handle deadlines?&#10;A: I prioritize tasks and break them into manageable steps..."
                              />
                              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                {active?.manualContent.length} characters
                              </div>
                            </div>
                          ) : active.hasItems ? (
                            <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
                              {loading ? (
                                <div className="py-16 text-center bg-gray-50">
                                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
                                  <p className="text-sm font-medium text-gray-600">Loading items...</p>
                                </div>
                              ) : active.items?.length ? (
                                <div className="max-h-80 overflow-y-auto">
                                  <div className="divide-y divide-gray-100">
                                    {active.items.map(item => {
                                      const isSelected = active.selectedIds.includes(item.id);
                                      return (
                                        <label 
                                          key={item.id} 
                                          className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                            isSelected ? 'bg-emerald-50' : ''
                                          }`}
                                        >
                                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                            isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'
                                          }`}>
                                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                          </div>
                                          <span className="text-sm text-gray-700 flex-1 truncate font-medium">{item.title}</span>
                                          <input 
                                            type="checkbox" 
                                            checked={isSelected} 
                                            onChange={e => activeType && toggleItem(activeType, item.id, e.target.checked)} 
                                            className="sr-only" 
                                          />
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <div className="py-16 text-center bg-gray-50">
                                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                    {activeType && <IconComponent type={activeType} />}
                                  </div>
                                  <p className="text-sm font-medium text-gray-600 mb-1">No items found</p>
                                  <p className="text-xs text-gray-500">Add some {active?.label.toLowerCase()} to get started</p>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      )}

                      {/* Info Banner */}
                      {(active?.useForTone || active?.useForKnowledge) && (
                        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-blue-900">
                            <p className="font-medium mb-1">Training will begin after saving</p>
                            <p className="text-blue-700">Your avatar will learn from this source and incorporate it into responses.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </main>
          </div>
        ) : (
          /* Manage View */
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
              <div>
                <h2 className="font-semibold text-gray-900">Active Training Sources</h2>
                <p className="text-xs text-gray-500 mt-1">Currently training your avatar</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-lg">
                {backendSources.length} active
              </span>
            </div>
            {backendSources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-5">
                  <Sparkles className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Sources</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-sm">Start training your avatar by adding learning sources</p>
                <button 
                  onClick={() => setView("config")} 
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                >
                  Add Training Sources
                </button>
              </div>
            ) : (
              <div className="p-5">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {backendSources.map(src => {
                    const cfg = CONFIG.find(c => c.type === src.source_type);
                    const Icon = cfg?.icon || Book;
                    return (
                      <div key={src.id} className="relative group">
                        <div className="flex items-start justify-between p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-200 rounded-xl transition-all hover:shadow-md">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 border border-emerald-200">
                              <Icon className="w-5 h-5 text-emerald-700" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-sm text-gray-900 truncate mb-2">{cfg?.label || src.source_type}</div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {src.include_for_tone && (
                                  <span className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-medium rounded-lg">Tone</span>
                                )}
                                {src.include_for_knowledge && (
                                  <span className="px-2.5 py-1 bg-teal-600 text-white text-xs font-medium rounded-lg">Knowledge</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => deleteSource(src.id)} 
                            disabled={saving}
                            className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-100 transition-all disabled:opacity-50 flex-shrink-0 ml-2"
                            title="Remove source"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        {view === "config" && (
          <>
            {/* Mobile Fixed Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 lg:hidden z-50 shadow-lg">
              <button
                onClick={save}
                disabled={saving || loading || activeCount === 0}
                className="w-full px-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Training...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Save & Train
                  </>
                )}
              </button>
            </div>

            {/* Desktop Button */}
            <div className="hidden lg:flex justify-end mt-8">
              <button
                onClick={save}
                disabled={saving || loading || activeCount === 0}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center gap-3 transition-all shadow-lg shadow-emerald-600/30 min-w-64 justify-center"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Training Avatar...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Save & Train Avatar
                  </>
                )}
              </button>
            </div>

            {/* Mobile spacing */}
            <div className="h-24 lg:hidden"></div>
          </>
        )}
      </div>
    </div>
  );
}