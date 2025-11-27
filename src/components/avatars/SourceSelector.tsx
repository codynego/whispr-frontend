"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  Calendar,
  ListChecks,
  Upload,
  Mail,
  Globe,
  Settings,
  Loader2,
  Save,
  Brain,
} from "lucide-react";
import toast from "react-hot-toast";

// --- Types ---
type SourceType =
  | "notes"
  | "reminders"
  | "todos"
  | "uploads"
  | "gmail"
  | "website";

interface UnifiedItem {
  id: string | number;
  title: string;
  description?: string;
}

interface AvatarSourceConfig {
  type: SourceType;
  label: string;
  icon: React.ElementType;
  isEnabled: boolean;
  includeForTone: boolean;
  includeForKnowledge: boolean;
  selectedIds: (string | number)[];
  data?: UnifiedItem[];
  hasDetailView: boolean;
}

interface SourceSelectorProps {
  avatarHandle: string;
  onSaveSuccess: () => void;
}

// --- Config ---
const SOURCES_CONFIG: AvatarSourceConfig[] = [
  { type: "notes", label: "Whisone Notes", icon: BookOpen, isEnabled: true, includeForTone: true, includeForKnowledge: true, selectedIds: [], hasDetailView: true },
  { type: "reminders", label: "Reminders & Tasks", icon: Calendar, isEnabled: false, includeForTone: false, includeForKnowledge: true, selectedIds: [], hasDetailView: true },
  { type: "todos", label: "To-Dos", icon: ListChecks, isEnabled: false, includeForTone: false, includeForKnowledge: true, selectedIds: [], hasDetailView: true },
  { type: "uploads", label: "File Uploads", icon: Upload, isEnabled: true, includeForTone: true, includeForKnowledge: true, selectedIds: [], hasDetailView: true },
  { type: "gmail", label: "Gmail Emails", icon: Mail, isEnabled: false, includeForTone: true, includeForKnowledge: true, selectedIds: [], hasDetailView: false },
  { type: "website", label: "Website Crawl", icon: Globe, isEnabled: false, includeForTone: false, includeForKnowledge: true, selectedIds: [], hasDetailView: false },
];

// Map source type → unified API endpoint
const getUnifiedEndpoint = (type: SourceType): string | null => {
  const map: Record<string, string> = {
    notes: "notes/",
    reminders: "reminders/",
    todos: "todos/",
    uploads: "files/",
  };
  return map[type] || null;
};

