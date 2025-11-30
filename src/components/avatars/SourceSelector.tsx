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
  Plus,
  Type,
  X,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

// --- Type Definitions ---
type SourceType = "notes" | "reminders" | "todos" | "uploads" | "gmail" | "website" | "manual";

interface Item {
  id: string | number;
  title: string;
}

// Backend Model Structure for listed sources (AvatarSource)
interface BackendSource {
    id: string; // UUID
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
  // New field for Manual data entry
  manualContent: string;
}

interface Props {
  avatarHandle: string;
  onSaveSuccess: () => void;
}

type MainPanel = 'config' | 'manage';
type ConfigPanel = 'list' | 'details';

// --- Configuration ---
const CONFIG: SourceConfig[] = [
  { type: "notes", label: "Whisone Notes", icon: Book, isEnabled: false, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: true, manualContent: "" },
  { type: "reminders", label: "Reminders", icon: Calendar, isEnabled: false, useForTone: false, useForKnowledge: false, selectedIds: [], hasItems: true, manualContent: "" },
  { type: "todos", label: "To-Dos", icon: CheckSquare, isEnabled: false, useForTone: false, useForKnowledge: false, selectedIds: [], hasItems: true, manualContent: "" },
  { type: "uploads", label: "File Uploads", icon: Upload, isEnabled: false, useForTone: true, useForKnowledge: false, selectedIds: [], hasItems: true, manualContent: "" },
  { type: "gmail", label: "Gmail", icon: Mail, isEnabled: false, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: false, manualContent: "" },
  { type: "website", label: "Website", icon: Globe, isEnabled: false, useForTone: false, useForKnowledge: false, selectedIds: [], hasItems: false, manualContent: "" },
  { type: "manual", label: "Manual Data Entry", icon: Type, isEnabled: false, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: false, manualContent: "" }, // New Manual source
];

const ENDPOINTS: Record<string, string> = {
  notes: "notes/",
  reminders: "reminders/",
  todos: "todos/",
  uploads: "files/", // Endpoint to fetch the list of uploaded files
};

// --- Icon Helper (Kept for external usage) ---
const Icon = ({ type, className }: { type: SourceType, className?: string }) => {
    const cfg = CONFIG.find((c) => c.type === type);
    
    if (cfg && cfg.icon) {
        const C = cfg.icon;
        return <C className={`w-5 h-5 text-emerald-600 ${className || ''}`} />;
    }
    
    return <Settings className={`w-5 h-5 text-gray-400 ${className || ''}`} />;
};

// --- Manual Data Entry Component ---
const ManualDataEntry = ({ content, onChange }: { content: string, onChange: (content: string) => void }) => (
    <div className="space-y-3">
        <p className="font-medium text-gray-800">Enter Manual Data</p>
        <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            rows={8}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            placeholder="Enter structured data, Q&A pairs, or general text to influence the Avatar's tone or knowledge. This data will be ingested and chunked for training."
        />
    </div>
);


