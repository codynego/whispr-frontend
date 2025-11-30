// SourceSelector.tsx

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Trash2, // Added for deletion
  FileText, // Use a better icon for manual upload within the panel
} from "lucide-react";
import toast from "react-hot-toast";

// --- Type Definitions ---
// Added 'file_upload' explicitly for the new manual upload flow
type SourceType = "notes" | "reminders" | "todos" | "file_upload" | "gmail" | "website"; 

interface Item {
  id: string | number;
  title: string;
}

interface SourceConfig {
  type: SourceType;
  label: string;
  icon: React.ElementType;
  isEnabled: boolean; // Indicates if the source is active/included in API payload
  useForTone: boolean;
  useForKnowledge: boolean;
  selectedIds: (string | number)[];
  items?: Item[];
  hasItems: boolean;
  source_db_id?: string; // NEW: To store the UUID from the backend for deletion/status
}

interface Props {
  avatarHandle: string;
  onSaveSuccess: () => void;
}

// --- Configuration ---
// NOTE: Renamed 'uploads' to 'file_upload' for clarity on the new, simpler manual flow.
// This assumes 'uploads' in your original code was for a pre-existing list of user files.
const CONFIG: SourceConfig[] = [
  { type: "notes", label: "Whisone Notes", icon: Book, isEnabled: false, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: true },
  { type: "reminders", label: "Reminders", icon: Calendar, isEnabled: false, useForTone: false, useForKnowledge: false, selectedIds: [], hasItems: true },
  { type: "todos", label: "To-Dos", icon: CheckSquare, isEnabled: false, useForTone: false, useForKnowledge: false, selectedIds: [], hasItems: true },
  // Manual File Upload is a new distinct type/action
  { type: "file_upload", label: "Manual File Upload", icon: Upload, isEnabled: false, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: false },
  { type: "gmail", label: "Gmail", icon: Mail, isEnabled: false, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: false },
  { type: "website", label: "Website/Sitemap", icon: Globe, isEnabled: false, useForTone: false, useForKnowledge: false, selectedIds: [], hasItems: false },
];

const ENDPOINTS: Record<string, string> = {
  notes: "notes/",
  reminders: "reminders/",
  todos: "todos/",
  // Note: 'file_upload' does not have an item list endpoint, it has a POST endpoint
};

