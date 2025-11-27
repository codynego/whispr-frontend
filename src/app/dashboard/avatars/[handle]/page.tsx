"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Brain, Settings, BarChart3, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// --- Import Developed Components ---
import { SourceSelector } from "@/components/avatars/SourceSelector"; 
import { TrainingTriggerButton } from "@/components/avatars/TrainingTriggerButton"; 
import { TrainingStatusMonitor } from "@/components/avatars/TrainingStatusMonitor"; 
import { SettingsForm } from "@/components/avatars/SettingsForm"; 
import { AnalyticsDisplay } from "@/components/avatars/AnalyticsDisplay"; 
import { DeleteAvatarButton } from "@/components/avatars/DeleteAvatarButton"; 
// -----------------------------------

type Tab = 'training' | 'settings' | 'analytics';

interface AvatarDetails {
    id: string;
    name: string;
    handle: string;
    photo_url: string | null;
    last_training_job_id: string | null;
    is_config_saved: boolean; // Flag to track if the current source config is saved
    is_public: boolean;
}

export default function AvatarConfigurationPage({ params }: { params: { handle: string } }) {
    const { accessToken } = useAuth();
    const avatarHandle = params.handle;
    
    // --- State Management ---
    const [avatarDetails, setAvatarDetails] = useState<AvatarDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('training');
    
    // Use a separate state for the current active job (can be updated by the button)
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);

    // --- Data Fetching ---
    const fetchAvatarDetails = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            // Fetch Avatar details by handle (proposed convenience route)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            
            if (!res.ok) throw new Error("Avatar not found or access denied.");
            
            const data = await res.json();
            setAvatarDetails(data);
            setCurrentJobId(data.last_training_job_id); // Initialize job ID from backend data
        } catch (error: any) {
            toast.error(error.message || "Failed to load Avatar details.");
            setAvatarDetails(null);
        } finally {
            setLoading(false);
        }
    }, [accessToken, avatarHandle]);
    
    useEffect(() => {
        fetchAvatarDetails();
    }, [fetchAvatarDetails]);


    // Function to update the saved config flag
    const handleConfigSave = () => {
        if (avatarDetails) {
            setAvatarDetails(prev => prev ? { ...prev, is_config_saved: true } : null);
        }
    };
    
    // Function to refresh details after job completion
    const handleJobComplete = () => {
        setCurrentJobId(null);
        fetchAvatarDetails(); // Re-fetch details to update trained status
    };

    // --- Tab Navigation Component ---
    const TabButton = ({ tab, icon: Icon, label }: { tab: Tab, icon: React.ElementType, label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
            }`}
        >
            <Icon className="w-5 h-5" />
            {label}
        </button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <p className="ml-3 text-lg text-gray-700">Loading Configuration...</p>
            </div>
        );
    }

    if (!avatarDetails) {
        return (
            <div className="max-w-4xl mx-auto py-10 text-center">
                <h2 className="text-2xl text-red-600">Avatar Not Found</h2>
                <p className="text-gray-600">Could not retrieve configuration for @{avatarHandle}.</p>
            </div>
        );
    }

    // --- Render Component ---
    return (
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-6 py-10 space-y-8">
            
            {/* --- Header & Navigation --- */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-5">
                <div className="flex items-center gap-4">
                    {/* Placeholder for Photo/Icon */}
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Brain className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{avatarDetails.name}</h1>
                        <p className={`text-sm font-medium ${avatarDetails.is_public ? 'text-blue-600' : 'text-gray-500'}`}>
                            @{avatarDetails.handle} ({avatarDetails.is_public ? 'Public' : 'Private'})
                        </p>
                    </div>
                </div>

                {/* Tab Buttons */}
                <div className="flex gap-2 mt-4 md:mt-0 bg-gray-50 p-2 rounded-xl">
                    <TabButton tab="training" icon={Brain} label="Training & Sources" />
                    <TabButton tab="settings" icon={Settings} label="Settings" />
                    <TabButton tab="analytics" icon={BarChart3} label="Analytics" />
                </div>
            </div>
            
            <hr className="my-4" />

            {/* --- Content Area --- */}
            <div>
                {activeTab === 'training' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Right Column: Status and Trigger */}
                        <div className="lg:col-span-1 space-y-6">
                            <TrainingStatusMonitor 
                                jobId={currentJobId} 
                                avatarHandle={avatarHandle} 
                                onJobComplete={handleJobComplete} 
                            />
        
                            <TrainingTriggerButton 
                                avatarHandle={avatarHandle} 
                                isConfigSaved={avatarDetails.is_config_saved}
                                onTrainingStart={setCurrentJobId}
                            />
                            
                            <DeleteAvatarButton 
                                avatarId={avatarDetails.id}
                                avatarHandle={avatarHandle}
                            />
                        </div>

                        {/* Left Column: Source Selector */}
                        <div className="lg:col-span-2">
                            <SourceSelector 
                                avatarHandle={avatarHandle} 
                                onSaveSuccess={() => handleConfigSave()} 
                            />
                        </div>
                    </div>
                )}
                
                {activeTab === 'settings' && (
                    <SettingsForm avatarHandle={avatarHandle} />
                )}
                
                {activeTab === 'analytics' && (
                    <AnalyticsDisplay avatarHandle={avatarHandle} />
                )}
            </div>

        </div>
    );
}