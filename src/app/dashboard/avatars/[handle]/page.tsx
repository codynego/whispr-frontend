"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Brain,
  Settings,
  BarChart3,
  Loader2,
  Lock,
  Globe,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

import SourceSelector from "@/components/avatars/SourceSelector";
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
  const router = useRouter();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-5" />
          <p className="text-lg font-medium text-gray-700">Loading avatar...</p>
        </div>
      </div>
    );
  }

  if (!fullAvatarData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-red-600">Avatar Not Found</h2>
          <p className="text-gray-600 mt-2 text-lg">@{avatarHandle}</p>
          <p className="text-sm text-gray-500 mt-3">This avatar may have been deleted or is private.</p>
        </div>
      </div>
    );
  }

  const isPublic = fullAvatarData.settings?.is_public ?? false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {/* Header with Back Button */}
        <header className="mb-10">
          <div className="flex items-center justify-between mb-8">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-md hover:shadow-xl hover:bg-white transition-all duration-300"
            >
              <div className="p-2 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors">
                <ArrowLeft className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="font-semibold text-gray-800">Back</span>
            </button>

            {/* Mobile Title */}
            <h1 className="sm:hidden text-xl font-bold text-gray-900 truncate">
              {fullAvatarData.name}
            </h1>

            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Avatar Hero */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center ring-8 ring-white/50">
                  <Brain className="w-14 h-14 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-green-500 rounded-full border-4 border-white shadow-lg" />
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="hidden sm:block text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                  {fullAvatarData.name}
                </h1>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <span className="text-lg text-gray-500 font-medium">@{fullAvatarData.handle}</span>
                  <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all
                    ${isPublic 
                      ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200" 
                      : "bg-gray-100 text-gray-600 ring-1 ring-gray-300"
                    }`}>
                    {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    {isPublic ? "Public" : "Private"}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Tabs */}
            <nav className="hidden sm:flex gap-2 bg-white/70 backdrop-blur-lg border border-gray-200/80 rounded-2xl p-2 shadow-lg">
              {[
                { id: "training", icon: Brain, label: "Training" },
                { id: "settings", icon: Settings, label: "Settings" },
                { id: "analytics", icon: BarChart3, label: "Analytics" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as Tab)}
                  className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
                    ${activeTab === id
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <div className="pb-24 sm:pb-10">

          {/* TRAINING TAB */}
          {activeTab === "training" && (
            <div className="space-y-8">
              {/* Source Selector */}
              <section className="bg-white rounded-3xl shadow-xl border border-gray-200/70 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/80 rounded-2xl shadow-md">
                      <Brain className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Training Data Sources</h2>
                      <p className="text-gray-600 mt-1">Choose what your AI learns from</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 sm:p-8 bg-white">
                  <SourceSelector
                    avatarHandle={avatarHandle}
                    onSaveSuccess={handleConfigSave}
                  />
                </div>
              </section>

              {/* Status + Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Training Status */}
                <section className="bg-white rounded-3xl shadow-xl border border-gray-200/70 p-7 hover:shadow-2xl transition-all duration-300">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <BarChart3 className="w-7 h-7 text-indigo-600" />
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
                </section>

                {/* Danger Zone */}
                <section className="bg-gradient-to-br from-red-50/80 via-pink-50 to-rose-50 rounded-3xl border-2 border-red-200/70 shadow-xl overflow-hidden">
                  <div className="p-7">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-3 bg-red-100 rounded-2xl">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-red-900">Danger Zone</h3>
                        <p className="text-sm text-red-700 mt-1">This action cannot be undone</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-8 leading-relaxed">
                      Permanently delete this avatar and all associated data — including training history, settings, and analytics.
                    </p>
                    <DeleteAvatarButton
                      avatarId={fullAvatarData.id}
                      avatarHandle={avatarHandle}
                    />
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="max-w-4xl mx-auto">
              <section className="bg-white rounded-3xl shadow-xl border border-gray-200/70 p-8 sm:p-12 hover:shadow-2xl transition-shadow">
                <SettingsForm avatarHandle={avatarHandle} />
              </section>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <section className="bg-white rounded-3xl shadow-xl border border-gray-200/70 p-8 sm:p-12 hover:shadow-2xl transition-shadow">
              <AnalyticsDisplay avatarHandle={avatarHandle} />
            </section>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-50">
          <div className="flex justify-around py-3">
            {[
              { id: "training", icon: Brain, label: "Training" },
              { id: "settings", icon: Settings, label: "Settings" },
              { id: "analytics", icon: BarChart3, label: "Analytics" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as Tab)}
                className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl transition-all duration-200
                  ${activeTab === id 
                    ? "text-indigo-600 bg-indigo-50" 
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}