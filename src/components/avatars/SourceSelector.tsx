"use client";

import React, { useState, useEffect, useCallback } from "react";
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

// Mock useAuth
const useAuth = () => ({ accessToken: "MOCK_TOKEN_123" });

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

const Icon = ({ type, className = "w-5 h-5 text-emerald-600" }: { type: SourceType; className?: string }) => {
  const cfg = CONFIG.find((c) => c.type === type);
  const C = cfg?.icon || Settings;
  return <C className={className} />;
};

const ManualDataEntry = ({ content, onChange }: { content: string; onChange: (v: string) => void }) => (
  <div className="space-y-3">
    <h4 className="font-semibold text-gray-900">Manual Text Input</h4>
    <p className="text-sm text-gray-600">Add Q&A pairs, tone examples, or custom knowledge.</p>
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      rows={10}
      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none bg-gray-50/50"
      placeholder="Example:

Q: What's your favorite language?
A: Python all the way — clean, powerful, and fun!

I’m friendly, casual, and love using emojis from time to time."
    />
  </div>
);

const SourceDetail = ({
  active,
  toggle,
  updateManualContent,
  toggleItem,
  loading,
  setActiveType,
}: {
  active: SourceConfig;
  toggle: (type: SourceType, field: "useForTone" | "useForKnowledge", value: boolean) => void;
  updateManualContent: (type: SourceType, content: string) => void;
  toggleItem: (type: SourceType, id: string | number, checked: boolean) => void;
  loading: boolean;
  setActiveType: (t: SourceType | null) => void;
}) => {
  const isEnabled = active.useForTone || active.useForKnowledge;

  return (
    <div className="space-y-6">
      {/* Mobile Back */}
      <button
        onClick={() => setActiveType(null)}
        className="md:hidden flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium -ml-2"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="flex items-center gap-4">
        <div className="p-3 bg-emerald-100 rounded-xl">
          <Icon type={active.type} className="w-7 h-7 text-emerald-700" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{active.label}</h2>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">How should this data be used?</h4>

        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
          <div className="flex items-center gap-3">
            <Book className="w-5 h-5 text-indigo-600" />
            <div>
              <div className="font-medium">Tone & Style</div>
              <div className="text-xs text-gray-600">How the AI speaks and writes</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={active.useForTone}
            onChange={(e) => toggle(active.type, "useForTone", e.target.checked)}
            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
          />
        </label>

        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-purple-600" />
            <div>
              <div className="font-medium">Knowledge</div>
              <div className="text-xs text-gray-600">Facts and content to answer questions</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={active.useForKnowledge}
            onChange={(e) => toggle(active.type, "useForKnowledge", e.target.checked)}
            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
          />
        </label>
      </div>

      {isEnabled && (
        <>
          {active.type === "manual" ? (
            <ManualDataEntry content={active.manualContent} onChange={(c) => updateManualContent(active.type, c)} />
          ) : active.hasItems ? (
            <div className="space-y-3">
              <p className="font-medium text-gray-900">Select items (optional)</p>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                  </div>
                ) : active.items?.length ? (
                  active.items.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
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
                  <p className="text-center text-gray-500 py-8 text-sm">No items available</p>
                )}
              </div>
              <p className="text-xs text-gray-500">Leave empty to include all items</p>
            </div>
          ) : (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-gray-700">
              <FileText className="w-4 h-4 inline mr-2 text-emerald-600" />
              This source is included entirely when enabled.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const SourceSelector = ({ avatarHandle, onSaveSuccess }: Props) => {
  const { accessToken } = useAuth();
  const [sources, setSources] = useState(CONFIG);
  const [backendSources, setBackendSources] = useState<BackendSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [panel, setPanel] = useState<"config" | "manage">("config");
  const [activeType, setActiveType] = useState<SourceType | null>(null);

  const active = sources.find((s) => s.type === activeType);
  const isDetailView = panel === "config" && activeType !== null;

  const fetchItems = useCallback(async (type: SourceType) => {
    const src = sources.find((s) => s.type === type);
    if (src?.items) return;

    setLoading(true);
    try {
      const MOCK_ITEMS: Item[] = Array.from({ length: 7 }, (_, i) => ({
        id: i + 1,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Item ${i + 1} — Long title example for testing overflow`,
      }));
      setSources((prev) => prev.map((s) => (s.type === type ? { ...s, items: MOCK_ITEMS } : s)));
    } finally {
      setLoading(false);
    }
  }, [sources]);

  const fetchBackendSources = useCallback(async () => {
    setLoading(true);
    try {
      const MOCK: BackendSource[] = [
        { id: "1", source_type: "notes", metadata: {}, include_for_tone: true, include_for_knowledge: true, created_at: "" },
        { id: "2", source_type: "uploads", metadata: {}, include_for_tone: true, include_for_knowledge: false, created_at: "" },
        { id: "3", source_type: "manual", metadata: {}, include_for_tone: true, include_for_knowledge: true, created_at: "" },
      ];
      setBackendSources(MOCK);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSource = async (id: string) => {
    if (!confirm("Remove this source from training?")) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setBackendSources((prev) => prev.filter((s) => s.id !== id));
    toast.success("Source removed");
    onSaveSuccess();
    setSaving(false);
  };

  useEffect(() => {
    if (accessToken) {
      fetchItems("notes");
      fetchBackendSources();
    }
  }, []);

  const toggle = (type: SourceType, field: "useForTone" | "useForKnowledge", value: boolean) => {
    setSources((prev) =>
      prev.map((s) => {
        if (s.type !== type) return s;
        const updated = { ...s, [field]: value };
        return { ...updated, isEnabled: updated.useForTone || updated.useForKnowledge };
      })
    );
  };

  const toggleItem = (type: SourceType, id: string | number, checked: boolean) => {
    setSources((prev) =>
      prev.map((s) =>
        s.type === type
          ? { ...s, selectedIds: checked ? [...s.selectedIds, id] : s.selectedIds.filter((x) => x !== id) }
          : s
      )
    );
  };

  const updateManualContent = (type: SourceType, content: string) => {
    setSources((prev) => prev.map((s) => (s.type === type ? { ...s, manualContent: content } : s)));
  };

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    const count = sources.filter((s) => s.useForTone || s.useForKnowledge).length;
    if (count === 0) {
      toast.error("Select at least one source");
      setSaving(false);
      return;
    }
    toast.success(`Training updated with ${count} source${count > 1 ? "s" : ""}`);
    fetchBackendSources();
    onSaveSuccess();
    setSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Brain className="w-10 h-10" />
              <div>
                <h1 className="text-2xl font-extrabold">Avatar Training Data</h1>
                <p className="text-emerald-100 text-sm">Shape your AI’s voice and knowledge</p>
              </div>
            </div>
            <button
              onClick={() => {
                setPanel(panel === "config" ? "manage" : "config");
                setActiveType(null);
              }}
              className="px-5 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl font-medium transition"
            >
              {panel === "config" ? "Manage Sources" : "Add Sources"}
            </button>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {panel === "config" ? (
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Source List */}
              <div className={`lg:col-span-5 space-y-4 ${isDetailView ? "hidden lg:block" : "block"}`}>
                <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                  <List className="w-5 h-5 text-emerald-600" /> Data Sources
                </h3>
                <div className="space-y-3">
                  {sources.map((s) => (
                    <button
                      key={s.type}
                      onClick={() => {
                        setActiveType(s.type);
                        if (s.hasItems && !s.items) fetchItems(s.type);
                      }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        activeType === s.type
                          ? "border-emerald-500 bg-emerald-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <Icon type={s.type} className="w-6 h-6 text-emerald-700" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{s.label}</div>
                            <div className="text-xs text-gray-600">
                              {s.useForTone || s.useForKnowledge
                                ? `${s.useForTone ? "Tone" : ""}${s.useForTone && s.useForKnowledge ? " · " : ""}${s.useForKnowledge ? "Knowledge" : ""}`
                                : "Not enabled"}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 transition ${activeType === s.type ? "text-emerald-600" : "text-gray-400"}`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail View */}
              <div className={`lg:col-span-7 ${isDetailView ? "block" : "hidden lg:block"}`}>
                {!active ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
                    <Settings className="w-16 h-16 mb-4 opacity-60" />
                    <p className="text-lg font-medium">Select a data source</p>
                    <p className="text-sm mt-1">Choose what shapes your AI</p>
                  </div>
                ) : (
                  <SourceDetail
                    active={active}
                    toggle={toggle}
                    updateManualContent={updateManualContent}
                    toggleItem={toggleItem}
                    loading={loading}
                    setActiveType={setActiveType}
                  />
                )}
              </div>
            </div>
          ) : (
            /* Manage Panel */
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Active Training Sources</h3>
              {backendSources.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No active sources yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {backendSources.map((src) => {
                    const cfg = CONFIG.find((c) => c.type === src.source_type)!;
                    return (
                      <div key={src.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-emerald-100 rounded-lg">
                            <cfg.icon className="w-6 h-6 text-emerald-700" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{cfg.label}</div>
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
                          className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                        >
                          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Save Button */}
          {panel === "config" && (
            <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={save}
                disabled={saving}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl flex items-center gap-3 shadow-lg transition"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Save & Train Avatar
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};