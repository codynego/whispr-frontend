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
} from "lucide-react";
import toast from "react-hot-toast";

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

const CONFIG: SourceConfig[] = [
  { type: "notes", label: "Whisone Notes", icon: Book, isEnabled: true, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: true },
  { type: "reminders", label: "Reminders", icon: Calendar, isEnabled: true, useForTone: false, useForKnowledge: true, selectedIds: [], hasItems: true },
  { type: "todos", label: "To-Dos", icon: CheckSquare, isEnabled: true, useForTone: false, useForKnowledge: true, selectedIds: [], hasItems: true },
  { type: "uploads", label: "File Uploads", icon: Upload, isEnabled: true, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: true },
  { type: "gmail", label: "Gmail", icon: Mail, isEnabled: false, useForTone: true, useForKnowledge: true, selectedIds: [], hasItems: false },
  { type: "website", label: "Website", icon: Globe, isEnabled: false, useForTone: false, useForKnowledge: true, selectedIds: [], hasItems: false },
];

const ENDPOINTS: Record<string, string> = {
  notes: "notes/",
  reminders: "reminders/",
  todos: "todos/",
  uploads: "files/",
};

export const SourceSelector = ({ avatarHandle, onSaveSuccess }: Props) => {
  const { accessToken } = useAuth();
  const [sources, setSources] = useState(CONFIG);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeType, setActiveType] = useState<SourceType | null>(null);

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

  const save = async () => {
    if (!accessToken) return;
    setSaving(true);

    const payload = sources
      sources
        .map((s) => {
          if (!s.isEnabled) return null;
          const tone = s.useForTone;
          const knowledge = s.useForKnowledge;
          if (!tone && !knowledge) return null;

          return {
            source_type: s.type,
            include_for_tone: tone,
            include_for_knowledge: knowledge,
            metadata: s.hasItems ? { ids: s.selectedIds } : {},
          };
        })
        .filter(Boolean) || [];

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/avatars/${avatarHandle}/sources/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Save failed");
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

  const Icon = ({ type }: { type: SourceType }) => {
    const cfg = CONFIG.find((c) => c.type === type);
    const C = cfg?.icon || Settings;
    return <C className="w-5 h-5 text-emerald-600" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-emerald-600" />
        Knowledge & Tone Sources
      </h2>

      <div className="grid grid-cols-3 gap-8">
        {/* Left */}
        <div className="space-y-2">
          {sources.map((s) => (
            <button
              key={s.type}
              onClick={() => {
                setActiveType(s.type);
                if (s.hasItems && !s.items) fetchItems(s.type);
              }}
              className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition ${
                activeType === s.type
                  ? "bg-emerald-50 border border-emerald-300"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon type={s.type} />
                <span className="font-medium text-sm">{s.label}</span>
              </div>
              {s.isEnabled && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="col-span-2">
          {active ? (
            <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Icon type={active.type} />
                {active.label}
              </h3>

              <div className="bg-gray-50 rounded-lg p-5 space-y-5">
                <label className="flex items-center justify-between">
                  <span className="font-medium">Enable Source</span>
                  <input
                    type="checkbox"
                    checked={active.isEnabled}
                    onChange={(e) => toggle(active.type, "isEnabled", e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span>Use for <strong>Tone</strong></span>
                  <input
                    type="checkbox"
                    checked={active.useForTone}
                    onChange={(e) => toggle(active.type, "useForTone", e.target.checked)}
                    disabled={!active.isEnabled}
                    className="w-5 h-5 text-emerald-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span>Use for <strong>Knowledge</strong></span>
                  <input
                    type="checkbox"
                    checked={active.useForKnowledge}
                    onChange={(e) => toggle(active.type, "useForKnowledge", e.target.checked)}
                    disabled={!active.isEnabled}
                    className="w-5 h-5 text-emerald-600 rounded"
                  />
                </label>
              </div>

              {active.hasItems && (
                <div>
                  <p className="font-medium mb-3">Select items (optional)</p>
                  <div className="border rounded-lg max-h-64 overflow-y-auto bg-white">
                    {active.items ? (
                      active.items.length > 0 ? (
                        active.items.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 border-b last:border-0"
                          >
                            <span className="text-sm truncate pr-4">{item.title}</span>
                            <input
                              type="checkbox"
                              checked={active.selectedIds.includes(item.id)}
                              onChange={(e) => toggleItem(active.type, item.id, e.target.checked)}
                              disabled={!active.isEnabled}
                              className="w-4 h-4 text-emerald-600 rounded"
                            />
                          </label>
                        ))
                      ) : (
                        <p className="text-center text-gray-400 py-6">No items</p>
                      )
                    ) : loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Leave empty = include <strong>all</strong>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <Settings className="w-12 h-12 mx-auto mb-4" />
              <p>Select a source to configure</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t flex justify-end">
        <button
          onClick={save}
          disabled={saving || loading}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
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