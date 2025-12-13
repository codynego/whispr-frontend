"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Save, Brain, Loader2, Check, Zap } from "lucide-react"; // Added Zap for flair
import toast from "react-hot-toast";

interface AvatarCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarCreated: () => void;
}

export const AvatarCreationModal = ({
  isOpen,
  onClose,
  onAvatarCreated,
}: AvatarCreationModalProps) => {
  const { user, loading: authLoading } = useAuth(); // No accessToken!

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [tone, setTone] = useState("friendly");
  const [personaPrompt, setPersonaPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);

  const TONE_CHOICES = [
    { value: "casual", label: "Casual" },
    { value: "friendly", label: "Friendly" },
    { value: "professional", label: "Professional" },
    { value: "witty", label: "Witty" },
    { value: "formal", label: "Formal" },
  ];

  // Handle Availability Check
  const checkHandleAvailability = async (newHandle: string) => {
    if (!newHandle.trim()) {
      setHandleAvailable(null);
      return;
    }
    // Basic validation
    if (newHandle.length < 3 || /[^a-z0-9-]/.test(newHandle)) {
      setHandleAvailable(false);
      return;
    }

    // --- Mock API Call ---
    // In a real app, this should debounce and call your API
    setHandleAvailable(null); 
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    // Mock check: Handle 'admin' is taken
    if (newHandle === 'admin' || newHandle === 'test-taken') {
        setHandleAvailable(false);
    } else {
        setHandleAvailable(true);
    }
    // --- End Mock API Call ---
  };

  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow lowercase letters, numbers, and hyphens
    const newHandle = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setHandle(newHandle);
    setHandleAvailable(null); // Reset status immediately

    // Debounce the actual check in a real app, but for this example, we'll keep it simple
    checkHandleAvailability(newHandle); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading || handleAvailable === false) return;

    setLoading(true);
    // Note: The API call remains the same as it handles the logic
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Sends HttpOnly cookies
        body: JSON.stringify({
          name,
          handle,
          tone,
          persona_prompt: personaPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create avatar. Handle may already be taken.");
      }

      toast.success("Avatar created successfully!");
      onAvatarCreated();
      onClose();
      // Reset form
      setName("");
      setHandle("");
      setTone("friendly");
      setPersonaPrompt("");
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || authLoading) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <p className="text-white bg-red-600 p-4 rounded-lg">
            Please log in to create an avatar
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col transform transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
            <Brain className="w-7 h-7 text-emerald-600" />
            New AI Avatar Setup
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Description/Hero */}
        <div className="p-6 bg-white border-b border-gray-100">
            <p className="text-gray-600">
                **Start building your AI assistant!** Define a name, a unique handle, and a core personality prompt.
                You can add detailed training data (documents, FAQs) after creation in the dashboard.
            </p>
        </div>

        {/* Modal Body - Form */}
        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto">
          
          {/* Section 1: Core Identity */}
          <div className="space-y-4 border-b pb-5 border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">1. Identity & Access</h3>
            
            {/* Avatar Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Avatar Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:ring-emerald-500 focus:border-emerald-500 transition placeholder:text-gray-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                placeholder="e.g., 'The Concierge AI'"
              />
            </div>

            {/* Handle */}
            <div>
              <label htmlFor="handle" className="block text-sm font-medium text-gray-700 mb-2">
                Unique Public Handle
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                    /a/
                </div>
                <input
                  type="text"
                  id="handle"
                  // Added pl-12 for the prefix display
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:ring-emerald-500 focus:border-emerald-500 transition placeholder:text-gray-400"
                  value={handle}
                  onChange={handleHandleChange}
                  required
                  disabled={loading}
                  placeholder="my-new-assistant"
                />
                {handle.length > 0 && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {handleAvailable === true ? (
                      <span title="Handle is available">
                        <Check className="w-5 h-5 text-green-500" />
                      </span>
                    ) : handleAvailable === false ? (
                      <span title="Handle is taken or invalid">
                        <X className="w-5 h-5 text-red-500" />
                      </span>
                    ) : (
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    )}
                  </div>
                )}
              </div>
              {handleAvailable === false && handle.length > 0 && (
                <p className="text-xs text-red-600 mt-1">
                    This handle is invalid (must be 3+ chars, lowercase, numbers, hyphens only) or is already taken.
                </p>
              )}
              {handleAvailable === true && (
                <p className="text-xs text-green-600 mt-1">
                    Public URL: `/a/{handle}/`
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Personality */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">2. Personality & Style</h3>
            
            {/* Tone Selector */}
            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
                Default Tone/Style
              </label>
              <div className="flex flex-wrap gap-3">
                {TONE_CHOICES.map((choice) => (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => setTone(choice.value)}
                    className={`
                      px-4 py-2 text-sm font-medium rounded-full transition-all
                      ${
                        tone === choice.value
                          ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }
                    `}
                    disabled={loading}
                  >
                    {choice.label}
                    {choice.value === "friendly" && " (Default)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Persona Prompt */}
            <div>
              <label htmlFor="personaPrompt" className="block text-sm font-medium text-gray-700 mb-2">
                Persona Prompt (Core Instructions)
              </label>
              <textarea
                id="personaPrompt"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-emerald-500 focus:border-emerald-500 transition placeholder:text-gray-400"
                value={personaPrompt}
                onChange={(e) => setPersonaPrompt(e.target.value)}
                placeholder="e.g., 'You are a concise business advisor who prioritizes actionable steps. Do not use emojis unless specifically requested.'"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-500" />
                This is the foundation. It provides the **system instruction** for your AI.
              </p>
            </div>
          </div>
        </form>

        {/* Modal Footer - Actions */}
        <div className="flex justify-between p-6 border-t border-gray-100 bg-gray-50">
            <button
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-white transition font-medium"
                disabled={loading}
            >
                Cancel
            </button>
            <button
                type="submit"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-md hover:from-emerald-700 hover:to-teal-700 transition flex items-center gap-2 font-semibold disabled:opacity-50 disabled:shadow-none"
                disabled={loading || !handle.trim() || handleAvailable !== true || !name.trim()}
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Save className="w-5 h-5" />
                )}
                {loading ? "Creating..." : "Create Avatar"}
            </button>
        </div>
      </div>
    </div>
  );
};