"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from '@/context/AuthContext';
import {
  Book, Calendar, CheckSquare, Upload, Mail, Globe, Type,
  Brain, ChevronRight, ArrowLeft, Trash2, List, Save, Loader2,
  CheckCircle2, Circle, X, Settings, FileText
} from "lucide-react";
import toast from "react-hot-toast";

type SourceType = "notes" | "reminders" | "todos" | "uploads" | "gmail" | "website" | "manual";

interface Item { id: string | number; title: string; }
interface BackendSource {
  id: string;
  source_type: SourceType;
  include_for_tone: boolean;
  include_for_knowledge: boolean;
}
interface SourceConfig {
  type: SourceType;
  label: string;
  icon: React.ElementType;
  useForTone: boolean;
  useForKnowledge: boolean;
  selectedIds: (string | number)[];
  items?: Item[];
  hasItems: boolean;
  manualContent: string;
}

const CONFIG: SourceConfig[] = [
  { type: "notes", label: "Whisone Notes", icon: Book, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: true, manualContent: "" },
  { type: "reminders", label: "Reminders", icon: Calendar, useForTone: false, useForKnowledge: false, selectedIds: [], hasItems: true, manualContent: "" },
  { type: "todos", label: "To-Dos", icon: CheckSquare, useForTone: false, useForKnowledge: false, selectedIds: [], hasItems: true, manualContent: "" },
  { type: "uploads", label: "File Uploads", icon: Upload, useForTone: true, useForKnowledge: false, selectedIds: [], hasItems: true, manualContent: "" },
  { type: "gmail", label: "Gmail", icon: Mail, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: false, manualContent: "" },
  { type: "website", label: "Website", icon: Globe, useForTone: false, useForKnowledge: false, selectedIds: [], hasItems: false, manualContent: "" },
  { type: "manual", label: "Manual Entry", icon: Type, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: false, manualContent: "" },
];

const ENDPOINTS: Record<string, string> = { notes: "notes/", reminders: "reminders/", todos: "todos/", uploads: "files/" };

const Icon = ({ type }: { type: SourceType }) => {
  const cfg = CONFIG.find(c => c.type === type);
  const C = cfg?.icon || Settings;
  return <C className="w-5 h-5" />;
};

const ManualDataEntry = ({ content, onChange }: { content: string; onChange: (v: string) => void }) => (
  <div className="space-y-3">
    <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
      <Type className="w-5 h-5 text-emerald-600" /> Manual Text Input
    </h4>
    <p className="text-sm text-gray-500">Add custom tone examples or knowledge directly.</p>
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      rows={10}
      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
      placeholder="Q: What is your favorite language?\nA: Python — clean and powerful!\n\nI speak casually, love emojis, and keep things concise."
    />
  </div>
);

