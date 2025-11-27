"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Calendar, ListChecks, Upload, Mail, Globe, Settings, Loader2, Save, Send } from "lucide-react";
import toast from "react-hot-toast";
import { Brain } from "lucide-react";

// --- Types (Assumed imported from types/avatar.ts) ---
type SourceType = "notes" | "reminders" | "todos" | "uploads" | "gmail" | "manual" | "website";
interface UnifiedItem { id: string | number; title: string; description?: string; }
interface AvatarSourceConfig {
    type: SourceType;
    label: string;
    icon: React.ElementType; // Add this line
    isEnabled: boolean;
    includeForTone: boolean;
    includeForKnowledge: boolean;
    selectedIds: (string | number)[];
    data?: UnifiedItem[];
    metadata?: any;
    hasDetailView: boolean;
}
// -----------------------------------------------------

interface SourceSelectorProps {
    avatarHandle: string;
    onSaveSuccess: () => void; // Called after successful source save
}

// Initial structure for all source types
const INITIAL_SOURCES: AvatarSourceConfig[] = [
    { type: "notes", label: "Whisone Notes", icon: BookOpen, isEnabled: true, includeForTone: true, includeForKnowledge: true, selectedIds: [], hasDetailView: true },
    { type: "reminders", label: "Reminders & Tasks", icon: Calendar, isEnabled: false, includeForTone: false, includeForKnowledge: true, selectedIds: [], hasDetailView: false }, // Simpler, just enable/disable
    { type: "todos", label: "To-Dos", icon: ListChecks, isEnabled: false, includeForTone: false, includeForKnowledge: true, selectedIds: [], hasDetailView: false }, // Simpler, just enable/disable
    { type: "uploads", label: "File Uploads", icon: Upload, isEnabled: true, includeForTone: true, includeForKnowledge: true, selectedIds: [], hasDetailView: true },
    { type: "gmail", label: "Gmail Emails", icon: Mail, isEnabled: false, includeForTone: true, includeForKnowledge: true, selectedIds: [], hasDetailView: true }, // Special handling via integrations
    { type: "website", label: "Website Crawl", icon: Globe, isEnabled: false, includeForTone: false, includeForKnowledge: true, selectedIds: [], hasDetailView: true }, // Placeholder
];

// Helper to determine the unified API endpoint based on source type
const getUnifiedEndpoint = (type: SourceType) => {
    switch (type) {
        case 'notes': return 'notes/';
        case 'reminders': return 'reminders/';
        case 'todos': return 'todos/';
        case 'uploads': return 'files/';
        default: return null;
    }
};