export const SourceSelector = ({ avatarHandle, onSaveSuccess }: SourceSelectorProps) => {
  const { accessToken } = useAuth();
  const [sources, setSources] = useState<AvatarSourceConfig[]>(SOURCES_CONFIG);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeSourceType, setActiveSourceType] = useState<SourceType | null>(null);

  // Fetch items for detail views
  const fetchSourceData = useCallback(
    async (type: SourceType) => {
      const endpoint = getUnifiedEndpoint(type);
      if (!endpoint || !accessToken) return;

      const existing = sources.find((s) => s.type === type);
      if (existing?.data?.length) return; // already loaded

      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/${endpoint}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error("Failed to load items");

        const json = await res.json();
        const items: UnifiedItem[] = json.results || json;

        setSources((prev) =>
          prev.map((s) =>
            s.type === type ? { ...s, data: items } : s
          )
        );
      } catch (err: any) {
        toast.error(`Failed to load ${type}: ${err.message}`);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, sources]
  );

  // Preload notes & uploads
  useEffect(() => {
    if (accessToken) {
      fetchSourceData("notes");
      fetchSourceData("uploads");
    }
  }, [accessToken, fetchSourceData]);

  const handleSetActiveSource = (type: SourceType) => {
    setActiveSourceType(type);
    const src = sources.find((s) => s.type === type);
    if (src?.hasDetailView && !src.data?.length) {
      fetchSourceData(type);
    }
  };

  const toggleSourceField = (
    type: SourceType,
    field: "isEnabled" | "includeForTone" | "includeForKnowledge",
    value: boolean
  ) => {
    setSources((prev) =>
      prev.map((s) => {
        if (s.type !== type) return s;

        const updated = { ...s, [field]: value };

        // Auto-disable tone/knowledge when main toggle is off
        if (field === "isEnabled" && !value) {
          updated.includeForTone = false;
          updated.includeForKnowledge = false;
        }

        return updated;
      })
    );
  };

  const toggleItem = (type: SourceType, itemId: string | number, checked: boolean) => {
    setSources((prev) =>
      prev.map((s) =>
        s.type === type
          ? {
              ...s,
              selectedIds: checked
                ? [...s.selectedIds, itemId]
                : s.selectedIds.filter((id) => id !== itemId),
            }
          : s
      )
    );
  };

  // ────────────────────── SAVE HANDLER (NOW BULLETPROOF) ──────────────────────
  const handleSaveSources = async () => {
    if (!accessToken) return;

    setSaveLoading(true);

    // Build clean payload — only send sources that do something
    const payload = sources
      .map((s) => {
        const enabled = s.isEnabled;
        const tone = s.includeForTone && enabled;
        const knowledge = s.includeForKnowledge && enabled;

        // Skip completely disabled sources
        if (!enabled && !tone && !knowledge) return null;

        const metadata: any = {};

        // Always send { ids: [...] } for detail-view sources
        if (s.hasDetailView) {
          metadata.ids = s.selectedIds;
        }
        // For gmail/website currently don't use ids → send empty object
        // but you can extend later (e.g. { url: "..." })

        return {
          source_type: s.type,
          include_for_tone: tone,
          include_for_knowledge: knowledge,
          metadata,
        };
      })
      .filter(Boolean); // remove nulls

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/sources/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload), // [] is allowed and means "clear all"
      });
      console.log("payload", payload);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.message || "Save failed");
      }

      toast.success("Sources saved successfully!");
      onSaveSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to save sources");
    } finally {
      setSaveLoading(false);
    }
  };

  const activeSource = sources.find((s) => s.type === activeSourceType);

  const SourceIcon = ({ type }: { type: SourceType }) => {
    const cfg = SOURCES_CONFIG.find((c) => c.type === type);
    const Icon = cfg?.icon || Settings;
    return <Icon className="w-5 h-5 text-emerald-500" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
        <Brain className="w-6 h-6 text-emerald-600" />
        Knowledge and Tone Sources
      </h2>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Source List */}
        <div className="col-span-1 border-r border-gray-100 pr-6 space-y-3">
          <p className="text-sm font-medium text-gray-700 mb-3">Available Sources</p>
          {sources.map((source) => (
            <button
              key={source.type}
              onClick={() => handleSetActiveSource(source.type)}
              className={`w-full p-3 rounded-lg flex items-center justify-between transition-all text-left
                ${activeSourceType === source.type
                  ? "bg-emerald-50 border border-emerald-300 shadow-sm"
                  : "hover:bg-gray-50"
                }`}
            >
              <div className="flex items-center gap-3">
                <SourceIcon type={source.type} />
                <span className="text-sm font-medium">{source.label}</span>
              </div>
              {source.isEnabled && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
            </button>
          ))}
        </div>

        {/* Right: Config Panel */}
        <div className="col-span-2">
          {activeSource ? (
            <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <SourceIcon type={activeSource.type} />
                {activeSource.label}
              </h3>

              <div className="bg-gray-50 p-5 rounded-lg space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Enable Source</span>
                  <input
                    type="checkbox"
                    checked={activeSource.isEnabled}
                    onChange={(e) => toggleSourceField(activeSource.type, "isEnabled", e.target.checked)}
                    className="h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Use for <strong>Tone</strong></span>
                  <input
                    type="checkbox"
                    checked={activeSource.includeForTone}
                    onChange={(e) => toggleSourceField(activeSource.type, "includeForTone", e.target.checked)}
                    disabled={!activeSource.isEnabled}
                    className="h-5 w-5 text-emerald-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Use for <strong>Knowledge</strong> (RAG)</span>
                  <input
                    type="checkbox"
                    checked={activeSource.includeForKnowledge}
                    onChange={(e) => toggleSourceField(activeSource.type, "includeForKnowledge", e.target.checked)}
                    disabled={!activeSource.isEnabled}
                    className="h-5 w-5 text-emerald-600 rounded"
                  />
                </label>
              </div>

              {activeSource.hasDetailView && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-900 mb-3">
                    Select specific items (optional)
                  </p>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg bg-white p-3">
                    {activeSource.data ? (
                      activeSource.data.length > 0 ? (
                        activeSource.data.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-gray-50 px-2 -mx-2 rounded"
                          >
                            <span className="text-sm text-gray-700 truncate pr-4">
                              {item.title}
                            </span>
                            <input
                              type="checkbox"
                              checked={activeSource.selectedIds.includes(item.id)}
                              onChange={(e) => toggleItem(activeSource.type, item.id, e.target.checked)}
                              disabled={!activeSource.isEnabled}
                              className="h-4 w-4 text-emerald-600 rounded"
                            />
                          </label>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">No items found</p>
                      )
                    ) : loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">Click to load items...</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Leave empty to include <strong>all</strong> items of this type.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-gray-400">
              <Settings className="w-12 h-12 mb-4" />
              <p>Select a source to configure</p>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
        <button
          onClick={handleSaveSources}
          disabled={saveLoading || loading}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveLoading ? (
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