const SourceDetail = ({
  active,
  toggle,
  updateManualContent,
  toggleItem,
  loading,
  onBack
}: {
  active: SourceConfig;
  toggle: (type: SourceType, field: "useForTone" | "useForKnowledge", value: boolean) => void;
  updateManualContent: (type: SourceType, content: string) => void;
  toggleItem: (type: SourceType, id: string | number, checked: boolean) => void;
  loading: boolean;
  onBack: () => void;
}) => {
  const isEnabled = active.useForTone || active.useForKnowledge;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <Icon type={active.type} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{active.label}</h3>
        </div>
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <X className="w-6 h-6 text-gray-500" />
        </button>
      </div>

      {/* Usage Mode */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-900 mb-4">Use this source for:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: "useForTone", label: "Tone & Style", icon: Book },
            { key: "useForKnowledge", label: "Knowledge", icon: Brain }
          ].map(({ key, label, icon: Ico }) => (
            <label
              key={key}
              className={`flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition
                ${active[key as keyof typeof active] ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
            >
              <input
                type="checkbox"
                checked={Boolean(active[key as keyof typeof active])}
                onChange={(e) => toggle(active.type, key as any, e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <div>
                <div className="font-medium flex items-center gap-2">
                  <Ico className="w-4 h-4 text-emerald-600" /> {label}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {label === "Tone & Style" ? "How your AI writes and speaks" : "Facts and info it should know"}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Content */}
      {isEnabled && (
        <>
          {active.type === "manual" ? (
            <ManualDataEntry content={active.manualContent} onChange={(c) => updateManualContent(active.type, c)} />
          ) : active.hasItems ? (
            <div className="flex-1 overflow-hidden flex flex-col">
              <p className="font-medium text-gray-900 mb-4">Select specific items (optional)</p>
              <div className="flex-1 overflow-y-auto space-y-2 pb-4">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  </div>
                ) : active.items?.length ? (
                  active.items.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                    >
                      <span className="text-sm text-gray-700 truncate pr-4">{item.title}</span>
                      <input
                        type="checkbox"
                        checked={active.selectedIds.includes(item.id)}
                        onChange={(e) => toggleItem(active.type, item.id, e.target.checked)}
                        className="sr-only"
                      />
                      {active.selectedIds.includes(item.id) ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </label>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No items available</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-4">Leave empty to include all items</p>
            </div>
          ) : (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
              This source is used in full — no item selection needed.
            </div>
          )}
        </>
      )}

      {/* Mobile Back Button */}
      <div className="mt-8 md:hidden">
        <button
          onClick={onBack}
          className="w-full py-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium flex items-center justify-center gap-2 transition"
        >
          <ArrowLeft className="w-5 h-5" /> Back to List
        </button>
      </div>
    </div>
  );
};

export const SourceSelector = ({ avatarHandle, onSaveSuccess }: { avatarHandle: string; onSaveSuccess: () => void }) => {
  const { accessToken } = useAuth();
  const [sources, setSources] = useState(CONFIG);
  const [backendSources, setBackendSources] = useState<BackendSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"config" | "manage">("config");
  const [activeType, setActiveType] = useState<SourceType | null>(null);

  const active = sources.find(s => s.type === activeType);

  const fetchItems = useCallback(async (type: SourceType) => {
    if (!accessToken) return;
    const src = sources.find(s => s.type === type);
    if (src?.items) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const mock: Record<SourceType, Item[]> = {
      notes: [{ id: 1, title: "Project Mars Notes" }, { id: 2, title: "Meeting Summary" }],
      reminders: [{ id: 3, title: "Call Sarah" }],
      todos: [{ id: 4, title: "Deploy v2" }],
      uploads: [{ id: 5, title: "Report.pdf" }],
      gmail: [], website: [], manual: []
    };
    setSources(prev => prev.map(s => s.type === type ? { ...s, items: mock[type] || [] } : s));
    setLoading(false);
  }, [accessToken, sources]);

  const toggle = (type: SourceType, field: "useForTone" | "useForKnowledge", value: boolean) => {
    setSources(prev => prev.map(s => s.type === type ? { ...s, [field]: value } : s));
  };

  const toggleItem = (type: SourceType, id: string | number, checked: boolean) => {
    setSources(prev => prev.map(s =>
      s.type === type
        ? { ...s, selectedIds: checked ? [...s.selectedIds, id] : s.selectedIds.filter(x => x !== id) }
        : s
    ));
  };

  const updateManualContent = (type: SourceType, content: string) => {
    setSources(prev => prev.map(s => s.type === type ? { ...s, manualContent: content } : s));
  };

  const save = async () => {
    if (!accessToken) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    const activeCount = sources.filter(s => s.useForTone || s.useForKnowledge || (s.type === "manual" && s.manualContent.trim())).length;
    if (activeCount === 0) {
      toast.error("Select at least one source");
      setSaving(false);
      return;
    }
    toast.success(`${activeCount} source(s) saved & training started`);
    onSaveSuccess();
    setSaving(false);
  };

  useEffect(() => {
    if (accessToken) {
      CONFIG.filter(c => c.hasItems).forEach(c => fetchItems(c.type));
    }
  }, [accessToken, fetchItems]);

  const isDetail = view === "config" && activeType !== null;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Brain className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Avatar Training Data</h1>
                <p className="text-gray-600">Shape your AI's knowledge and personality</p>
              </div>
            </div>
            <button
              onClick={() => { setView(view === "config" ? "manage" : "config"); setActiveType(null); }}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition flex items-center gap-2"
            >
              <List className="w-5 h-5" />
              {view === "config" ? "Manage" : "Add Sources"}
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          {view === "config" ? (
            <div className="grid md:grid-cols-12 gap-8">
              {/* Source List */}
              <div className={`md:col-span-5 ${isDetail ? 'hidden md:block' : 'block'}`}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit">
                  <h2 className="text-xl font-semibold mb-6">Data Sources</h2>
                  <div className="space-y-3">
                    {sources.map(s => {
                      const enabled = s.useForTone || s.useForKnowledge;
                      return (
                        <button
                          key={s.type}
                          onClick={() => { setActiveType(s.type); if (s.hasItems && !s.items) fetchItems(s.type); }}
                          className={`w-full text-left p-5 rounded-xl border transition-all
                            ${activeType === s.type ? 'bg-emerald-50 border-emerald-400 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 bg-emerald-100 rounded-lg">
                                <Icon type={s.type} />
                              </div>
                              <div>
                                <div className="font-medium">{s.label}</div>
                                <div className={`text-xs mt-1 ${enabled ? 'text-emerald-700 font-medium' : 'text-gray-500'}`}>
                                  {enabled ? `${s.useForTone ? 'Tone' : ''}${s.useForTone && s.useForKnowledge ? ' & ' : ''}${s.useForKnowledge ? 'Knowledge' : ''}` : 'Not used'}
                                </div>
                              </div>
                            </div>
                            <ChevronRight className={`w-5 h-5 ${activeType === s.type ? 'text-emerald-600' : 'text-gray-400'}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Detail Panel */}
              <div className={`md:col-span-7 ${isDetail ? 'fixed inset-0 z-50 bg-gray-50 md:static md:bg-transparent overflow-y-auto' : 'hidden md:block'}`}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full p-8 md:p-10">
                  {!active ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                      <Settings className="w-16 h-16 mb-4" />
                      <p className="text-xl font-medium">Select a source to configure</p>
                    </div>
                  ) : (
                    <SourceDetail
                      active={active}
                      toggle={toggle}
                      updateManualContent={updateManualContent}
                      toggleItem={toggleItem}
                      loading={loading}
                      onBack={() => setActiveType(null)}
                    />
                  )}
                </div>
              </div>

              {/* Sticky Save Button - Always Visible */}
              <div className="md:col-span-12">
                <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 md:static md:border-0 md:p-0 ${isDetail ? 'block' : 'md:block'}`}>
                  <div className="max-w-5xl mx-auto flex justify-end">
                    <button
                      onClick={save}
                      disabled={saving}
                      className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold rounded-xl shadow-lg flex items-center gap-3 transition"
                    >
                      {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                      {saving ? "Saving..." : "Save & Train Avatar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Manage View */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold mb-6">Active Training Sources</h2>
              {backendSources.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No active sources yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {backendSources.map(src => {
                    const cfg = CONFIG.find(c => c.type === src.source_type);
                    const IconC = cfg?.icon || FileText;
                    return (
                      <div key={src.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-emerald-100 rounded-lg"><IconC className="w-6 h-6 text-emerald-700" /></div>
                          <div>
                            <div className="font-medium">{cfg?.label}</div>
                            <div className="text-sm text-emerald-700">
                              {src.include_for_tone && "Tone"}{src.include_for_tone && src.include_for_knowledge && " & "}{src.include_for_knowledge && "Knowledge"}
                            </div>
                          </div>
                        </div>
                        <button className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition">
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
      </div>
    </>
  );
};