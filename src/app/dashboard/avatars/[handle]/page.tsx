"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Brain, Settings, BarChart3, Loader2, Lock, Globe, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

import { SourceSelector } from "@/components/avatars/SourceSelector";
import { TrainingTriggerButton } from "@/components/avatars/TrainingTriggerButton";
import { TrainingStatusMonitor } from "@/components/avatars/TrainingStatusMonitor";
import { SettingsForm } from "@/components/avatars/SettingsForm";
import { AnalyticsDisplay } from "@/components/avatars/AnalyticsDisplay";
import { DeleteAvatarButton } from "@/components/avatars/DeleteAvatarButton";

type Tab = "training" | "settings" | "analytics";

interface AvatarSettings {
  is_public: boolean;
  // add other settings fields here if needed
}

interface FullAvatarData {
  id: string;
  name: string;
  handle: string;
  photo: string | null;
  last_training_job_id: string | null;
  settings: AvatarSettings;
}

type ManualCheckFunction = (jobId: string) => Promise<void>;

export default function AvatarConfigurationPage({ params }: { params: { handle: string } }) {
  const { accessToken } = useAuth();
  const avatarHandle = params.handle;

  const [fullAvatarData, setFullAvatarData] = useState<FullAvatarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("training");
  const [isConfigSaved, setIsConfigSaved] = useState(true);
  const [apiJobId, setApiJobId] = useState<string | null>(null);
  const [manualCheckFunction, setManualCheckFunction] = useState<ManualCheckFunction | null>(null);

  const fetchAvatarDetails = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to load avatar");
      const data: FullAvatarData = await res.json();
      setFullAvatarData(data);
      setApiJobId(data.last_training_job_id);
      setIsConfigSaved(true);
    } catch {
      toast.error("Failed to load avatar");
      setFullAvatarData(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, avatarHandle]);

  useEffect(() => { fetchAvatarDetails(); }, [fetchAvatarDetails]);

  const handleConfigSave = () => setIsConfigSaved(true);
  const handleJobComplete = () => { setApiJobId(null); fetchAvatarDetails(); };
  const handleTrainingStart = (jobId: string) => setApiJobId(jobId);
  const handleManualCheckSetup = useCallback((func: ManualCheckFunction) => {
    setManualCheckFunction(() => func);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Loading avatar...</p>
        </div>
      </div>
    );
  }

  if (!fullAvatarData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600">Avatar Not Found</h2>
          <p className="text-gray-600 mt-2">@{avatarHandle}</p>
        </div>
      </div>
    );
  }

  const isPublic = fullAvatarData.settings?.is_public ?? false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-full px-4 py-8 md:px-8 lg:px-12 xl:max-w-7xl xl:mx-auto">

        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-100 rounded-3xl flex items-center justify-center shadow-xl flex-shrink-0">
                <Brain className="w-10 h-10 md:w-12 md:h-12 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight break-words">
                  {fullAvatarData.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="text-lg md:text-xl text-gray-500">@{fullAvatarData.handle}</span>
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium
                    ${isPublic ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-700"}`}>
                    {isPublic ? <Globe className="w-3 h-3 md:w-4 md:h-4" /> : <Lock className="w-3 h-3 md:w-4 md:h-4" />}
                    {isPublic ? "Public" : "Private"}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Tab Menu */}
            <div className="md:hidden">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as Tab)}
                className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl font-medium shadow-sm"
              >
                <option value="training">Training & Sources</option>
                <option value="settings">Settings</option>
                <option value="analytics">Analytics</option>
              </select>
            </div>

            {/* Desktop Tabs */}
            <nav className="hidden md:flex gap-2 bg-white p-1.5 rounded-2xl shadow-lg border border-gray-100">
              {[
                { id: "training", icon: Brain, label: "Training" },
                { id: "settings", icon: Settings, label: "Settings" },
                { id: "analytics", icon: BarChart3, label: "Analytics" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as Tab)}
                  className={`flex items-center gap-3 px-6 py-3.5 rounded-xl font-semibold transition
                    ${activeTab === id 
                      ? "bg-indigo-600 text-white shadow-md" 
                      : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden lg:inline">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* TRAINING TAB */}
        {activeTab === "training" && (
          <div className="space-y-10 md:space-y-12">

            {/* Full-Width Source Selector */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 md:p-10 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Brain className="w-8 h-8 md:w-10 md:h-10 text-indigo-600" />
                  Training Data Sources
                </h2>
                <p className="text-base md:text-lg text-gray-600 mt-2">
                  Choose what your AI learns from — full control, full width.
                </p>
              </div>

              <div className="p-6 md:p-10">
                <SourceSelector
                  avatarHandle={avatarHandle}
                  onSaveSuccess={handleConfigSave}
                />
              </div>
            </div>

            {/* 2-Column Actions – Stacks beautifully on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Training Status */}
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <BarChart3 className="w-7 h-7 md:w-8 md:h-8 text-indigo-600" />
                  Training Status
                </h3>

                <TrainingStatusMonitor
                  jobId={apiJobId}
                  avatarHandle={avatarHandle}
                  onJobComplete={handleJobComplete}
                  onManualCheck={handleManualCheckSetup}
                />

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <TrainingTriggerButton
                    avatarHandle={avatarHandle}
                    isConfigSaved={isConfigSaved}
                    onTrainingStart={handleTrainingStart}
                  />
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl md:rounded-3xl border-2 border-red-200 p-6 md:p-8 shadow-xl">
                <div className="flex items-start gap-4 mb-6">
                  <AlertTriangle className="w-9 h-9 md:w-10 md:h-10 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-red-900">Danger Zone</h3>
                    <p className="text-red-700 text-sm mt-1">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-sm md:text-base text-red-800 mb-8 leading-relaxed">
                  Permanently delete this avatar and all its training data from the system.
                </p>
                <DeleteAvatarButton
                  avatarId={fullAvatarData.id}
                  avatarHandle={avatarHandle}
                />
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-12">
              <SettingsForm avatarHandle={avatarHandle} />
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-12">
            <AnalyticsDisplay avatarHandle={avatarHandle} />
          </div>
        )}
      </div>
    </div>
  );
}