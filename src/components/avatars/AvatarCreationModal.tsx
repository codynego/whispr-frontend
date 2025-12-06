"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Save, Brain, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";

interface AvatarCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarCreated: () => void;
}

export const AvatarCreationModal = ({ isOpen, onClose, onAvatarCreated }: AvatarCreationModalProps) => {
  const { user, loading: authLoading } = useAuth(); // No accessToken!

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [tone, setTone] = useState("friendly");
  const [personaPrompt, setPersonaPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);

  const TONE_CHOICES = [
    { value: "casual", label: "Casual" },
    { value: "friendly", label: "Friendly (Default)" },
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
    if (newHandle.length < 3 || /[^a-z0-9-]/.test(newHandle)) {
      setHandleAvailable(false);
      return;
    }
    setHandleAvailable(true); // In real app: call API
  };

  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHandle = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setHandle(newHandle);
    setHandleAvailable(null);
    checkHandleAvailability(newHandle);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading || handleAvailable === false) return;

    setLoading(true);
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <p className="text-white">Please log in to create an avatar</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="w-7 h-7 text-emerald-600" />
            Create Your AI Avatar
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body - Form */}
        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-5">
          {/* Avatar Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Avatar Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g., 'John's AI Assistant'"
            />
          </div>

          {/* Handle */}
          <div>
            <label htmlFor="handle" className="block text-sm font-medium text-gray-700 mb-1">
              Unique Handle (`/a/{handle}/`)
            </label>
            <div className="relative">
              <input
                type="text"
                id="handle"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition pr-10"
                value={handle}
                onChange={handleHandleChange}
                required
                disabled={loading}
                placeholder="e.g., john-ai"
              />
              {handleAvailable !== null && handle.length >= 3 && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {handleAvailable ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {handleAvailable === false && handle.length > 0 && (
              <p className="text-xs text-red-600 mt-1">This handle is invalid or already taken.</p>
            )}
          </div>

          {/* Tone */}
          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
              Default Tone/Style
            </label>
            <select
              id="tone"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              disabled={loading}
            >
              {TONE_CHOICES.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
          </div>

          {/* Persona Prompt */}
          <div>
            <label htmlFor="personaPrompt" className="block text-sm font-medium text-gray-700 mb-1">
              Persona Prompt (High-level instruction)
            </label>
            <textarea
              id="personaPrompt"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
              value={personaPrompt}
              onChange={(e) => setPersonaPrompt(e.target.value)}
              placeholder="e.g., 'You are a concise business advisor who prioritizes actionable steps.'"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">This overrides the general Assistant personality.</p>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex justify-end p-6 border-t border-gray-100 gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
            disabled={loading || !handle.trim() || handleAvailable === false || !name.trim()}
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