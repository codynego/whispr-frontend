"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Brain, Globe, Lock, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { SourceSelector } from "@/components/avatars/SourceSelector";
import { TrainingTriggerButton } from "@/components/avatars/TrainingTriggerButton";
import { TrainingStatusMonitor, ManualCheckFunction } from "@/components/avatars/TrainingStatusMonitor";
import { DeleteAvatarButton } from "@/components/avatars/DeleteAvatarButton";

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Loading your avatar...</p>
        </div>
      </div>
    );
  }

  if (!fullAvatarData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Top Header */}
        <header className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center shadow-xl flex-shrink-0">
                <Brain className="w-12 h-12 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 break-words">
                  {fullAvatarData.name}
                </h1>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <span className="text-lg text-gray-600">@{fullAvatarData.handle}</span>
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                    ${isPublic ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"}`}>
                    {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    {isPublic ? "Public" : "Private"}
                  </span>
                </div>
              </div>
            </div>

            {/* Save & Retrain Button - Top Right */}
            <div className="flex justify-center lg:justify-end">
              <TrainingTriggerButton
                avatarHandle={avatarHandle}
                isConfigSaved={isConfigSaved}
                onTrainingStart={handleTrainingStart}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="space-y-10">

          {/* Source Selector */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Brain className="w-8 h-8 text-emerald-600" />
                Training Data Sources
              </h2>
              <p className="text-gray-600 mt-2">Choose what your AI learns from — notes, tasks, files, and more</p>
            </div>
            <div className="p-2">
              <SourceSelector
                avatarHandle={avatarHandle}
                onSaveSuccess={handleConfigSave}
              />
            </div>
          </div>

          {/* Status + Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Training Status */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Brain className="w-7 h-7 text-emerald-600" />
                Training Status
              </h3>
              <TrainingStatusMonitor
                jobId={apiJobId}
                avatarHandle={avatarHandle}
                onJobComplete={handleJobComplete}
                onManualCheck={handleManualCheckSetup}
              />
            </div>

            {/* Danger Zone */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl border-2 border-red-200 p-6 sm:p-8 shadow-xl">
              <div className="flex items-start gap-4 mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-red-900">Danger Zone</h3>
                  <p className="text-sm text-red-700 mt-1">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Deleting this avatar will permanently remove all training data, settings, and conversation history.
              </p>
              <DeleteAvatarButton
                avatarId={fullAvatarData.id}
                avatarHandle={avatarHandle}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}