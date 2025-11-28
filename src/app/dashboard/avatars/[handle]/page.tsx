"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Brain, Settings, BarChart3, Loader2, User, Lock, Globe } from "lucide-react";
import toast from "react-hot-toast";

// --- Import Developed Components (Assumed) ---
import { SourceSelector } from "@/components/avatars/SourceSelector"; 
import { TrainingTriggerButton } from "@/components/avatars/TrainingTriggerButton"; 
import { TrainingStatusMonitor } from "@/components/avatars/TrainingStatusMonitor"; 
import { SettingsForm } from "@/components/avatars/SettingsForm"; 
import { AnalyticsDisplay } from "@/components/avatars/AnalyticsDisplay"; 
import { DeleteAvatarButton } from "@/components/avatars/DeleteAvatarButton"; 
// -----------------------------------

type Tab = 'training' | 'settings' | 'analytics';

// Interface matching the expected API response fields (including nested settings)
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


export default function AvatarConfigurationPage({ params }: { params: { handle: string } }) {
    const { accessToken } = useAuth();
    const avatarHandle = params.handle;
    
    // --- State Management ---
    const [fullAvatarData, setFullAvatarData] = useState<FullAvatarData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('training');
    const [isConfigSaved, setIsConfigSaved] = useState(true); 
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);

    // --- Data Fetching ---
    const fetchAvatarDetails = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ detail: "Non-JSON response received." }));
                console.error("Avatar Details Fetch Failed:", res.status, errorData); 
                throw new Error(errorData.detail || `Server Error (${res.status})`);
            }
            
            const data: FullAvatarData = await res.json();
            setFullAvatarData(data);
            setCurrentJobId(data.last_training_job_id);
            setIsConfigSaved(true); // Assume saved on initial load

        } catch (error: any) {
            toast.error(error.message || "Failed to load Avatar details.");
            setFullAvatarData(null);
        } finally {
            setLoading(false);
        }
    }, [accessToken, avatarHandle]);
    
    useEffect(() => {
        fetchAvatarDetails();
    }, [fetchAvatarDetails]);


    const handleConfigSave = () => {
        setIsConfigSaved(true);
    };
    
    const handleJobComplete = () => {
        setCurrentJobId(null);
        fetchAvatarDetails();
    };

    // --- Tab Navigation Component ---
    const TabButton = ({ tab, icon: Icon, label }: { tab: Tab, icon: React.ElementType, label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap
                ${
                    activeTab === tab
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                }`}
        >
            <Icon className="w-5 h-5" />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="ml-3 text-lg text-gray-700">Loading Configuration...</p>
            </div>
        );
    }

    if (!fullAvatarData) {
        return (
            <div className="max-w-4xl mx-auto py-10 text-center">
                <h2 className="text-2xl text-red-600">Avatar Not Found</h2>
                <p className="text-gray-600">Could not retrieve configuration for @{avatarHandle}.</p>
            </div>
        );
    }

    const isPublic = fullAvatarData.settings?.is_public ?? false;

    // --- Render Component ---
    return (
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8">
            
            <div className="space-y-6">
                
                {/* --- Header & Avatar Info --- */}
                <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-5 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        {/* Avatar Photo/Icon */}
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center shadow-md">
                            <Brain className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900">{fullAvatarData.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm font-medium text-gray-500">
                                    @{fullAvatarData.handle}
                                </p>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium 
                                    ${isPublic ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                    {isPublic ? 'Public' : 'Private'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tab Buttons (Responsive) */}
                    <nav className="mt-6 md:mt-0 w-full md:w-auto">
                        <div className="flex gap-1 bg-gray-50 p-1.5 rounded-xl border border-gray-200 shadow-inner">
                            <TabButton tab="training" icon={Brain} label="Training & Sources" />
                            <TabButton tab="settings" icon={Settings} label="Settings" />
                            <TabButton tab="analytics" icon={BarChart3} label="Analytics" />
                        </div>
                    </nav>
                </header>
                
                <hr className="my-4 hidden" /> {/* Hidden on mobile, unnecessary separator */}

                {/* --- Content Area --- */}
                <main>
                    {activeTab === 'training' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Left Column: Source Selector (Takes 2/3 width on desktop, full width on mobile) */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
                                    <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-indigo-500" />
                                        Knowledge & Tone Sources
                                    </h2>
                                    <SourceSelector 
                                        avatarHandle={avatarHandle} 
                                        onSaveSuccess={() => handleConfigSave()} 
                                    />
                                </div>
                            </div>

                            {/* Right Column: Status and Actions (Takes 1/3 width on desktop, full width on mobile) */}
                            <div className="lg:col-span-1 space-y-6">
                                
                                {/* Training Status Card */}
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-4">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                                        Job Status
                                    </h2>
                                    <TrainingStatusMonitor 
                                        jobId={currentJobId} 
                                        avatarHandle={avatarHandle} 
                                        onJobComplete={handleJobComplete} 
                                    />
                                    
                                    <hr className="my-4" />

                                    <TrainingTriggerButton 
                                        avatarHandle={avatarHandle} 
                                        isConfigSaved={isConfigSaved} 
                                        onTrainingStart={setCurrentJobId}
                                    />
                                </div>
                                
                                {/* Danger Zone / Delete Card */}
                                <div className="bg-red-50 border border-red-200 rounded-2xl shadow-lg p-6">
                                    <h3 className="text-lg font-bold text-red-800 mb-3">Danger Zone</h3>
                                    <DeleteAvatarButton 
                                        avatarId={fullAvatarData.id}
                                        avatarHandle={avatarHandle}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'settings' && (
                        <div className="max-w-3xl mx-auto">
                            <SettingsForm avatarHandle={avatarHandle} />
                        </div>
                    )}
                    
                    {activeTab === 'analytics' && (
                        <div className="max-w-7xl mx-auto">
                            <AnalyticsDisplay avatarHandle={avatarHandle} />
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
}