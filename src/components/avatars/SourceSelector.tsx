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
} from "lucide-react";
import toast from "react-hot-toast";

// --- Type Definitions ---
type SourceType = "notes" | "reminders" | "todos" | "uploads" | "gmail" | "website";

interface Item {
  id: string | number;
  title: string;
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
}

interface Props {
  avatarHandle: string;
  onSaveSuccess: () => void;
}

// --- Configuration ---
const CONFIG: SourceConfig[] = [
  { type: "notes", label: "Whisone Notes", icon: Book, isEnabled: false, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: true },
  { type: "reminders", label: "Reminders", icon: Calendar, isEnabled: false, useForTone: false, useForKnowledge: false, selectedIds: [], hasItems: true },
  { type: "todos", label: "To-Dos", icon: CheckSquare, isEnabled: false, useForTone: false, useForKnowledge: false, selectedIds: [], hasItems: true },
  { type: "uploads", label: "File Uploads", icon: Upload, isEnabled: false, useForTone: true, useForKnowledge: false, selectedIds: [], hasItems: true },
  { type: "gmail", label: "Gmail", icon: Mail, isEnabled: false, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: false },
  { type: "website", label: "Website", icon: Globe, isEnabled: false, useForTone: false, useForKnowledge: false, selectedIds: [], hasItems: false },
];

const ENDPOINTS: Record<string, string> = {
  notes: "notes/",
  reminders: "reminders/",
  todos: "todos/",
  uploads: "files/",
};

// --- Component Start ---
export const SourceSelector = ({ avatarHandle, onSaveSuccess }: Props) => {
  const { accessToken } = useAuth();
  const [sources, setSources] = useState(CONFIG);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activePanel, setActivePanel] = useState<'list' | 'details'>('list'); 
  const [activeType, setActiveType] = useState<SourceType | null>(null);

  // 🐛 FIX: Rewritten Icon Helper for robust checking
  const Icon = ({ type, className }: { type: SourceType, className?: string }) => {
    const cfg = CONFIG.find((c) => c.type === type);
    
    // 💡 Explicitly check for configuration existence before accessing properties
    if (cfg && cfg.icon) {
        const C = cfg.icon;
        return <C className={`w-5 h-5 text-emerald-600 ${className || ''}`} />;
    }
    
    // Fallback if config is missing (should not happen with correct types)
    return <Settings className={`w-5 h-5 text-gray-400 ${className || ''}`} />;
  };

  const fetchItems = useCallback(
    async (type: SourceType) => {
      const endpoint = ENDPOINTS[type];
      if (!endpoint || !accessToken) return;

      const src = sources.find((s) => s.type === type);
      if (src?.items) return;

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
        toast.error(`Failed to load ${type}`);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, sources]
  );

  useEffect(() => {
    if (accessToken) {
      fetchItems("notes");
      fetchItems("uploads");
    }
  }, [accessToken]);

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
    setActivePanel('details'); 
  };

  const save = async () => {
    if (!accessToken) return;
    setSaving(true);

    const payload = sources
      .map((s) => {
        const tone = s.useForTone;
        const knowledge = s.useForKnowledge;
        
        if (!tone && !knowledge) return null;

        const sourcePayload = {
          source_type: s.type,
          include_for_tone: tone,
          include_for_knowledge: knowledge,
          metadata: s.hasItems ? { ids: s.selectedIds } : {},
        };
        
        return sourcePayload;
      })
      .filter(Boolean); 

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/sources/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      console.log("payload sent", payload)

      if (!res.ok) {
        // Log the detailed backend error to the browser console for debugging
        const errorData = await res.json().catch(() => ({})); 
        console.error("DRF Validation Error (400):", errorData);
        
        let message = errorData.detail || "Save failed";
        if (Array.isArray(errorData) && errorData.length > 0) {
            // Provide a generic message and point user to the console for the array details
            message = `Validation failed for ${errorData.length} item(s). Check console for specific field errors.`;
        }
        
        throw new Error(message);
      }

      toast.success("Sources saved!");
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
    <div className={`space-y-2 ${activePanel === 'details' ? 'hidden md:block' : 'block'}`}>
      {sources.map((s) => (
        <button
          key={s.type}
          onClick={() => handleSourceSelect(s.type, s.hasItems, s.items)}
          className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition border-2 
            ${
              activeType === s.type
                ? "bg-emerald-50 border-emerald-400"
                : "hover:bg-gray-50 border-transparent"
            }`}
        >
          <div className="flex items-center gap-3">
            <Icon type={s.type} />
            <span className="font-semibold text-sm">{s.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {s.isEnabled && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
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
                onClick={() => setActivePanel('list')} 
                className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-emerald-600 md:hidden"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-5 space-y-5 border border-gray-200">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="font-medium text-gray-800">Enable Source</span>
            <input
              type="checkbox"
              checked={active.isEnabled}
              onChange={(e) => toggle(active.type, "isEnabled", e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>

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

        {active.hasItems && active.isEnabled && (
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

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-extrabold flex items-center gap-3 mb-6 border-b pb-4 text-gray-800">
        <Brain className="w-7 h-7 text-emerald-600" />
        Configure Knowledge & Tone Sources
      </h2>

      <div className="md:grid md:grid-cols-3 md:gap-8">
        {/* Left Panel: Source List - Visible on all screen sizes */}
        <div className={`md:block ${activePanel === 'details' ? 'hidden' : 'block'}`}>
          <SourceList />
        </div>

        {/* Right Panel: Source Details - Mobile: Toggles visibility; Desktop: Always visible */}
        <div className={`md:col-span-2 ${activePanel === 'list' ? 'hidden' : 'block md:block'}`}>
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
    </div>
  );
};