export const SourceSelector = ({ avatarHandle, onSaveSuccess }: SourceSelectorProps) => {
    const { accessToken } = useAuth();
    const [sources, setSources] = useState<AvatarSourceConfig[]>(INITIAL_SOURCES);
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [activeSourceType, setActiveSourceType] = useState<SourceType | null>(null);

    // --- Data Fetching: Fetches all unified items for populating detail views ---
    const fetchSourceData = useCallback(async (type: SourceType) => {
        const endpoint = getUnifiedEndpoint(type);
        if (!endpoint || !accessToken) return;

        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/unified/${endpoint}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok) throw new Error(`Failed to fetch ${type}`);
            
            const data = await res.json();
            
            setSources(prev => prev.map(source => 
                source.type === type 
                ? { ...source, data: data.results || data } 
                : source
            ));
        } catch (error: any) {
            toast.error(`Could not load ${type}: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);


    // Load data for initial detail views (Notes and Files)
    useEffect(() => {
        if (accessToken) {
            fetchSourceData('notes');
            fetchSourceData('uploads');
            // GMAIL: fetch integrations status here
        }
    }, [accessToken, fetchSourceData]);


    // --- Handlers ---
    const handleToggleSource = (type: SourceType, field: keyof AvatarSourceConfig, value: boolean) => {
        setSources(prev => prev.map(source => 
            source.type === type ? { ...source, [field]: value } : source
        ));
    };

    const handleToggleItem = (type: SourceType, itemId: string | number, isChecked: boolean) => {
        setSources(prev => prev.map(source => {
            if (source.type === type) {
                const newIds = isChecked
                    ? [...source.selectedIds, itemId]
                    : source.selectedIds.filter(id => id !== itemId);
                return { ...source, selectedIds: newIds };
            }
            return source;
        }));
    };

    // --- API Save Handler ---
    const handleSaveSources = async () => {
        if (!accessToken) return;
        setSaveLoading(true);

        const payload = sources
            .filter(s => s.isEnabled || s.includeForTone || s.includeForKnowledge) // Only send active or configured sources
            .map(s => ({
                source_type: s.type,
                include_for_tone: s.includeForTone && s.isEnabled,
                include_for_knowledge: s.includeForKnowledge && s.isEnabled,
                metadata: s.hasDetailView && s.selectedIds.length > 0 ? { ids: s.selectedIds } : {}, // Send IDs if available
            }));

        try {
            // Note: This endpoint is scoped by handle in the URL, not the payload
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/sources/`, {
                method: "POST", // POST /api/avatars/<handle>/sources/ (convenience route)
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save avatar sources.");

            toast.success("Avatar sources updated!");
            onSaveSuccess();
        } catch (error: any) {
            toast.error(error.message || "Error saving source configuration.");
        } finally {
            setSaveLoading(false);
        }
    };

    // --- Render Helpers ---
    const activeSource = sources.find(s => s.type === activeSourceType);

    const SourceIcon = ({ type }: { type: SourceType }) => {
        const source = INITIAL_SOURCES.find(s => s.type === type);
        return source?.icon ? <source.icon className="w-5 h-5 text-emerald-500" /> : <Settings className="w-5 h-5 text-gray-400" />;
    };


    // --- Render Component ---
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <Brain className="w-6 h-6 text-emerald-600" />
                Knowledge and Tone Sources
            </h2>

            <div className="grid grid-cols-3 gap-6">
                
                {/* 1. Source List (Left Column) */}
                <div className="col-span-1 border-r border-gray-100 pr-6 space-y-4">
                    <p className="text-sm font-medium text-gray-700">Available Data Sources</p>
                    {sources.map(source => (
                        <div key={source.type} className={`p-3 rounded-lg flex items-center justify-between transition cursor-pointer 
                            ${source.type === activeSourceType ? 'bg-emerald-50 border border-emerald-300' : 'hover:bg-gray-50'}`}
                            onClick={() => setActiveSourceType(source.type)}
                        >
                            <div className="flex items-center gap-3">
                                <SourceIcon type={source.type} />
                                <span className="text-sm font-medium">{source.label}</span>
                            </div>
                            <Settings className="w-4 h-4 text-gray-400" />
                        </div>
                    ))}
                </div>

                {/* 2. Configuration Panel (Right Columns) */}
                <div className="col-span-2">
                    {activeSource ? (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <SourceIcon type={activeSource.type} />
                                {activeSource.label} Configuration
                            </h3>

                            {/* Core Toggles */}
                            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                    <label htmlFor={`${activeSource.type}-enabled`} className="text-sm font-medium text-gray-900">
                                        Enable Source
                                    </label>
                                    <input
                                        type="checkbox"
                                        id={`${activeSource.type}-enabled`}
                                        checked={activeSource.isEnabled}
                                        onChange={(e) => handleToggleSource(activeSource.type, 'isEnabled', e.target.checked)}
                                        className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                    />
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <label htmlFor={`${activeSource.type}-tone`} className="text-sm text-gray-700">
                                        Include for Writing **Tone**
                                    </label>
                                    <input
                                        type="checkbox"
                                        id={`${activeSource.type}-tone`}
                                        checked={activeSource.includeForTone}
                                        onChange={(e) => handleToggleSource(activeSource.type, 'includeForTone', e.target.checked)}
                                        disabled={!activeSource.isEnabled}
                                        className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label htmlFor={`${activeSource.type}-knowledge`} className="text-sm text-gray-700">
                                        Include for **Knowledge** (RAG)
                                    </label>
                                    <input
                                        type="checkbox"
                                        id={`${activeSource.type}-knowledge`}
                                        checked={activeSource.includeForKnowledge}
                                        onChange={(e) => handleToggleSource(activeSource.type, 'includeForKnowledge', e.target.checked)}
                                        disabled={!activeSource.isEnabled}
                                        className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Detail View / Item Selection */}
                            {activeSource.hasDetailView && (
                                <div className="mt-6">
                                    <p className="text-sm font-medium text-gray-900 mb-2">Select Specific Items (Optional Filtering):</p>
                                    <div className="h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
                                        {activeSource.data ? (
                                            activeSource.data.map(item => (
                                                <div key={item.id} className="flex items-center justify-between py-1.5 border-b last:border-b-0">
                                                    <span className="text-sm text-gray-700 truncate">{item.title}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={activeSource.selectedIds.includes(item.id)}
                                                        onChange={(e) => handleToggleItem(activeSource.type, item.id, e.target.checked)}
                                                        className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                                        disabled={!activeSource.isEnabled}
                                                    />
                                                </div>
                                            ))
                                        ) : loading ? (
                                            <div className="flex items-center justify-center h-full text-gray-500">
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading data...
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                                No specific item selection needed or data not loaded.
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">If no items are selected, all available items for this source type will be used for training.</p>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 border border-dashed border-gray-300 rounded-xl p-8">
                            <Send className="w-6 h-6 mr-3" /> Select a source on the left to configure its use.
                        </div>
                    )}
                </div>
            </div>

            {/* Global Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                <button
                    onClick={handleSaveSources}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg text-base font-medium hover:bg-emerald-700 transition shadow-md disabled:opacity-50"
                    disabled={saveLoading || loading}
                >
                    {saveLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {saveLoading ? "Saving Configuration..." : "Save Source Configuration"}
                </button>
            </div>
        </div>
    );
};