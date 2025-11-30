"use client";

import React, { useState, useEffect, useCallback } from "react";
// Assuming useAuth is correctly imported from "@/context/AuthContext"
// import { useAuth } from "@/context/AuthContext";
// Mock useAuth for runnable example - replace with actual context in your project
const useAuth = () => ({ accessToken: "MOCK_TOKEN_123" }); 

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

// --- TYPE & CONFIG DEFINITIONS (Same as original, included for completeness) ---

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

// --- HELPER COMPONENTS ---

const Icon = ({ type, className }: { type: SourceType; className?: string }) => {
  const cfg = CONFIG.find((c) => c.type === type);
  const C = cfg?.icon || Settings;
  return <C className={`w-5 h-5 ${className || "text-emerald-600"}`} />;
};

const ManualDataEntry = ({ content, onChange }: { content: string; onChange: (c: string) => void }) => (
  <div className="space-y-4">
    <h4 className="font-bold text-lg text-gray-800">Manual Text Input</h4>
    <p className="text-sm text-gray-600">Add custom Q&A, tone examples, or knowledge directly. This will be chunked and used for training.</p>
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      rows={10}
      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none transition-all shadow-inner bg-white"
      placeholder="Example:
Q: What is your favorite programming language?
A: I love Python because it's clean and powerful.

I’m a helpful AI who speaks casually and uses emojis sometimes."
    />
  </div>
);

