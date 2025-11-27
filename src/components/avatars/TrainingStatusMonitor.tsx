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

type JobStatus = 'pending' | 'started' | 'processing' | 'success' | 'failure' | undefined;

const STATUS_MAP: Record<Exclude<JobStatus, undefined>, { icon: React.FC<any>, color: string, label: string }> & { undefined: { icon: React.FC<any>, color: string, label: string } } = {
    pending: { icon: Clock, color: 'text-gray-500', label: 'Queued (Waiting for worker)' },
    started: { icon: Loader2, color: 'text-indigo-500 animate-spin', label: 'In Progress' },
    processing: { icon: Loader2, color: 'text-indigo-500 animate-spin', label: 'Processing Data' },
    success: { icon: CheckCircle, color: 'text-green-600', label: 'Complete! Avatar is Live' },
    failure: { icon: AlertTriangle, color: 'text-red-600', label: 'Failed (Check Logs)' },
    undefined: { icon: ListChecks, color: 'text-gray-400', label: 'No active job' },
};

export const TrainingStatusMonitor = ({ jobId, avatarHandle, onJobComplete }: TrainingStatusMonitorProps) => {
    const { accessToken } = useAuth();
    const [status, setStatus] = useState<JobStatus>(undefined);
    const [progress, setProgress] = useState(0); // 0 to 100
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchStatus = useCallback(async (id: string) => {
        if (!accessToken) return;

        try {
            // GET /api/avatars/training-jobs/<uuid:id>/status/
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/training-jobs/${id}/status/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!res.ok) throw new Error("Failed to fetch job status.");

            const data = await res.json();
            const newStatus: JobStatus = data.status.toLowerCase() as JobStatus;
            
            // Assuming the backend returns 'progress' field (e.g., 0-100)
            setProgress(data.progress || (newStatus === 'success' ? 100 : 0));
            setStatus(newStatus);
            
            if (newStatus === 'success' || newStatus === 'failure') {
                if (intervalRef.current) clearInterval(intervalRef.current);
                if (newStatus === 'success') {
                    toast.success(`Training for @${avatarHandle} complete!`);
                    onJobComplete(); 
                } else {
                    toast.error(`Training failed for @${avatarHandle}.`);
                }
            }
        } catch (error) {
            console.error("Polling error:", error);
            if (intervalRef.current) clearInterval(intervalRef.current);
            setStatus('failure');
        }
    }, [accessToken, avatarHandle, onJobComplete]);


    useEffect(() => {
        if (!jobId || !accessToken) {
            setStatus(undefined);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }
        
        // Start polling if a new job ID is present and authenticated
        setStatus('pending');
        
        // Clear previous interval if any
        if (intervalRef.current) clearInterval(intervalRef.current);

        // Start polling every 3 seconds (adjust based on expected Celery speed)
        intervalRef.current = setInterval(() => {
            fetchStatus(jobId);
        }, 3000);

        // Initial fetch immediately
        fetchStatus(jobId);

        // Cleanup function
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [jobId, accessToken, fetchStatus]);


    const currentStatus = STATUS_MAP[status ?? 'undefined'];
    const Icon = currentStatus.icon;

    return (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Training Job Status</h3>
            
            <div className="flex items-center gap-4 py-2">
                <Icon className={`w-6 h-6 ${currentStatus.color}`} />
                <span className={`font-medium ${currentStatus.color}`}>{currentStatus.label}</span>
            </div>

            {status === 'started' || status === 'processing' ? (
                <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div 
                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% Complete (Vectorizing knowledge...)</p>
                </div>
            ) : null}

            {status === 'failure' && (
                <p className="text-sm text-red-500 mt-3 p-3 bg-red-50 rounded-lg">
                    The training failed. Check the server logs for detailed error information.
                </p>
            )}
            
            {status !== 'success' && status !== 'failure' && status !== null && (
                <p className="text-xs text-gray-500 mt-3">
                    Training is running in the background. This page will update automatically.
                </p>
            )}
        </div>
    );
};

// Removed custom useCallback stub; using React's built-in useCallback.
