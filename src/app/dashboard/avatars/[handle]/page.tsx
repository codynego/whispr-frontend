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

interface FullAvatarData {
  id: string;
  name: string;
  handle: string;
  photo: string | null;
  last_training_job_id: string | null;
  settings: {
    is_public: boolean;
  };
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
    } catch (error: any) {
      toast.error(error.message || "Failed to load avatar");
      setFullAvatarData(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, avatarHandle]);

  useEffect(() => {
    fetchAvatarDetails();
  }, [fetchAvatarDetails]);

  const handleConfigSave = () => setIsConfigSaved(true);
  const handleJobComplete = () => {
    setApiJobId(null);
    fetchAvatarDetails();
  };
  const handleTrainingStart = (jobId: string) => setApiJobId(jobId);
  const handleManualCheckSetup = useCallback((func: ManualCheckFunction) => {
    setManualCheckFunction(() => func);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <span className="ml-4 text-xl text-gray-700">Loading avatar...</span>
      </div>
    );
  }

  if (!fullAvatarData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-red-600">Avatar Not Found</h2>
        <p className="text-gray-600 mt-2">@{avatarHandle} could not be loaded.</p>
      </div>
    );
  }

  const isPublic = fullAvatarData.settings?.is_public ?? false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center shadow-lg">
                <Brain className="w-10 h-10 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900">{fullAvatarData.name}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-lg text-gray-500">@{fullAvatarData.handle}</span>
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium ${
                    isPublic 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    {isPublic ? "Public" : "Private"}
                  </span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <nav className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl shadow-inner">
              <button
                onClick={() => setActiveTab("training")}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition ${
                  activeTab === "training"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Brain className="w-5 h-5" />
                Training
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition ${
                  activeTab === "settings"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Settings className="w-5 h-5" />
                Settings
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition ${
                  activeTab === "analytics"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Analytics
              </button>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        {activeTab === "training" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* Left: Full Source Selector (Fixed Width, Never Shrinks) */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Brain className="w-8 h-8 text-indigo-600" />
                    Training Data Sources
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Configure what your AI knows and how it speaks.
                  </p>
                </div>
                <div className="p-8">
                  <SourceSelector
                    avatarHandle={avatarHandle}
                    onSaveSuccess={handleConfigSave}
                  />
                </div>
              </div>
            </div>

            {/* Right Sidebar: Actions & Status */}
            <div className="xl:col-span-1 space-y-6">
              {/* Training Status */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Training Status</h3>
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
              <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-7 h-7 text-red-600" />
                  <h3 className="text-xl font-bold text-red-900">Danger Zone</h3>
                </div>
                <p className="text-sm text-red-700 mb-6">
                  Permanently delete this avatar and all its training data.
                </p>
                <DeleteAvatarButton
                  avatarId={fullAvatarData.id}
                  avatarHandle={avatarHandle}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10">
              <SettingsForm avatarHandle={avatarHandle} />
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10">
            <AnalyticsDisplay avatarHandle={avatarHandle} />
          </div>
        )}
      </div>
    </div>
  );
}