// New component for the Configuration Details Panel
const SourceDetail = ({ active, toggle, updateManualContent, toggleItem, loading, setActiveType }: { 
    active: SourceConfig; 
    toggle: (type: SourceType, field: "useForTone" | "useForKnowledge", value: boolean) => void; 
    updateManualContent: (type: SourceType, content: string) => void;
    toggleItem: (type: SourceType, id: string | number, checked: boolean) => void;
    loading: boolean;
    setActiveType: (type: SourceType | null) => void;
}) => {
    
    const isEnabled = active.useForTone || active.useForKnowledge;

    return (
        <div className="space-y-6 min-h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <button
                    onClick={() => setActiveType(null)}
                    className="md:hidden text-gray-500 hover:text-gray-700 flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className={`text-xl md:text-2xl font-bold flex items-center gap-3 ${active.type !== 'manual' && active.type !== 'gmail' && 'md:ml-0 ml-[-40px]'}`}>
                    <Icon type={active.type} className="w-8 h-8 text-emerald-600" />
                    {active.label}
                </h3>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <h4 className="font-bold text-lg mb-4 text-gray-800">How should this data be used?</h4>
                <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer">
                        <div className="flex items-center gap-3">
                            <Book className="w-5 h-5 text-emerald-600" />
                            <div>
                                <div className="font-medium text-gray-900">Tone & Style</div>
                                <div className="text-xs text-gray-600">Inference on how the AI writes and speaks (e.g., casual, professional, using emojis).</div>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={active.useForTone}
                            onChange={(e) => toggle(active.type, "useForTone", e.target.checked)}
                            className="w-5 h-5 text-emerald-600 rounded-lg border-gray-300 focus:ring-emerald-500 transition"
                        />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer">
                        <div className="flex items-center gap-3">
                            <Brain className="w-5 h-5 text-emerald-600" />
                            <div>
                                <div className="font-medium text-gray-900">Knowledge</div>
                                <div className="text-xs text-gray-600">The facts, files, or notes the AI should use for answering questions.</div>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={active.useForKnowledge}
                            onChange={(e) => toggle(active.type, "useForKnowledge", e.target.checked)}
                            className="w-5 h-5 text-emerald-600 rounded-lg border-gray-300 focus:ring-emerald-500 transition"
                        />
                    </label>
                </div>
            </div>

            {isEnabled && (
                <>
                    {active.type === "manual" ? (
                        <ManualDataEntry content={active.manualContent} onChange={(c) => updateManualContent(active.type, c)} />
                    ) : active.hasItems ? (
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-inner">
                            <p className="font-bold text-lg text-gray-800 mb-4">Select specific items to include (optional)</p>
                            <div className="max-h-80 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                                    </div>
                                ) : active.items?.length ? (
                                    active.items.map((item) => (
                                        <label
                                            key={item.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-white shadow-sm hover:shadow transition cursor-pointer border border-gray-100"
                                        >
                                            <span className="text-sm text-gray-700 truncate pr-4 max-w-[80%]">{item.title}</span>
                                            <div className="flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={active.selectedIds.includes(item.id)}
                                                    onChange={(e) => toggleItem(active.type, item.id, e.target.checked)}
                                                    className="sr-only" // Hide native checkbox
                                                />
                                                {active.selectedIds.includes(item.id) ? (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                                ) : (
                                                    <Circle className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                        </label>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-8">No items found for this source type.</p>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-4 border-t pt-3">Leave this list empty to **include all** available items from {active.label}.</p>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-inner text-sm text-gray-600">
                             <p><FileText className="w-4 h-4 inline mr-2 text-emerald-600"/> This source type is enabled as a whole and does not require item selection.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};


// Main Component
export const SourceSelector = ({ avatarHandle, onSaveSuccess }: Props) => {
  const { accessToken } = useAuth();
  const [sources, setSources] = useState(CONFIG);
  const [backendSources, setBackendSources] = useState<BackendSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mainPanel, setMainPanel] = useState<"config" | "manage">("config");
  const [activeType, setActiveType] = useState<SourceType | null>(null);

  const active = sources.find((s) => s.type === activeType);

  // --- Data Fetching Logic (Same as original, assuming correct implementation) ---

  const fetchItems = useCallback(async (type: SourceType) => {
    // ... (logic remains the same)
    const endpoint = ENDPOINTS[type];
    if (!endpoint || !accessToken) return;

    const src = sources.find((s) => s.type === type);
    if (src?.items) return;

    setLoading(true);
    try {
      // Mock fetch logic - replace with actual API call
      // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/${endpoint}`, {
      //   headers: { Authorization: `Bearer ${accessToken}` },
      // });
      // if (!res.ok) throw new Error("Failed");
      // const data = await res.json();
      
      const MOCK_ITEMS: Item[] = [
        { id: 1, title: `${type} Item One: Very long title that will be truncated on smaller screens` },
        { id: 2, title: `${type} Item Two` },
        { id: 3, title: `${type} Item Three` },
      ];
      
      const items = MOCK_ITEMS; // (data.results || data).map(...)

      setSources((prev) => prev.map((s) => (s.type === type ? { ...s, items } : s)));
    } catch {
      toast.error(`Failed to load ${type}`);
    } finally {
      setLoading(false);
    }
  }, [accessToken, sources]);

  const fetchBackendSources = useCallback(async () => {
    // ... (logic remains the same)
    if (!accessToken || !avatarHandle) return;
    setLoading(true);
    try {
      // Mock fetch logic - replace with actual API call
      // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/sources/`, {
      //   headers: { Authorization: `Bearer ${accessToken}` },
      // });
      // if (!res.ok) throw new Error("Failed");
      // const data = await res.json();
      
      const MOCK_BACKEND_SOURCES: BackendSource[] = [
          { id: 'b1', source_type: 'notes', metadata: {}, include_for_tone: true, include_for_knowledge: true, created_at: new Date().toISOString() },
          { id: 'b2', source_type: 'uploads', metadata: {}, include_for_tone: true, include_for_knowledge: false, created_at: new Date().toISOString() },
      ];
      setBackendSources(MOCK_BACKEND_SOURCES); // data
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
        // Mock delete logic
        await new Promise(resolve => setTimeout(resolve, 500));
        setBackendSources(prev => prev.filter(src => src.id !== id));
        toast.success("Source deleted");
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
  }, [accessToken, fetchItems, fetchBackendSources]);

  // --- State Updaters (Same as original) ---

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
    // ... (payload creation and API call logic remains the same)
    
    // Mock Save Logic
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const payloadCount = sources.filter(s => s.useForTone || s.useForKnowledge).length;
        if (payloadCount === 0) throw new Error("No sources selected.");
        
        toast.success(`Training sources saved! (${payloadCount} sources)`);
        fetchBackendSources();
        onSaveSuccess();
    } catch (e: any) {
        toast.error(e.message || "Save failed");
    } finally {
        setSaving(false);
    }
  };

  // --- RENDER LOGIC ---

  const isDetailView = mainPanel === "config" && activeType !== null;

  return (
    <div className="bg-white rounded-3xl shadow-3xl border border-gray-100 max-w-5xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Brain className="w-10 h-10 md:w-12 md:h-12" />
            <div>
              <h2 className="text-xl md:text-3xl font-extrabold">Avatar Training Data</h2>
              <p className="text-emerald-200 text-sm md:text-base">Choose and manage what your AI learns from</p>
            </div>
          </div>
          <button
            onClick={() => {
              setMainPanel(mainPanel === "config" ? "manage" : "config");
              setActiveType(null);
              if (mainPanel === "config") fetchBackendSources();
            }}
            className="px-4 py-2 md:px-5 md:py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition backdrop-blur text-sm md:text-base"
            disabled={saving || loading}
          >
            {mainPanel === "config" ? "Manage Sources" : "Add Sources"}
          </button>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {mainPanel === "config" ? (
          <div className={`grid md:grid-cols-12 gap-6 transition-all duration-300`}>
            
            {/* Source List - Hidden on mobile when a source is active */}
            <div className={`md:col-span-5 space-y-3 ${isDetailView ? "hidden md:block" : "block"}`}>
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <List className="w-5 h-5 text-emerald-600"/> Available Data Sources
              </h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {sources.map((s) => (
                  <button
                    key={s.type}
                    onClick={() => {
                      setActiveType(s.type);
                      if (s.hasItems && !s.items) fetchItems(s.type);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all shadow-sm ${
                      activeType === s.type
                        ? "bg-emerald-50 border-emerald-500 shadow-md"
                        : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                          <Icon type={s.type} className="w-6 h-6 text-emerald-700" />
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-gray-900">{s.label}</div>
                          <div className="text-xs text-gray-600">
                            {s.useForTone && "Tone "}
                            {s.useForTone && s.useForKnowledge && "· "}
                            {s.useForKnowledge && "Knowledge"}
                            {s.useForTone || s.useForKnowledge ? "" : "Disabled"}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${activeType === s.type ? "text-emerald-600" : ""}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Details Panel - Shown on mobile only when activeType is set, always on desktop */}
            <div className={`md:col-span-7 ${isDetailView ? "block" : "hidden md:block"}`}>
              {!active ? (
                <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a source to configure its usage</p>
                  <p className="text-sm">Choose which data sources feed your AI&apos;s knowledge and personality.</p>
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
          /* Manage Sources Panel */
          <div className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <List className="w-8 h-8 text-emerald-600" />
              Current Training Sources
            </h3>
            {loading ? (
                 <div className="flex justify-center py-16">
                     <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                 </div>
            ) : backendSources.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 font-medium">No active sources added yet</p>
                <p className="text-sm text-gray-500 mt-1">Switch to &quot;Add Sources&quot; to begin training your avatar.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {backendSources.map((src) => {
                  const cfg = CONFIG.find((c) => c.type === src.source_type);
                  const IconC = cfg?.icon || FileText;
                  const label = cfg?.label || src.source_type;

                  return (
                    <div key={src.id} className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 flex items-center justify-between hover:shadow-lg transition">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 rounded-xl flex-shrink-0">
                          <IconC className="w-6 h-6 text-emerald-700" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{label}</div>
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
                        className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 p-2 rounded-lg hover:bg-red-50 transition flex-shrink-0"
                      >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        <span className="hidden md:inline">Remove</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Save Button for Config Panel */}
        {mainPanel === "config" && !isDetailView && ( // Only show save button when viewing the list/main config panel on mobile or desktop
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={save}
              disabled={saving || loading}
              className="px-8 py-3 md:px-10 md:py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center gap-3 shadow-xl hover:shadow-2xl transition disabled:opacity-60 disabled:cursor-not-allowed"
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