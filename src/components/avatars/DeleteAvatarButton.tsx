"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation'; // Assuming Next.js router for redirection

interface DeleteAvatarButtonProps {
    avatarId: string;
    avatarHandle: string;
}

export const DeleteAvatarButton = ({ avatarId, avatarHandle }: DeleteAvatarButtonProps) => {
    const { accessToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!accessToken) {
            toast.error("Authentication required.");
            return;
        }

        if (!confirm(`Are you sure you want to permanently delete the Avatar "@${avatarHandle}"? This cannot be undone.`)) {
            return;
        }

        setLoading(true);
        try {
            // DELETE /api/avatars/<uuid:pk>/
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarId}/`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || "Failed to delete avatar.");
            }

            toast.success(`Avatar @${avatarHandle} deleted successfully.`);
            // Redirect user back to the main dashboard list
            router.push('/avatars/dashboard'); 
        } catch (error: any) {
            toast.error(error.message || "An unexpected error occurred during deletion.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl mt-6 space-y-3">
            <h3 className="text-lg font-semibold text-red-800 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Danger Zone
            </h3>
            <p className="text-sm text-red-700">
                Permanently delete this Avatar and all associated data, conversations, and training jobs.
            </p>
            <button
                onClick={handleDelete}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Trash2 className="w-4 h-4" />
                )}
                {loading ? "Deleting..." : "Delete Avatar"}
            </button>
        </div>
    );
};