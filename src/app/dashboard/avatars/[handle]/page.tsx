"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Brain, Settings, BarChart3, Loader2, Lock, Globe, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

import { SourceSelector } from "@/components/avatars/SourceSelector";
import { TrainingTriggerButton } from "@/components/avatars/TrainingTriggerButton";
import { TrainingStatusMonitor, ManualCheckFunction } from "@/components/avatars/TrainingStatusMonitor";
import { SettingsForm } from "@/components/avatars/SettingsForm";
import { AnalyticsDisplay } from "@/components/avatars/AnalyticsDisplay";
import { DeleteAvatarButton } from "@/components/avatars/DeleteAvatarButton";

type Tab = "training" | "settings" | "analytics";

interface AvatarSettings {
  is_public: boolean;
}

interface FullAvatarData {
  id: string;
  name: string;
  handle: string;
  photo: string | null;
  last_training_job_id: string | null;
  settings: AvatarSettings;
}

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
      if (!res.ok) throw new Error();
      const data: FullAvatarData = await res.json();
      setFullAvatarData(data);
      setApiJobId(data.last_training_job_id);
      setIsConfigSaved(true);
    } catch {
      toast.error("Failed to load avatar");
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
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-base text-gray-600">Loading avatar...</p>
        </div>
      </div>
    );
  }

  if (!fullAvatarData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-600">Avatar Not Found</h2>
          <p className="text-gray-600 mt-1">@{avatarHandle}</p>
        </div>
      </div>
    );
  }

  const isPublic = fullAvatarData.settings?.is_public ?? false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Brain className="w-9 h-9 sm:w-11 sm:h-11 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                  {fullAvatarData.name}
                </h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-sm sm:text-base text-gray-500">@{fullAvatarData.handle}</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                    ${isPublic ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"}`}>
                    {isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    {isPublic ? "Public" : "Private"}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Sticky Tabs */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-10">
              <div className="flex">
                {[
                  { id: "training", icon: Brain, label: "Training" },
                  { id: "settings", icon: Settings, label: "Settings" },
                  { id: "analytics", icon: BarChart3, label: "Analytics" },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as Tab)}
                    className={`flex-1 py-4 flex flex-col items-center gap-1 transition
                      ${activeTab === id ? "text-indigo-600" : "text-gray-500"}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Tabs */}
            <nav className="hidden sm:flex gap-1 bg-white/80 backdrop-blur p-1 rounded-2xl shadow-md border border-gray-100">
              {[
                { id: "training", icon: Brain, label: "Training" },
                { id: "settings", icon: Settings, label: "Settings" },
                { id: "analytics", icon: BarChart3, label: "Analytics" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as Tab)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition
                    ${activeTab === id 
                      ? "bg-indigo-600 text-white shadow-sm" 
                      : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <div className="pb-20 sm:pb-8"> {/* Extra bottom padding for mobile sticky tabs */}

          {/* TRAINING TAB */}
          {activeTab === "training" && (
            <div className="space-y-6">

              {/* Source Selector */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-5 sm:p-7 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Brain className="w-7 h-7 text-indigo-600" />
                    Training Data Sources
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Select what your AI learns from</p>
                </div>
                <div className="p-5 sm:p-7">
                  <SourceSelector
                    avatarHandle={avatarHandle}
                    onSaveSuccess={handleConfigSave}
                  />
                </div>
              </div>

              {/* Status + Actions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Training Status */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-indigo-600" />
                    Training Status
                  </h3>
                  <TrainingStatusMonitor
                    jobId={apiJobId}
                    avatarHandle={avatarHandle}
                    onJobComplete={handleJobComplete}
                    onManualCheck={handleManualCheckSetup}
                  />
                  <div className="mt-6 pt-5 border-t border-gray-200">
                    <TrainingTriggerButton
                      avatarHandle={avatarHandle}
                      isConfigSaved={isConfigSaved}
                      onTrainingStart={handleTrainingStart}
                    />
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl border-2 border-red-200 p-6 shadow-xl">
                  <div className="flex items-start gap-3 mb-5">
                    <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
                      <p className="text-xs text-red-700">Irreversible action</p>
                    </div>
                  </div>
                  <p className="text-sm text-red-800 mb-6">
                    Delete this avatar and all its data permanently.
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
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10">
                <SettingsForm avatarHandle={avatarHandle} />
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10">
              <AnalyticsDisplay avatarHandle={avatarHandle} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}