// --- Component Start ---
export const SourceSelector = ({ avatarHandle, onSaveSuccess }: Props) => {
  const { accessToken } = useAuth();
  const [sources, setSources] = useState(CONFIG);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activePanel, setActivePanel] = useState<'list' | 'details'>('list'); 
  const [activeType, setActiveType] = useState<SourceType | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null); // NEW: For manual upload

  const active = useMemo(() => sources.find((s) => s.type === activeType), [sources, activeType]);

  // Reworked Icon Helper for robust checking
  const Icon = ({ type, className }: { type: SourceType, className?: string }) => {
    const cfg = CONFIG.find((c) => c.type === type);
    if (cfg && cfg.icon) {
        const C = cfg.icon;
        return <C className={`w-5 h-5 text-emerald-600 ${className || ''}`} />;
    }
    return <Settings className={`w-5 h-5 text-gray-400 ${className || ''}`} />;
  };

  const fetchItems = useCallback(
    async (type: SourceType) => {
      const endpoint = ENDPOINTS[type];
      if (!endpoint || !accessToken) return;

      const src = sources.find((s) => s.type === type);
      if (src?.items) return; // Already fetched

      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/${endpoint}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const items = (data.results || data) as Item[];

        setSources((prev) =>
          prev.map((s) => (s.type === type ? { ...s, items } : s))
        );
      } catch {
        toast.error(`Failed to load ${type} items.`);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, sources]
  );

  // Initial fetch for sources that list items
  useEffect(() => {
    if (accessToken) {
      // Assuming 'notes' are the primary item source for now
      fetchItems("notes");
    }
  }, [accessToken, fetchItems]);

  const toggle = (type: SourceType, field: keyof SourceConfig, value: any) => {
    setSources((prev) =>
      prev.map((s) => {
        if (s.type !== type) return s;
        const updated = { ...s, [field]: value };
        
        // Logic for auto-toggling other fields
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
  
  const handleSourceSelect = (type: SourceType) => {
    const src = sources.find(s => s.type === type);
    setActiveType(type);
    if (src && src.hasItems && !src.items) {
      fetchItems(type);
    }
    setActivePanel('details'); 
  };
  
  // NEW: Manual Upload Logic
  const handleFileUpload = async () => {
    if (!accessToken || !fileToUpload || !active) return;
    setSaving(true);
    
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("source_type", active.type); // Should be 'file_upload'
    formData.append("include_for_tone", String(active.useForTone));
    formData.append("include_for_knowledge", String(active.useForKnowledge));

    try {
      // Use the new dedicated upload endpoint
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/sources/upload/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({})); 
        console.error("Upload Error:", errorData);
        throw new Error(errorData.detail || "File upload failed.");
      }

      // Assuming the response includes the created AvatarSource object
      const newSource = await res.json();
      
      // Update the sources state to reflect the new, active source for display/deletion
      // This is a simplified way to handle 'file_upload' being a one-off action.
      // In a real app, you'd likely fetch all sources for the avatar to populate the list.
      setSources((prev) => prev.map(s => 
          s.type === active.type 
              ? { ...s, isEnabled: true, source_db_id: newSource.id } 
              : s
      ));
      setFileToUpload(null);
      toast.success(`File "${fileToUpload.name}" uploaded and set as source!`);
      onSaveSuccess();
      
    } catch (e: any) {
      toast.error(e.message || "File upload failed.");
    } finally {
      setSaving(false);
    }
  };

  // NEW: Bulk Save Logic (for non-file-upload sources)
  const saveConfiguration = async () => {
    if (!accessToken) return;
    setSaving(true);

    // Only include sources that are enabled OR have specific IDs selected
    const payload = sources
      .filter(s => s.type !== 'file_upload') // File upload uses a separate endpoint
      .map((s) => {
        const tone = s.useForTone;
        const knowledge = s.useForKnowledge;
        
        // If neither flag is set, this source is disabled, so we skip it.
        // If it's a delete operation, the component would use handleDeleteSource instead.
        if (!tone && !knowledge) return null; 

        return {
          source_type: s.type,
          include_for_tone: tone,
          include_for_knowledge: knowledge,
          metadata: s.hasItems ? { ids: s.selectedIds } : {},
          // No need to send source_db_id in a ListCreate (POST) endpoint
        };
      })
      .filter(Boolean); 

    try {
      // POST is used for ListCreate, effectively replacing/updating the list of sources
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/sources/`, {
        method: "POST", // POST is appropriate for bulk upsert/replacement
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

      toast.success("Source configuration saved!");
      onSaveSuccess();
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };
  
  // NEW: Delete Source Logic
  const handleDeleteSource = async () => {
      if (!accessToken || !active || !active.source_db_id) {
          toast.error("Source ID missing or item not yet saved to delete.");
          return;
      }
      
      if (!window.confirm(`Are you sure you want to delete the source configuration for ${active.label}? This action is irreversible.`)) {
          return;
      }
      
      setSaving(true);
      try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/sources/${active.source_db_id}/`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${accessToken}` },
          });
          
          if (!res.ok) {
              throw new Error("Failed to delete source.");
          }
          
          // Reset the local state for this source to the default 'disabled' config
          setSources((prev) => 
              prev.map(s => 
                  s.type === active.type 
                      ? { ...s, isEnabled: false, useForTone: false, useForKnowledge: false, source_db_id: undefined, selectedIds: [] } 
                      : s
              )
          );
          setActivePanel('list'); // Return to the source list
          toast.success(`${active.label} source deleted successfully.`);
          onSaveSuccess();
          
      } catch (e: any) {
          toast.error(e.message || "Deletion failed.");
      } finally {
          setSaving(false);
      }
  };


  // --- Render Sections ---
  
  const SourceList = () => (
    <div className="space-y-2">
      {sources.map((s) => (
        <button
          key={s.type}
          onClick={() => handleSourceSelect(s.type)}
          className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition border-2 
            ${
              activeType === s.type
                ? "bg-emerald-50 border-emerald-400 shadow-sm"
                : "hover:bg-gray-50 border-gray-200"
            }`}
        >
          <div className="flex items-center gap-3">
            <Icon type={s.type} />
            <span className="font-semibold text-sm text-gray-800">{s.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {s.isEnabled && <div className="w-2 h-2 bg-emerald-500 rounded-full" title="Source Enabled" />}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </button>
      ))}
    </div>
  );

  const SourceDetails = () => {
    if (!active) return (
      <div className="text-center text-gray-400 py-12">
        <Settings className="w-12 h-12 mx-auto mb-4" />
        <p className="font-medium">Select a source to configure its settings.</p>
      </div>
    );
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
            {/* Mobile back button & Title */}
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setActivePanel('list')} 
                    className="flex items-center justify-center w-8 h-8 rounded-full text-gray-600 hover:bg-gray-100 md:hidden transition"
                    title="Back to source list"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <Icon type={active.type} className="w-6 h-6" />
                    {active.label}
                </h3>
            </div>
            
            {/* NEW: Delete Button */}
            {active.source_db_id && active.type !== 'file_upload' && ( // Only show if source is saved AND not a one-off upload type
                <button
                    onClick={handleDeleteSource}
                    disabled={saving}
                    className="p-2 rounded-full text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                    title={`Delete ${active.label} Source`}
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            )}
        </div>

        {/* Configuration Panel */}
        <div className="bg-gray-50 rounded-xl p-5 space-y-5 border border-gray-200">
          <p className="text-sm text-gray-500 font-medium pb-2 border-b">Configuration</p>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="font-medium text-gray-800">
                {active.type === 'file_upload' ? 'Upload File and Enable' : 'Enable Source'}
            </span>
            <input
              type="checkbox"
              checked={active.isEnabled}
              onChange={(e) => toggle(active.type, "isEnabled", e.target.checked)}
              disabled={active.type === 'file_upload' && !!active.source_db_id} // File upload is enabled post-upload
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>

          {/* Tone/Knowledge Toggles */}
          <div className={`space-y-5 transition-all duration-300 ${!active.isEnabled ? 'opacity-50' : ''}`}>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-600">Use for <strong>Tone</strong> (Writing Style)</span>
              <input
                type="checkbox"
                checked={active.useForTone}
                onChange={(e) => toggle(active.type, "useForTone", e.target.checked)}
                disabled={!active.isEnabled}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-600">Use for <strong>Knowledge</strong> (Information)</span>
              <input
                type="checkbox"
                checked={active.useForKnowledge}
                onChange={(e) => toggle(active.type, "useForKnowledge", e.target.checked)}
                disabled={!active.isEnabled}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>
        
        {/* NEW: Manual Upload Component */}
        {active.type === 'file_upload' && (
            <div className="space-y-4 p-5 border border-dashed border-gray-300 rounded-xl bg-white">
                <p className="font-medium text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" /> Upload a Knowledge File (.pdf, .txt, .docx)
                </p>
                
                <input 
                    type="file" 
                    onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                
                {fileToUpload && (
                    <button
                        onClick={handleFileUpload}
                        disabled={saving || !active.isEnabled}
                        className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {saving ? 'Uploading...' : `Upload "${fileToUpload.name.substring(0, 20)}${fileToUpload.name.length > 20 ? '...' : ''}"`}
                    </button>
                )}
            </div>
        )}

        {/* Existing Item Selection */}
        {active.hasItems && active.isEnabled && (
          <div>
            <p className="font-medium text-gray-800 mb-3">Select specific items (optional)</p>
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
                  <p className="text-center text-gray-400 py-6 text-sm">No items found for this source.</p>
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
        )}
      </div>
    );
  };
  
  // Reworked main component structure for better responsiveness
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 max-w-4xl mx-auto h-full">
      <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-3 mb-6 pb-4 text-gray-800 border-b">
        <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
        Configure Knowledge & Tone Sources
      </h2>

      <div className="md:grid md:grid-cols-3 md:gap-8 h-full">
        {/* Left Panel: Source List - Mobile: Only visible when activePanel is 'list' */}
        <div className={`h-full ${activePanel === 'details' ? 'hidden' : 'block md:block'}`}>
          <h3 className="text-lg font-semibold mb-4 text-gray-700 hidden md:block">Available Sources</h3>
          <SourceList />
        </div>

        {/* Right Panel: Source Details - Mobile: Only visible when activePanel is 'details' */}
        <div className={`md:col-span-2 h-full ${activePanel === 'list' ? 'hidden' : 'block md:block'}`}>
          <SourceDetails />
        </div>
      </div>

      {/* Save Button is only for the bulk-save (non-file-upload) sources */}
      {active && active.type !== 'file_upload' && (
          <div className="mt-8 pt-6 border-t flex justify-end">
            <button
              onClick={saveConfiguration}
              disabled={saving || loading || !sources.some(s => s.type !== 'file_upload' && (s.useForTone || s.useForKnowledge))}
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
      )}
    </div>
  );
};