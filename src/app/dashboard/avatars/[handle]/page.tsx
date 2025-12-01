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
  settings: { is_public: boolean };
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <span className="ml-4 text-xl">Loading avatar...</span>
      </div>
    );
  }

  if (!fullAvatarData) {
    return (
      <div className="text-center py-32">
        <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-red-600">Avatar Not Found</h2>
        <p className="text-gray-600 mt-2">@{avatarHandle}</p>
      </div>
    );
  }

  const isPublic = fullAvatarData.settings?.is_public ?? false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center shadow-xl">
                <Brain className="w-12 h-12 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900">{fullAvatarData.name}</h1>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xl text-gray-500">@{fullAvatarData.handle}</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2
                    ${isPublic ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}>
                    {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    {isPublic ? "Public" : "Private"}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <nav className="flex gap-2 bg-gray-100 p-2 rounded-2xl shadow-inner">
              {[
                { id: "training", icon: Brain, label: "Training" },
                { id: "settings", icon: Settings, label: "Settings" },
                { id: "analytics", icon: BarChart3, label: "Analytics" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as Tab)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition
                    ${activeTab === id ? "bg-indigo-600 text-white shadow-lg" : "text-gray-600 hover:bg-gray-200"}`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* === TRAINING TAB – 100% WIDTH SOURCE SELECTOR === */}
        {activeTab === "training" && (
          <>
            {/* Full-Width Source Selector */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
              <div className="p-10 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-4">
                  <Brain className="w-10 h-10 text-indigo-600" />
                  Training Data Sources
                </h2>
                <p className="text-lg text-gray-600 mt-3">
                  Choose everything your AI should know and how it should sound.
                </p>
              </div>
              <div className="p-10">
                <SourceSelector
                  avatarHandle={avatarHandle}
                  onSaveSuccess={handleConfigSave}
                />
              </div>
            </div>

            {/* Floating Action Panel – Sticky on Desktop, Bottom on Mobile */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 
                            md:left-auto md:right-8 md:bottom-8 md:translate-x-0 
                            w-full max-w-lg md:max-w-sm">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 space-y-8">
                {/* Training Status */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-5">Training Status</h3>
                  <TrainingStatusMonitor
                    jobId={apiJobId}
                    avatarHandle={avatarHandle}
                    onJobComplete={handleJobComplete}
                    onManualCheck={handleManualCheckSetup}
                  />
                </div>

                <TrainingTriggerButton
                  avatarHandle={avatarHandle}
                  isConfigSaved={isConfigSaved}
                  onTrainingStart={handleTrainingStart}
                />

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <h4 className="font-bold text-red-900">Danger Zone</h4>
                  </div>
                  <DeleteAvatarButton
                    avatarId={fullAvatarData.id}
                    avatarHandle={avatarHandle}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Settings & Analytics Tabs */}
        {activeTab === "settings" && (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-12">
            <SettingsForm avatarHandle={avatarHandle} />
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12">
            <AnalyticsDisplay avatarHandle={avatarHandle} />
          </div>
        )}
      </div>
    </div>
  );
}