// --- Component Start ---
export const SourceSelector = ({ avatarHandle, onSaveSuccess }: Props) => {
  const { accessToken } = useAuth();
  const [sources, setSources] = useState(CONFIG);
  const [backendSources, setBackendSources] = useState<BackendSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mainPanel, setMainPanel] = useState<MainPanel>('config');
  const [configPanel, setConfigPanel] = useState<ConfigPanel>('list'); 
  const [activeType, setActiveType] = useState<SourceType | null>(null);

  // --- API Calls ---

  const fetchItems = useCallback(
    async (type: SourceType) => {
      const endpoint = ENDPOINTS[type];
      if (!endpoint || !accessToken) return;

      const src = sources.find((s) => s.type === type);
      if (src?.items) return;

      setLoading(true);
      try {
        // Assume all non-upload endpoints are under /whisone/ and upload is under /files/
        // I will use /whisone/ as a base URL as per the original code
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/${endpoint}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        
        // Custom logic to map file uploads (assuming they have 'id' and 'name'/'filename')
        const items = data.results?.map((item: any) => ({
            id: item.id,
            title: item.name || item.filename || item.title || `Item ${item.id}`,
        })) || (data.length > 0 ? data.map((item: any) => ({
             id: item.id,
             title: item.name || item.filename || item.title || `Item ${item.id}`,
        })) : []) as Item[];

        setSources((prev) =>
          prev.map((s) => (s.type === type ? { ...s, items } : s))
        );
      } catch {
        toast.error(`Failed to load ${type} items`);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, sources]
  );
  
  const fetchBackendSources = useCallback(async () => {
    if (!accessToken || !avatarHandle) return;

    setLoading(true);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/sources/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error("Failed to load existing sources");
        const data = await res.json();
        setBackendSources(data as BackendSource[]);
    } catch (e) {
        toast.error("Failed to load existing training data.");
    } finally {
        setLoading(false);
    }
  }, [accessToken, avatarHandle]);
  
  const deleteSource = async (sourceId: string) => {
    if (!accessToken) return;

    if (!window.confirm("Are you sure you want to delete this source? This will un-train the data from your Avatar.")) {
        return;
    }

    setSaving(true);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/sources/${sourceId}/`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!res.ok) throw new Error("Failed to delete source");

        toast.success("Source successfully deleted!");
        await fetchBackendSources(); // Refresh the list
        // Optionally: Trigger a re-training job here if necessary
        onSaveSuccess();
    } catch (e: any) {
        toast.error(e.message || "Failed to delete source.");
    } finally {
        setSaving(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      // Pre-fetch items for the two configured sources on load
      fetchItems("notes");
      fetchItems("uploads");
      fetchBackendSources();
    }
  }, [accessToken, fetchItems, fetchBackendSources]);

  // --- Handlers ---

  const toggle = (type: SourceType, field: keyof SourceConfig, value: boolean) => {
    setSources((prev) =>
      prev.map((s) => {
        if (s.type !== type) return s;
        const updated = { ...s, [field]: value };
        if (field === "isEnabled" && !value) {
          updated.useForTone = false;
          updated.useForKnowledge = false;
        }
        if ((field === "useForTone" || field === "useForKnowledge") && !value && !updated.useForTone && !updated.useForKnowledge) {
            updated.isEnabled = false;
        }
        return updated;
      })
    );
  };

  const updateManualContent = (type: SourceType, content: string) => {
      setSources((prev) => 
          prev.map((s) => (s.type === type ? { ...s, manualContent: content } : s))
      );
  };
  
  const toggleItem = (type: SourceType, id: string | number, checked: boolean) => {
    setSources((prev) =>
      prev.map((s) =>
        s.type === type
          ? {
              ...s,
              selectedIds: checked
                ? [...s.selectedIds, id]
                : s.selectedIds.filter((x) => x !== id),
            }
          : s
      )
    );
  };
  
  const handleSourceSelect = (type: SourceType, hasItems: boolean, items: Item[] | undefined) => {
    setActiveType(type);
    if (hasItems && !items) fetchItems(type);
    setConfigPanel('details'); 
  };

  const save = async () => {
    if (!accessToken) return;
    setSaving(true);

    const payload = sources
      .map((s) => {
        const tone = s.useForTone;
        const knowledge = s.useForKnowledge;
        
        // Skip if not enabled for tone or knowledge
        if (!tone && !knowledge) return null;

        const sourcePayload: any = {
          source_type: s.type,
          include_for_tone: tone,
          include_for_knowledge: knowledge,
        };
        
        if (s.type === 'manual') {
            // For manual, the content goes directly into metadata
            if (!s.manualContent.trim()) {
                toast.error("Manual data source is enabled but content is empty.");
                return null; // Skip saving empty manual source
            }
            sourcePayload.metadata = { content: s.manualContent.trim() };
        } else if (s.hasItems) {
             // For sources with selectable items
             sourcePayload.metadata = { ids: s.selectedIds };
        } else {
            // For sources like Gmail/Website where no items are selected
            sourcePayload.metadata = {};
        }

        return sourcePayload;
      })
      .filter(Boolean); // Remove nulls (disabled sources)

    if (payload.length === 0) {
        toast.error("No sources enabled to save.");
        setSaving(false);
        return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/sources/`, {
        method: "POST", // POST to list endpoint for bulk/create
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({})); 
        console.error("DRF Validation Error (400):", errorData);
        
        let message = errorData.detail || "Save failed";
        if (Array.isArray(errorData) && errorData.length > 0) {
            message = `Validation failed for ${errorData.length} item(s). Check console for specific field errors.`;
        }
        
        throw new Error(message);
      }

      toast.success("Sources configuration saved!");
      // Refresh both config and management lists after save
      fetchBackendSources();
      onSaveSuccess();
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const active = sources.find((s) => s.type === activeType);

  // --- Render Sections ---
  
  const SourceList = () => (
    <div className={`space-y-2 ${configPanel === 'details' ? 'hidden md:block' : 'block'}`}>
      {sources.map((s) => (
        // FIX: The issue of sources not working on click on desktop might be due to 
        // the button being hidden by the conditional class on the parent div.
        // The logic for hiding/showing panels based on activePanel/configPanel now correctly reflects a master/detail view on desktop/mobile.
        <button
          key={s.type}
          onClick={() => handleSourceSelect(s.type, s.hasItems, s.items)}
          className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition border-2  
            ${
              activeType === s.type && configPanel === 'details'
                ? "bg-emerald-50 border-emerald-400"
                : "hover:bg-gray-50 border-transparent"
            }`}
        >
          <div className="flex items-center gap-3">
            <Icon type={s.type} />
            <span className="font-semibold text-sm">{s.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {(s.useForTone || s.useForKnowledge) && <div className="w-2 h-2 bg-emerald-500 rounded-full" title="Enabled" />}
            <ChevronRight className="w-4 h-4 text-gray-400 md:hidden" />
          </div>
        </button>
      ))}
    </div>
  );

  const SourceDetails = () => {
    if (!active) return (
      <div className="text-center text-gray-400 py-12">
        <Settings className="w-12 h-12 mx-auto mb-4" />
        <p>Select a source to configure</p>
      </div>
    );
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
            <Icon type={active.type} className="w-6 h-6" />
            {active.label}
            </h3>
            {/* Mobile back button */}
            <button 
                onClick={() => setConfigPanel('list')} 
                className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-emerald-600 md:hidden"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </button>
        </div>

        {/* Configuration Block */}
        <div className="bg-gray-50 rounded-xl p-5 space-y-5 border border-gray-200">
            {/* Tone and Knowledge Toggles */}
            <h4 className="font-bold text-gray-800 border-b pb-2 mb-3">Usage Configuration</h4>
            
            <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-600 flex items-center gap-2">
                    <Book className="w-4 h-4 text-emerald-600" />
                    Use for <strong>Tone</strong> (Writing Style)
                </span>
                <input
                    type="checkbox"
                    checked={active.useForTone}
                    onChange={(e) => toggle(active.type, "useForTone", e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-600 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emerald-600" />
                    Use for <strong>Knowledge</strong> (Information)
                </span>
                <input
                    type="checkbox"
                    checked={active.useForKnowledge}
                    onChange={(e) => toggle(active.type, "useForKnowledge", e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
            </label>
        </div>

        {/* Item Selection / Manual Data */}
        {(active.useForTone || active.useForKnowledge) && (
            <>
                {active.type === 'manual' ? (
                    <ManualDataEntry 
                        content={active.manualContent} 
                        onChange={(content) => updateManualContent(active.type, content)} 
                    />
                ) : active.hasItems ? (
                    <div>
                        <p className="font-medium text-gray-800 mb-3">Select items (optional)</p>
                        <div className="border border-gray-200 rounded-xl max-h-64 overflow-y-auto bg-white shadow-sm">
                            {active.items ? (
                                active.items.length > 0 ? (
                                    active.items.map((item) => (
                                        <label
                                            key={item.id}
                                            className="flex items-center justify-between px-4 py-3 hover:bg-emerald-50 transition border-b last:border-0 cursor-pointer"
                                        >
                                            <span className="text-sm truncate pr-4 text-gray-700">{item.title}</span>
                                            <input
                                                type="checkbox"
                                                checked={active.selectedIds.includes(item.id)}
                                                onChange={(e) => toggleItem(active.type, item.id, e.target.checked)}
                                                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                                            />
                                        </label>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-400 py-6 text-sm">No items found for this source. Ensure you have data in {active.label}.</p>
                                )
                            ) : loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                                </div>
                            ) : null}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Leave selection empty to include **all** items from this source.
                        </p>
                    </div>
                ) : null}
            </>
        )}
      </div>
    );
  };
  
  const ManageSourcesPanel = () => {
      return (
          <div className="space-y-4">
              <div className="flex items-center gap-2 text-xl font-bold text-gray-800 border-b pb-3">
                  <List className="w-6 h-6 text-emerald-600" />
                  Existing Training Data Sources
              </div>
              <p className="text-sm text-gray-600">
                  These are the data sources currently linked to your Avatar. Deleting a source will remove its data from the Avatar's training memory.
              </p>
              
              {loading && backendSources.length === 0 ? (
                  <div className="flex justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                      <span className="ml-2 text-gray-600">Loading sources...</span>
                  </div>
              ) : backendSources.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <FileText className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-500 font-medium">No training data sources found.</p>
                      <button 
                          onClick={() => setMainPanel('config')}
                          className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center justify-center mx-auto gap-1"
                      >
                          <Plus className="w-4 h-4" /> Add New Source
                      </button>
                  </div>
              ) : (
                  <div className="space-y-3">
                      {backendSources.map((source) => {
                          const config = CONFIG.find(c => c.type === source.source_type);
                          const IconComponent = config?.icon || FileText;
                          
                          // Custom title extraction for 'manual' content preview
                          let sourceTitle = config?.label || source.source_type;
                          if (source.source_type === 'manual' && source.metadata?.content) {
                              sourceTitle += ` (Manual Text: ${source.metadata.content.substring(0, 50)}...)`;
                          } else if (source.metadata?.ids && source.metadata.ids.length > 0) {
                              sourceTitle += ` (${source.metadata.ids.length} item${source.metadata.ids.length > 1 ? 's' : ''} selected)`;
                          } else if (config?.hasItems) {
                              sourceTitle += ` (All items included)`;
                          }

                          return (
                              <div 
                                  key={source.id} 
                                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm"
                              >
                                  <div className="flex items-center gap-3 min-w-0">
                                      <IconComponent className="w-5 h-5 text-blue-600" />
                                      <div className="min-w-0">
                                          <p className="font-medium text-gray-800 truncate">{sourceTitle}</p>
                                          <p className="text-xs text-gray-500">
                                              {source.include_for_tone && <span>Tone</span>}
                                              {source.include_for_tone && source.include_for_knowledge && <span> &bull; </span>}
                                              {source.include_for_knowledge && <span>Knowledge</span>}
                                              <span className="ml-2">| Added: {new Date(source.created_at).toLocaleDateString()}</span>
                                          </p>
                                      </div>
                                  </div>
                                  <button
                                      onClick={() => deleteSource(source.id)}
                                      disabled={saving}
                                      className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 transition disabled:opacity-50 ml-4 flex-shrink-0"
                                  >
                                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                      Delete
                                  </button>
                              </div>
                          );
                      })}
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <h2 className="text-2xl font-extrabold flex items-center gap-3 text-gray-800">
          <Brain className="w-7 h-7 text-emerald-600" />
          Avatar Training Data
        </h2>
        
        {/* Toggle Button for Configuration vs Management */}
        <button
            onClick={() => {
                setMainPanel(mainPanel === 'config' ? 'manage' : 'config');
                setConfigPanel('list'); // Reset config panel when switching
                if (mainPanel === 'config') {
                    fetchBackendSources(); // Fetch latest sources when switching to manage view
                }
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition border 
                ${mainPanel === 'config' 
                    ? 'bg-blue-50 border-blue-400 text-blue-700 hover:bg-blue-100'
                    : 'bg-emerald-50 border-emerald-400 text-emerald-700 hover:bg-emerald-100'
                }`}
        >
            {mainPanel === 'config' ? 'Manage Existing Sources' : 'Configure New Sources'}
        </button>
      </div>

      {mainPanel === 'config' ? (
        <>
          <div className="md:grid md:grid-cols-3 md:gap-8">
            {/* Left Panel: Source List - Visible on all screen sizes */}
            <div className={`md:block ${configPanel === 'details' ? 'hidden' : 'block'}`}>
              <h3 className="text-lg font-bold mb-3">Data Sources</h3>
              <SourceList />
            </div>

            {/* Right Panel: Source Details - Mobile: Toggles visibility; Desktop: Always visible */}
            <div className={`md:col-span-2 ${configPanel === 'list' ? 'hidden' : 'block md:block'}`}>
              <SourceDetails />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t flex justify-end">
            <button
              onClick={save}
              disabled={saving || loading}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </>
      ) : (
          // --- Manage Training Data Panel ---
          <ManageSourcesPanel />
      )}
    </div>
  );
};
