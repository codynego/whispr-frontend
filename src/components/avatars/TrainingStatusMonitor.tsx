"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, CheckCircle, AlertTriangle, Clock, ListChecks } from 'lucide-react';
import toast from 'react-hot-toast';

interface TrainingStatusMonitorProps {
    jobId: string | null;
    avatarHandle: string;
    onJobComplete: () => void; // Callback to refresh the Avatar status in the parent
}

// Define the exact lowercase status strings expected from the backend/view
type JobStatusKey = 'pending' | 'started' | 'processing' | 'success' | 'failure' | 'undefined';

// Use the JobStatusKey for the map
const STATUS_MAP: Record<JobStatusKey, { icon: React.FC<any>, color: string, label: string }> = {
    pending: { icon: Clock, color: 'text-gray-500', label: 'Queued (Waiting for worker)' },
    started: { icon: Loader2, color: 'text-indigo-500 animate-spin', label: 'In Progress' },
    processing: { icon: Loader2, color: 'text-indigo-500 animate-spin', label: 'Processing Data' },
    success: { icon: CheckCircle, color: 'text-green-600', label: 'Complete! Avatar is Live' },
    failure: { icon: AlertTriangle, color: 'text-red-600', label: 'Failed (Check Logs)' },
    undefined: { icon: ListChecks, color: 'text-gray-400', label: 'No active job' },
};

export const TrainingStatusMonitor = ({ jobId, avatarHandle, onJobComplete }: TrainingStatusMonitorProps) => {
    const { accessToken } = useAuth();
    // Initialize status based on whether a jobId is present
    const initialStatus = jobId ? 'pending' : 'undefined';
    const [status, setStatus] = useState<JobStatusKey>(initialStatus as JobStatusKey);
    const [progress, setProgress] = useState(0); // 0 to 100
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchStatus = useCallback(async (id: string) => {
        if (!accessToken) return;

        try {
            // GET /api/avatars/training-jobs/<uuid:id>/status/
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/training-jobs/${id}/status/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!res.ok) throw new Error(`API Error: ${res.status} Failed to fetch job status.`);

            const data = await res.json();
            
            // 💡 Guaranteed to be a lowercase, valid key from the revised backend view
            const newStatus = data.status as JobStatusKey;
            
            // 💡 Guaranteed to be an integer (0-100) from the revised backend view
            const newProgress = data.progress || 0; 
            
            setProgress(newProgress);
            setStatus(newStatus);
            
            if (newStatus === 'success' || newStatus === 'failure') {
                if (intervalRef.current) clearInterval(intervalRef.current);
                
                if (newStatus === 'success') {
                    toast.success(`Training for @${avatarHandle} complete!`);
                } else {
                    // Optional: You could show a link to logs here if data.logs is returned
                    toast.error(`Training failed for @${avatarHandle}.`);
                }
                onJobComplete(); // Notify parent to re-fetch avatar details
            }
        } catch (error) {
            console.error("Polling error:", error);
            if (intervalRef.current) clearInterval(intervalRef.current);
            setStatus('failure');
        }
    }, [accessToken, avatarHandle, onJobComplete]);


    useEffect(() => {
        // --- Cleanup Previous Job/Interval ---
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (!jobId || !accessToken) {
            setStatus('undefined');
            setProgress(0);
            return;
        }
        
        // --- Start Polling for New Job ---
        
        // Set initial status to 'pending' if a jobId is provided
        setStatus('pending'); 
        
        // Start polling every 3 seconds
        intervalRef.current = setInterval(() => {
            fetchStatus(jobId);
        }, 3000);

        // Initial fetch immediately to get the current status right away
        fetchStatus(jobId);

        // Cleanup function runs when component unmounts or dependencies change
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
        
    // fetchStatus is correctly included as a dependency
    }, [jobId, accessToken, fetchStatus]);


    // 💡 SAFE LOOKUP: We now rely on the 'status' state being one of the keys in the map.
    const currentStatus = STATUS_MAP[status];
    const Icon = currentStatus.icon;

    return (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Training Job Status</h3>
            
            <div className="flex items-center gap-4 py-2">
                <Icon className={`w-6 h-6 ${currentStatus.color}`} />
                <span className={`font-medium ${currentStatus.color}`}>{currentStatus.label}</span>
            </div>

            {(status === 'started' || status === 'processing' || status === 'pending') && (
                <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div 
                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {Math.round(progress)}% Complete 
                        {status !== 'pending' && progress < 100 && ' (Vectorizing knowledge...)'}
                        {status === 'pending' && ' (Job queued)'}
                    </p>
                </div>
            )}

            {status === 'failure' && (
                <p className="text-sm text-red-500 mt-3 p-3 bg-red-50 rounded-lg">
                    The training failed. Check the server logs for detailed error information.
                </p>
            )}
            
            {status !== 'success' && status !== 'failure' && status !== 'undefined' && (
                <p className="text-xs text-gray-500 mt-3">
                    Training is running in the background. This page will update automatically.
                </p>
            )}
        </div>
    );
};