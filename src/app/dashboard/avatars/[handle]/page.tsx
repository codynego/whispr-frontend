"use client";

import { useState, useEffect, useCallback } from "react";
import { Brain, Settings, BarChart3, Loader2, Lock, Globe, AlertTriangle, Sparkles, Database, Trash2, Play, RefreshCw, CheckCircle2, Clock } from "lucide-react";

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

// Mock Auth Context
const useAuth = () => ({ accessToken: 'mock-token' });

export default function AvatarConfigurationPage({ params }: { params: { handle: string } }) {
  const { accessToken } = useAuth();
  const avatarHandle = params.handle;

  const [fullAvatarData, setFullAvatarData] = useState<FullAvatarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("training");
  const [isConfigSaved, setIsConfigSaved] = useState(true);
  const [apiJobId, setApiJobId] = useState<string | null>(null);

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
      console.error("Failed to load avatar");
    } finally {
      setLoading(false);
    }
  }, [accessToken, avatarHandle]);

  useEffect(() => { fetchAvatarDetails(); }, [fetchAvatarDetails]);

  const handleConfigSave = () => setIsConfigSaved(true);
  const handleJobComplete = () => { setApiJobId(null); fetchAvatarDetails(); };
  const handleTrainingStart = (jobId: string) => setApiJobId(jobId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">Loading avatar...</p>
        </div>
      </div>
    );
  }

  if (!fullAvatarData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Avatar Not Found</h2>
          <p className="text-gray-600">@{avatarHandle}</p>
        </div>
      </div>
    );
  }

  const isPublic = fullAvatarData.settings?.is_public ?? false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">

        {/* Floating Header Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 border-2 border-emerald-100">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar Icon */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <div className={`absolute -bottom-2 -right-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg
                ${isPublic ? "bg-emerald-500 text-white" : "bg-gray-700 text-white"}`}>
                {isPublic ? <Globe className="w-3 h-3 inline mr-1" /> : <Lock className="w-3 h-3 inline mr-1" />}
                {isPublic ? "Public" : "Private"}
              </div>
            </div>

            {/* Avatar Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 truncate">
                {fullAvatarData.name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-lg text-gray-500">@{fullAvatarData.handle}</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                  AI Avatar
                </span>
              </div>
            </div>

            {/* Tab Navigation - Desktop */}
            <div className="hidden md:flex flex-col gap-2">
              {[
                { id: "training", icon: Brain, label: "Training" },
                { id: "settings", icon: Settings, label: "Settings" },
                { id: "analytics", icon: BarChart3, label: "Analytics" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as Tab)}
                  className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold transition-all
                    ${activeTab === id 
                      ? "bg-emerald-500 text-white shadow-lg scale-105" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Navigation - Mobile */}
          <div className="md:hidden mt-6 grid grid-cols-3 gap-2">
            {[
              { id: "training", icon: Brain, label: "Training" },
              { id: "settings", icon: Settings, label: "Settings" },
              { id: "analytics", icon: BarChart3, label: "Analytics" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as Tab)}
                className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl text-xs font-semibold transition-all
                  ${activeTab === id 
                    ? "bg-emerald-500 text-white shadow-md" 
                    : "bg-gray-100 text-gray-600"
                  }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">

          {/* TRAINING TAB */}
          {activeTab === "training" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column - Training Sources */}
              <div className="lg:col-span-2 space-y-6">
                {/* Data Sources Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <Database className="w-7 h-7" />
                      <h2 className="text-2xl font-bold">Training Data</h2>
                    </div>
                    <p className="text-emerald-50">Configure what your AI learns from</p>
                  </div>
                  <div className="p-6">
                    {/* Mock Source Selector */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Database className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Notes</p>
                            <p className="text-xs text-gray-500">Personal knowledge base</p>
                          </div>
                        </div>
                        <input type="checkbox" className="w-5 h-5 text-emerald-500 rounded" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Database className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Documents</p>
                            <p className="text-xs text-gray-500">Uploaded files & PDFs</p>
                          </div>
                        </div>
                        <input type="checkbox" className="w-5 h-5 text-emerald-500 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Database className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Chat History</p>
                            <p className="text-xs text-gray-500">Previous conversations</p>
                          </div>
                        </div>
                        <input type="checkbox" className="w-5 h-5 text-emerald-500 rounded" defaultChecked />
                      </div>
                    </div>
                    <button 
                      onClick={handleConfigSave}
                      className="w-full mt-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition shadow-md"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>

                {/* Training Action Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Play className="w-6 h-6 text-emerald-600" />
                    <h3 className="text-xl font-bold text-gray-900">Start Training</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Train your AI avatar with the selected data sources. This process may take several minutes.
                  </p>
                  <button
                    onClick={() => handleTrainingStart('job-' + Date.now())}
                    disabled={!isConfigSaved}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-5 h-5" />
                    Begin Training
                  </button>
                </div>
              </div>

              {/* Right Column - Status & Danger */}
              <div className="space-y-6">
                {/* Training Status */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <RefreshCw className={`w-6 h-6 ${apiJobId ? 'text-emerald-500 animate-spin' : 'text-gray-400'}`} />
                    <h3 className="text-lg font-bold text-gray-900">Status</h3>
                  </div>
                  
                  {apiJobId ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                        <Clock className="w-5 h-5 text-emerald-600 animate-pulse" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-emerald-900">Training in Progress</p>
                          <p className="text-xs text-emerald-600">Job ID: {apiJobId.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Data collected
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" />
                          Processing...
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          Finalizing
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No active training</p>
                    </div>
                  )}
                </div>

                {/* Danger Zone */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-2 border-red-200 p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
                      <p className="text-xs text-red-600">Irreversible action</p>
                    </div>
                  </div>
                  <p className="text-sm text-red-800 mb-4">
                    Permanently delete this avatar and all associated data. This cannot be undone.
                  </p>
                  <button className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition">
                    <Trash2 className="w-4 h-4" />
                    Delete Avatar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-7 h-7 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">Avatar Settings</h2>
              </div>
              
              <div className="space-y-6">
                {/* Public/Private Toggle */}
                <div className="p-6 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Public Access</h3>
                      <p className="text-sm text-gray-600">Allow others to interact with your avatar</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={isPublic} />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>

                {/* Name Setting */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Avatar Name</label>
                  <input
                    type="text"
                    defaultValue={fullAvatarData.name}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Handle (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Handle</label>
                  <input
                    type="text"
                    value={`@${fullAvatarData.handle}`}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Handle cannot be changed</p>
                </div>

                <button className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition shadow-md">
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-7 h-7 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                  <p className="text-sm text-emerald-700 font-medium mb-1">Total Interactions</p>
                  <p className="text-3xl font-bold text-emerald-900">1,247</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium mb-1">Training Sessions</p>
                  <p className="text-3xl font-bold text-blue-900">12</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <p className="text-sm text-purple-700 font-medium mb-1">Avg Response Time</p>
                  <p className="text-3xl font-bold text-purple-900">2.3s</p>
                </div>
              </div>

              <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                <p className="text-gray-400">Analytics charts would appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}