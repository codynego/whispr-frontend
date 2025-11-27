"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Users, MessageSquare, Clock, BarChart3, Loader2 } from 'lucide-react';

interface AvatarAnalytics {
    total_conversations: number;
    total_messages: number;
    average_response_time_ms: number; // Placeholder for future data
    unique_visitors: number;
}

interface AnalyticsDisplayProps {
    avatarHandle: string;
}

// Format number utility
const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

export const AnalyticsDisplay = ({ avatarHandle }: AnalyticsDisplayProps) => {
    const { accessToken } = useAuth();
    const [analytics, setAnalytics] = useState<AvatarAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!accessToken || !avatarHandle) return;

        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                // Using the proposed convenience route: GET /api/avatars/<handle>/analytics/
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/analytics/`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                
                if (!res.ok) throw new Error("Failed to load analytics.");

                const data = await res.json();
                // Assuming the response structure matches AvatarAnalytics
                setAnalytics(data); 
            } catch (error) {
                console.error("Error fetching analytics:", error);
                setAnalytics(null);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [accessToken, avatarHandle]);

    const stats = analytics ? [
        { 
            label: "Total Conversations", 
            value: formatNumber(analytics.total_conversations), 
            icon: Users, 
            color: "text-blue-500",
            bg: "bg-blue-50",
        },
        { 
            label: "Total Messages Exchanged", 
            value: formatNumber(analytics.total_messages), 
            icon: MessageSquare, 
            color: "text-purple-500",
            bg: "bg-purple-50",
        },
        { 
            label: "Unique Visitors", 
            value: formatNumber(analytics.unique_visitors), 
            icon: Users, 
            color: "text-teal-500",
            bg: "bg-teal-50",
        },
        { 
            label: "Avg. Response Time", 
            value: `${analytics.average_response_time_ms || 0} ms`, 
            icon: Clock, 
            color: "text-yellow-500",
            bg: "bg-yellow-50",
        },
    ] : [];

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
                Public Performance Analytics
            </h2>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
            ) : analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className={`p-4 rounded-xl ${stat.bg} flex flex-col`}>
                            <div className="flex justify-between items-start">
                                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 p-8 border border-dashed rounded-lg">
                    No analytics data available yet.
                </div>
            )}
        </div>
    );
};