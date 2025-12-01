"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from '@/context/AuthContext';

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
  AlertTriangle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

// --- TYPE & CONFIG DEFINITIONS (Preserved) ---

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
  <div className="space-y-3">
    <h4 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
      <Type className="w-5 h-5 text-emerald-600" /> Manual Text Input
    </h4>
    <p className="text-sm text-gray-500">Add custom Q&A, tone examples, or knowledge directly.</p>
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      rows={8}
      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none transition-all shadow-inner bg-white"
      placeholder="Example:
Q: What is your favorite programming language?
A: I love Python because it's clean and powerful.

I’m a helpful AI who speaks casually and uses emojis sometimes."
    />
  </div>
);

// New component for the Configuration Details Panel
const SourceDetail = ({ 
    active, 
    toggle, 
    updateManualContent, 
    toggleItem, 
    loading, 
    setActiveType 
}: { 
    active: SourceConfig; 
    toggle: (type: SourceType, field: "useForTone" | "useForKnowledge", value: boolean) => void; 
    updateManualContent: (type: SourceType, content: string) => void;
    toggleItem: (type: SourceType, id: string | number, checked: boolean) => void;
    loading: boolean;
    setActiveType: (type: SourceType | null) => void;
}) => {
    
    const isEnabled = active.useForTone || active.useForKnowledge;

    return (
        <div className="space-y-6 md:col-span-7 bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 min-h-[500px]">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-4">
                <h3 className={`text-2xl font-extrabold flex items-center gap-4`}>
                    <Icon type={active.type} className="w-7 h-7 text-emerald-600" />
                    {active.label} Configuration
                </h3>
                <button
                    onClick={() => setActiveType(null)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
            
            <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                    <h4 className="font-bold text-lg mb-4 text-gray-800">Usage Mode</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <label className={`flex items-start p-4 rounded-xl transition cursor-pointer border ${active.useForTone ? 'bg-emerald-100 border-emerald-500' : 'bg-white hover:bg-gray-100 border-gray-200'}`}>
                            <input
                                type="checkbox"
                                checked={active.useForTone}
                                onChange={(e) => toggle(active.type, "useForTone", e.target.checked)}
                                className="w-5 h-5 text-emerald-600 rounded mt-0.5 border-gray-300 focus:ring-emerald-500 transition mr-3 flex-shrink-0"
                            />
                            <div>
                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                  <Book className="w-4 h-4 text-emerald-600" /> Tone & Style
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                    Inference on how the AI writes (e.g., casual, professional).
                                </div>
                            </div>
                        </label>

                        <label className={`flex items-start p-4 rounded-xl transition cursor-pointer border ${active.useForKnowledge ? 'bg-emerald-100 border-emerald-500' : 'bg-white hover:bg-gray-100 border-gray-200'}`}>
                            <input
                                type="checkbox"
                                checked={active.useForKnowledge}
                                onChange={(e) => toggle(active.type, "useForKnowledge", e.target.checked)}
                                className="w-5 h-5 text-emerald-600 rounded mt-0.5 border-gray-300 focus:ring-emerald-500 transition mr-3 flex-shrink-0"
                            />
                            <div>
                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                    <Brain className="w-4 h-4 text-emerald-600" /> Knowledge
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                    Facts, files, or notes the AI should use for answering questions.
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {isEnabled ? (
                    <>
                        {active.type === "manual" ? (
                            <ManualDataEntry content={active.manualContent} onChange={(c) => updateManualContent(active.type, c)} />
                        ) : active.hasItems ? (
                            <div className="rounded-2xl p-5 border border-gray-200 shadow-inner bg-gray-50">
                                <p className="font-bold text-lg text-gray-800 mb-4">Item Selection (Filter)</p>
                                <div className="max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {loading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                                        </div>
                                    ) : active.items?.length ? (
                                        active.items.map((item) => (
                                            <label
                                                key={item.id}
                                                className="flex items-center justify-between p-3 rounded-xl bg-white shadow-sm hover:shadow transition cursor-pointer border border-gray-100"
                                            >
                                                <span className="text-sm text-gray-700 truncate pr-4 max-w-[80%]">{item.title}</span>
                                                <div className="flex-shrink-0">
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
                                                </div>
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500 py-8">No items found for this source type.</p>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-4 border-t pt-3">
                                    Leave this list empty to **include all** available items from {active.label}.
                                </p>
                            </div>
                        ) : (
                            <div className="p-5 border border-emerald-200 bg-emerald-50 rounded-2xl text-sm text-emerald-800 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5"/>
                                <p>This source is enabled as a whole (e.g., all Gmail). It does not require or support item-level selection.</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">Data source disabled.</p>
                        <p className="text-sm">Select at least one **Usage Mode** above to enable this source for training.</p>
                    </div>
                )}
            </div>

            {/* Save Button for Detail Panel on Mobile Only */}
            <div className="mt-6 md:hidden">
                 <button
                    onClick={() => { setActiveType(null); }}
                    className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition"
                 >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Sources
                 </button>
            </div>

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
  const [mainPanel, setMainPanel] = useState<"config" | "manage">("config"); // config is the main view (list + detail)
  const [activeType, setActiveType] = useState<SourceType | null>(null); // For detail view in config

  const active = sources.find((s) => s.type === activeType);

  // Custom scrollbar class for better cross-browser compatibility and minimalist look
  const customScrollbarStyle = `
    .custom-scrollbar::-webkit-scrollbar { width: 8px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background-color: #f3f4f6; border-radius: 4px; }
  `;

  // --- Data Fetching Logic (Preserved and simplified for mock purposes) ---

  const fetchItems = useCallback(async (type: SourceType) => {
    const endpoint = ENDPOINTS[type];
    if (!endpoint || !accessToken) return;

    const src = sources.find((s) => s.type === type);
    // Don't refetch if items are already present, unless specifically needed
    if (src?.items && src.items.length > 0) return; 

    setLoading(true);
    try {
      // MOCK FETCH LOGIC (Replace with actual fetch)
      await new Promise(resolve => setTimeout(resolve, 300));
      const MOCK_ITEMS: Record<SourceType, Item[]> = {
          notes: [{ id: 1, title: 'Project Mars Pitch Notes' }, { id: 2, title: 'Q3 Review Meeting Summary' }, { id: 3, title: 'Personal Goals for 2026' }],
          reminders: [{ id: 4, title: 'Book flight for NYC trip' }, { id: 5, title: 'Call client about invoice' }],
          todos: [{ id: 6, title: 'Finish SourceSelector Redesign' }, { id: 7, title: 'Deploy to Staging' }],
          uploads: [{ id: 8, title: 'Financial Report Q4.pdf' }, { id: 9, title: 'Style Guide V1.docx' }],
          gmail: [], website: [], manual: []
      };
      
      const items = MOCK_ITEMS[type] || [];

      setSources((prev) => prev.map((s) => (s.type === type ? { ...s, items } : s)));
    } catch {
      toast.error(`Failed to load ${type} items`);
    } finally {
      setLoading(false);
    }
  }, [accessToken, sources]);

  const fetchBackendSources = useCallback(async () => {
    if (!accessToken || !avatarHandle) return;
    setLoading(true);
    try {
      // Mock fetch logic - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Filter current sources to simulate which ones were *saved* and are now *active* on the backend
      const MOCK_BACKEND_SOURCES: BackendSource[] = sources
        .filter(s => s.useForTone || s.useForKnowledge)
        .map((s, index) => ({ 
            id: `b-${index}-${s.type}`, // Use index and type for unique id
            source_type: s.type, 
            metadata: {}, 
            include_for_tone: s.useForTone, 
            include_for_knowledge: s.useForKnowledge, 
            created_at: new Date().toISOString() 
        }));
      
      // Fallback for an empty save list to show *something* in the manage panel initially
      if (MOCK_BACKEND_SOURCES.length === 0) {
        setBackendSources([]);
      } else {
        setBackendSources(MOCK_BACKEND_SOURCES);
      }
    } catch {
      toast.error("Failed to load existing sources");
    } finally {
      setLoading(false);
    }
  }, [accessToken, avatarHandle, sources]);

  const deleteSource = async (id: string) => {
    if (!accessToken || !window.confirm("Are you sure you want to remove this source? It will be immediately removed from your AI's training data.")) return;

    setSaving(true);
    try {
        // Mock delete logic
        await new Promise(resolve => setTimeout(resolve, 500));
        setBackendSources(prev => prev.filter(src => src.id !== id));
        
        // Also update the local config state to reflect the source is no longer enabled
        const deletedSource = backendSources.find(src => src.id === id);
        if (deletedSource) {
            setSources(prev => prev.map(s => 
                s.type === deletedSource.source_type ? { ...s, isEnabled: false, useForTone: false, useForKnowledge: false } : s
            ));
        }

        toast.success(`Source ${deletedSource?.source_type} removed!`);
        onSaveSuccess();
    } catch {
      toast.error("Failed to delete source");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      // Only fetch items for source types that require selection and are enabled
      CONFIG.filter(c => c.hasItems).forEach(c => fetchItems(c.type));
      fetchBackendSources();
    }
  }, [accessToken, fetchItems, fetchBackendSources]);

  // --- State Updaters (Preserved) ---

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
    
    // Payload preparation (Preserved Logic)
    const payload = sources
      .filter((s) => s.useForTone || s.useForKnowledge || s.manualContent.trim())
      .map((s) => ({
        source_type: s.type,
        include_for_tone: s.useForTone,
        include_for_knowledge: s.useForKnowledge,
        manual_content: s.type === "manual" ? s.manualContent.trim() : undefined,
        item_ids: s.hasItems && (s.useForTone || s.useForKnowledge) && s.selectedIds.length > 0 ? s.selectedIds : undefined,
      }));

    // Mock Save Logic
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (payload.length === 0) throw new Error("Please select at least one source to save.");
        
        // Optimistically update backend sources for the next 'Manage' view
        fetchBackendSources(); 
        
        toast.success(`Training sources saved! (${payload.length} sources)`);
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
    <div className="bg-gray-50 min-h-screen py-8 md:py-12 relative">
      <style>{customScrollbarStyle}</style>

      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 mb-8">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-6 md:p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Brain className="w-8 h-8 md:w-10 md:h-10 text-emerald-100" />
              <div>
                <h2 className="text-xl md:text-3xl font-extrabold tracking-tight">Avatar Training Data</h2>
                <p className="text-emerald-200 text-sm md:text-base">Configure your AI&apos;s knowledge and persona</p>
              </div>
            </div>
            <button
              onClick={() => {
                setMainPanel(mainPanel === "config" ? "manage" : "config");
                setActiveType(null);
                if (mainPanel === "config") fetchBackendSources();
              }}
              className="px-4 py-2 md:px-5 md:py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition backdrop-blur text-sm md:text-base flex items-center gap-2"
              disabled={saving || loading}
            >
              <List className="w-5 h-5"/>
              {mainPanel === "config" ? "Manage Sources" : "Add Sources"}
            </button>
          </div>
        </div>
      </div>


      <div className="max-w-5xl mx-auto px-4">
        {mainPanel === "config" ? (
          /* CONFIGURATION VIEW (List + Detail) */
          <div className={`grid md:grid-cols-12 gap-6 relative`}>
            
            {/* Source List Panel */}
            <div className={`md:col-span-5 transition-all duration-300 ${isDetailView ? "hidden md:block" : "block"}`}>
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 h-full">
                <h3 className="font-extrabold text-2xl text-gray-800 mb-6 flex items-center gap-2">
                  <List className="w-6 h-6 text-emerald-600"/> Available Data Sources
                </h3>
                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                  {sources.map((s) => (
                    <button
                      key={s.type}
                      onClick={() => {
                        setActiveType(s.type);
                        if (s.hasItems && !s.items) fetchItems(s.type);
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all shadow-sm ${
                        activeType === s.type
                          ? "bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/50"
                          : "border-gray-200 hover:border-emerald-300 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-full flex-shrink-0">
                            <Icon type={s.type} className="w-6 h-6 text-emerald-700" />
                          </div>
                          <div className="truncate">
                            <div className="font-semibold text-gray-900">{s.label}</div>
                            <div className={`text-xs ${s.useForTone || s.useForKnowledge ? 'text-emerald-700 font-medium' : 'text-gray-500'}`}>
                              {s.useForTone && "Tone"}
                              {s.useForTone && s.useForKnowledge && " & "}
                              {s.useForKnowledge && "Knowledge"}
                              {s.useForTone || s.useForKnowledge ? " Enabled" : "Disabled"}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 transition-transform ${activeType === s.type ? "text-emerald-600 translate-x-1" : "text-gray-400"}`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Details Panel - Mobile: Absolute overlay, Desktop: Part of grid */}
            <div className={`${isDetailView ? "fixed inset-0 z-20 bg-gray-50 overflow-y-auto p-4 md:static md:p-0 md:bg-transparent" : "hidden md:block"} md:col-span-7`}>
              {!active ? (
                <div className="text-center py-24 px-6 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-300 h-full">
                  <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-bold text-gray-600">Select a Source</p>
                  <p className="text-base mt-2">Choose an available source from the list to configure its training parameters.</p>
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
            
            {/* Save Button for Config Panel (Desktop & Mobile List View) */}
            <div className={`md:col-span-12 mt-4 ${isDetailView ? "hidden" : "block"}`}>
              <div className="pt-6 border-t border-gray-200 flex justify-end">
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
                      Save & Re-Train Avatar
                    </>
                  )}
                </button>
              </div>
            </div>
            
          </div>
        ) : (
          /* MANAGE SOURCES VIEW */
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 min-h-[500px] space-y-6">
            <h3 className="text-2xl font-extrabold text-gray-800 flex items-center gap-3">
              <List className="w-7 h-7 text-emerald-600" />
              Active Training Sources
            </h3>
            <p className="text-gray-600 border-b pb-4 text-sm">Below are the sources currently contributing to your AI&apos;s knowledge base and persona. Removing a source will delete its data from training.</p>
            
            {loading ? (
                  <div className="flex justify-center py-16">
                     <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  </div>
            ) : backendSources.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 font-bold text-lg">No Active Sources</p>
                <p className="text-sm text-gray-500 mt-1">Switch to **Add Sources** to begin training your avatar.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {backendSources.map((src) => {
                  const cfg = CONFIG.find((c) => c.type === src.source_type);
                  const IconC = cfg?.icon || FileText;
                  const label = cfg?.label || src.source_type;

                  return (
                    <div key={src.id} className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 flex items-center justify-between hover:shadow-lg transition">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 rounded-full flex-shrink-0">
                          <IconC className="w-6 h-6 text-emerald-700" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{label}</div>
                          <div className="text-sm text-emerald-700 font-medium">
                            {src.include_for_tone && "Tone"}
                            {src.include_for_tone && src.include_for_knowledge && " & "}
                            {src.include_for_knowledge && "Knowledge"}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSource(src.id)}
                        disabled={saving}
                        className="text-red-600 hover:text-white hover:bg-red-600 font-medium flex items-center gap-2 p-2 rounded-xl transition flex-shrink-0 border border-red-600 hover:border-red-700 disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        <span className="hidden md:inline">Remove Source</span>
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
  );
};