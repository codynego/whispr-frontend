"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Save, Loader2, Globe, Eye, Settings, Clock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface AvatarSettings {
    id: string; // AvatarSettings PK
    is_public: boolean;
    disclaimer_text: string;
    response_delay_ms: number; // For simulating human-like typing speed
    enable_owner_takeover: boolean;
}

interface SettingsFormProps {
    avatarHandle: string;
}

export const SettingsForm = ({ avatarHandle }: SettingsFormProps) => {
    const { accessToken } = useAuth();
    const [settings, setSettings] = useState<AvatarSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);

    // --- Fetch Settings on Load ---
    useEffect(() => {
        if (!accessToken || !avatarHandle) return;

        const fetchSettings = async () => {
            setLoading(true);
            try {
                // Using the proposed convenience route: GET /api/avatars/<handle>/settings/
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/settings/`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                
                if (!res.ok) throw new Error("Failed to load settings.");

                const data = await res.json();
                setSettings(data);
            } catch (error: any) {
                toast.error(error.message || "Error fetching settings.");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [accessToken, avatarHandle]);

    // --- Handlers ---
    const handleChange = (field: keyof AvatarSettings, value: any) => {
        setSettings(prev => prev ? ({ ...prev, [field]: value }) : null);
    };

    const handleSave = async () => {
        if (!accessToken || !settings) return;
        setSaveLoading(true);

        try {
            // Using the proposed convenience route: PATCH /api/avatars/<handle>/settings/
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/settings/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                // Send only the fields that are allowed to be updated
                body: JSON.stringify({
                    is_public: settings.is_public,
                    disclaimer_text: settings.disclaimer_text,
                    response_delay_ms: settings.response_delay_ms,
                    enable_owner_takeover: settings.enable_owner_takeover,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || "Failed to save settings.");
            }

            toast.success("Settings saved successfully!");
        } catch (error: any) {
            toast.error(error.message || "Error saving settings.");
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /> Loading Settings...</div>;
    }

    if (!settings) {
        return <div className="p-8 text-red-500">Could not load settings configuration.</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <Settings className="w-6 h-6 text-emerald-600" />
                Avatar Configuration
            </h2>

            {/* --- Public Visibility --- */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-500" />
                        <label htmlFor="is_public" className="text-base font-medium text-gray-900">
                            Make Avatar Public
                        </label>
                    </div>
                    <input
                        type="checkbox"
                        id="is_public"
                        checked={settings.is_public}
                        onChange={(e) => handleChange('is_public', e.target.checked)}
                        className="h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        disabled={saveLoading}
                    />
                </div>
                <p className="text-sm text-gray-600 ml-8">
                    When checked, your Avatar can be accessed at: 
                    <a href={`/a/${avatarHandle}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline ml-1">
                        /a/{avatarHandle}
                    </a>
                </p>
            </div>

            {/* --- Owner Takeover --- */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-gray-500" />
                        <label htmlFor="enable_takeover" className="text-base font-medium text-gray-900">
                            Enable Owner Takeover
                        </label>
                    </div>
                    <input
                        type="checkbox"
                        id="enable_takeover"
                        checked={settings.enable_owner_takeover}
                        onChange={(e) => handleChange('enable_owner_takeover', e.target.checked)}
                        className="h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        disabled={saveLoading}
                    />
                </div>
                <p className="text-sm text-gray-600 ml-8">
                    Allows you to manually jump into a live chat session with a visitor.
                </p>
            </div>

            {/* --- Response Delay --- */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <label htmlFor="delay" className="text-sm font-medium text-gray-700">
                        Response Delay (Milliseconds)
                    </label>
                </div>
                <input
                    type="number"
                    id="delay"
                    value={settings.response_delay_ms}
                    onChange={(e) => handleChange('response_delay_ms', parseInt(e.target.value) || 0)}
                    min="0"
                    max="5000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
                    disabled={saveLoading}
                />
                <p className="text-xs text-gray-500">Simulates human typing speed (e.g., 1000ms = 1 second).</p>
            </div>

            {/* --- Disclaimer Text --- */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-gray-500" />
                    <label htmlFor="disclaimer" className="text-sm font-medium text-gray-700">
                        Public Disclaimer Text
                    </label>
                </div>
                <textarea
                    id="disclaimer"
                    rows={3}
                    value={settings.disclaimer_text}
                    onChange={(e) => handleChange('disclaimer_text', e.target.value)}
                    placeholder="e.g., 'This is an AI clone and may occasionally make mistakes.'"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
                    disabled={saveLoading}
                ></textarea>
                <p className="text-xs text-gray-500">Displayed at the top of your public chat page.</p>
            </div>

            {/* --- Save Button --- */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg text-base font-medium hover:bg-emerald-700 transition shadow-md disabled:opacity-50"
                    disabled={saveLoading}
                >
                    {saveLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {saveLoading ? "Saving..." : "Save Settings"}
                </button>
            </div>
        </div>
    );
};