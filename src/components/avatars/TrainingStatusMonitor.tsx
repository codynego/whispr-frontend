"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, CheckCircle, AlertTriangle, Clock, ListChecks, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';


type JobStatusKey =  'queued' | 'running' | 'completed' | 'error' | 'undefined';

// Define the type for the function that performs the check (which is passed up to the parent)
type ManualCheckFunction = (id: string) => Promise<void>; 

const STATUS_MAP: Record<JobStatusKey, { icon: React.FC<any>, color: string, label: string }> = {
    queued: { icon: Clock, color: 'text-gray-500', label: 'Queued (Awaiting Start)' },
    running: { icon: Loader2, color: 'text-indigo-500 animate-spin', label: 'Processing Data' },
    completed: { icon: CheckCircle, color: 'text-green-600', label: 'Complete! Avatar is Live' },
    error: { icon: AlertTriangle, color: 'text-red-600', label: 'Failed (Check Logs)' },
    undefined: { icon: ListChecks, color: 'text-gray-400', label: 'No Active Job' },
};

interface TrainingStatusMonitorProps {
    jobId: string | null;
    avatarHandle: string;
    onJobComplete: () => void; // Callback to refresh the Avatar status in the parent
    
    // FIX: Prop accepts the ManualCheckFunction type
    onManualCheck: (func: ManualCheckFunction) => void; 
}

export const TrainingStatusMonitor = ({ jobId, avatarHandle, onJobComplete, onManualCheck }: TrainingStatusMonitorProps) => {
    const { accessToken } = useAuth();
    
    // --- State setup ---
    const initialStatus = jobId ? 'pending' : 'undefined';
    const [status, setStatus] = useState<JobStatusKey>(initialStatus as JobStatusKey);
    const [progress, setProgress] = useState(0); // 0 to 100
    const [loading, setLoading] = useState(false); // To show spinner during manual check
    
    // Use a ref to keep track of the current job ID (not strictly necessary here but good for async safety)
    const currentJobIdRef = useRef(jobId);

    // 1. Function to fetch the status (The core logic, now triggered manually)
    const fetchAndSetStatus = useCallback(async (id: string) => {
        if (!accessToken) return;
        setLoading(true);
        
        try {
            // GET /api/avatars/training-jobs/<uuid:id>/status/
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/training-jobs/${id}/status/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!res.ok) throw new Error(`API Error: ${res.status} Failed to fetch job status.`);

            const data = await res.json();
            console.log("Job Status Data:", data);
            
            const newStatus = data.status as JobStatusKey;
            const newProgress = data.progress || 0; 
            
            setProgress(newProgress);
            setStatus(newStatus);
            
            if (newStatus === 'completed' || newStatus === 'error') {
                if (newStatus === 'completed') {
                    toast.success(`Training for @${avatarHandle} complete!`);
                } else {
                    toast.error(`Training failed for @${avatarHandle}.`);
                }
                onJobComplete(); // Notify parent to re-fetch avatar details
            }
        } catch (error) {
            console.error("Manual Check error:", error);
            toast.error("Error checking job status.");
            setStatus('error');
        } finally {
            setLoading(false);
        }
    }, [accessToken, avatarHandle, onJobComplete]);
    

    // 2. Effect to handle initial setup and expose the fetch function
    useEffect(() => {
        // Reset state on jobId change
        if (!jobId) {
            setStatus('undefined');
            setProgress(0);
        } else {
            setStatus('queued'); 
            setProgress(0);
            currentJobIdRef.current = jobId; 
        }
        
        // Expose the fetch function to the parent component
        if (jobId && accessToken) {
            onManualCheck(fetchAndSetStatus);
        }
        
        // Cleanup: Pass a no-op function when component unmounts or dependencies change
        return () => {
             onManualCheck(async () => {}); 
        }
        
    }, [jobId, accessToken, fetchAndSetStatus, onManualCheck]);


    const currentStatus = STATUS_MAP[status];
    const Icon = currentStatus.icon;

    // Determine visibility flags
    const isRunning = status === 'queued' || status === 'running';
    const isFinished = status === 'completed' || status === 'error';
    const showRefreshButton = jobId && !isFinished;
    
    const refreshButtonLabel = loading ? 'Checking...' : 'Check Status Now';

    return (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Training Job Status</h3>
            
            <div className="flex items-center gap-4 py-2">
                <Icon className={`w-6 h-6 ${currentStatus.color}`} />
                <span className={`font-medium ${currentStatus.color}`}>{currentStatus.label}</span>
            </div>

            {/* Progress Bar (Visible only when running) */}
            {isRunning && (
                <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div 
                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {Math.round(progress)}% Complete 
                        {status !== 'queued' && progress < 100 && ' (Vectorizing knowledge...)'}
                        {status === 'queued' && ' (Job queued)'}
                    </p>
                </div>
            )}

            {/* Failure Message */}
            {isFinished && status === 'error' && (
                <p className="text-sm text-red-500 mt-3 p-3 bg-red-50 rounded-lg">
                    The training failed. Check the server logs for detailed error information.
                </p>
            )}
            
            {/* Manual Check Status Button */}
            {showRefreshButton && (
                 <div className="mt-4 pt-3 border-t border-gray-100">
                    <button
                        onClick={() => jobId && fetchAndSetStatus(jobId)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition disabled:opacity-50"
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        {refreshButtonLabel}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                        Click the button to manually check the progress of the job.
                    </p>
                 </div>
            )}

        </div>
    );
};