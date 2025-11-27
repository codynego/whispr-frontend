"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // To check if the user is the owner
import { Zap, CornerDownLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface OwnerTakeoverIndicatorProps {
    avatarHandle: string;
    isTakeoverEnabled: boolean;
    conversationId: string; // The ID of the current visitor conversation
    onTakeoverSuccess: () => void; // Callback to switch the chat UI state
}

export const OwnerTakeoverIndicator = ({
    avatarHandle,
    isTakeoverEnabled,
    conversationId,
    onTakeoverSuccess,
}: OwnerTakeoverIndicatorProps) => {
    // NOTE: In a real app, you would need to check if the authenticated user
    // is the owner of this specific avatarHandle. For now, we assume useAuth()
    // provides enough info to infer a logged-in state.
    const { accessToken, user } = useAuth(); 
    
    // Placeholder check: You'd need a more robust check tied to the user ID
    const isOwnerViewing = !!accessToken && !!user; 

    const [loading, setLoading] = useState(false);
    const [isOwnerInControl, setIsOwnerInControl] = useState(false);


    if (!isOwnerViewing || !isTakeoverEnabled) {
        return null;
    }
    
    // --- Takeover API Call ---
    const handleTakeover = async () => {
        setLoading(true);
        try {
            // Placeholder endpoint for starting takeover
            // POST /api/avatars/conversations/<conversationId>/takeover/
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/conversations/${conversationId}/takeover/`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!res.ok) throw new Error("Failed to assume control.");

            toast.success("You are now in control of the conversation.");
            setIsOwnerInControl(true);
            onTakeoverSuccess(); // Notify parent to change message input behavior
            
        } catch (error: any) {
            toast.error(error.message || "Error starting human takeover.");
        } finally {
            setLoading(false);
        }
    };
    

    if (isOwnerInControl) {
        return (
            <div className="bg-red-500 text-white p-3 text-sm flex items-center justify-center gap-3 font-medium">
                <Zap className="w-5 h-5" />
                HUMAN TAKEOVER ACTIVE: Your responses are now live.
            </div>
        );
    }


    return (
        <div className="bg-yellow-100 text-yellow-800 p-3 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
                <CornerDownLeft className="w-4 h-4" />
                <span className="font-medium">Owner Control:</span> You can take over this conversation.
            </div>
            <button
                onClick={handleTakeover}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Zap className="w-4 h-4" />
                )}
                {loading ? "Activating..." : "Take Over"}
            </button>
        </div>
    );
};