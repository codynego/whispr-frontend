"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Save, Loader2, Globe, Eye, Zap, Clock, AlertCircle, Settings } from "lucide-react";
import toast from "react-hot-toast";

interface AvatarSettings {
  id: string;
  is_public: boolean;
  disclaimer_text: string;
  response_delay_ms: number;
  enable_owner_takeover: boolean;
}

interface SettingsFormProps {
  avatarHandle: string;
}

export const SettingsForm = ({ avatarHandle }: SettingsFormProps) => {
  const { accessToken } = useAuth();
  const [settings, setSettings] = useState<AvatarSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!accessToken) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/settings/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Failed to load settings");
        }

        const data: AvatarSettings = await res.json();
        setSettings(data);
      } catch (err: any) {
        toast.error(err.message || "Could not load avatar settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [avatarHandle, accessToken]);

  const updateField = <K extends keyof AvatarSettings>(
    field: K,
    value: AvatarSettings[K]
  ) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = async () => {
    if (!settings || !accessToken) return;

    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/settings/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            is_public: settings.is_public,
            disclaimer_text: settings.disclaimer_text,
            response_delay_ms: settings.response_delay_ms,
            enable_owner_takeover: settings.enable_owner_takeover,
          }),
        }
      );
      console.log("Settings save payload:", {
        is_public: settings.is_public,
        disclaimer_text: settings.disclaimer_text,
        response_delay_ms: settings.response_delay_ms,
        enable_owner_takeover: settings.enable_owner_takeover,
      });

      console.log("Settings save response status:", res);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to save settings");
      }

      toast.success("Settings saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading settings...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-700 font-medium">Failed to load avatar settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="w-7 h-7 text-emerald-600" />
          Avatar Settings
        </h2>
        <p className="text-gray-600 mt-2">Configure visibility, behavior, and user experience</p>
      </div>

      <div className="space-y-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
        {/* Public Visibility */}
        <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-start gap-4">
            <Globe className="w-6 h-6 text-emerald-600 mt-0.5" />
            <div>
              <label className="text-base font-semibold text-gray-900">Make Avatar Public</label>
              <p className="text-sm text-gray-600 mt-1">
                Anyone can chat with your avatar at:{" "}
                <a
                  href={`/a/${avatarHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-600 hover:underline"
                >
                  whispr.ai/a/{avatarHandle}
                </a>
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.is_public}
              onChange={(e) => updateField("is_public", e.target.checked)}
              className="sr-only peer"
              disabled={saving}
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Owner Takeover */}
        <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-start gap-4">
            <Zap className="w-6 h-6 text-yellow-600 mt-0.5" />
            <div>
              <label className="text-base font-semibold text-gray-900">Enable Owner Takeover</label>
              <p className="text-sm text-gray-600 mt-1">
                Jump into live conversations and respond manually as the avatar owner
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enable_owner_takeover}
              onChange={(e) => updateField("enable_owner_takeover", e.target.checked)}
              className="sr-only peer"
              disabled={saving}
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Response Delay */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <label className="text-base font-medium text-gray-900">Typing Delay (ms)</label>
          </div>
          <input
            type="number"
            min="0"
            max="10000"
            step="100"
            value={settings.response_delay_ms}
            onChange={(e) => updateField("response_delay_ms", parseInt(e.target.value) || 0)}
            className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            disabled={saving}
          />
          <p className="text-sm text-gray-500">
            {settings.response_delay_ms === 0
              ? "Instant replies"
              : `Simulates human typing (~${(settings.response_delay_ms / 1000).toFixed(1)}s delay)`}
          </p>
        </div>

        {/* Disclaimer Text */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-gray-500" />
            <label className="text-base font-medium text-gray-900">Public Disclaimer</label>
          </div>
          <textarea
            rows={4}
            value={settings.disclaimer_text}
            onChange={(e) => updateField("disclaimer_text", e.target.value)}
            placeholder="e.g. This is an AI version of me. I may occasionally make mistakes or hallucinate."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-none"
            disabled={saving}
          />
          <p className="text-sm text-gray-500">
            Shown at the top of your public chat page (only visible when public)
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-3 shadow-lg transition"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};