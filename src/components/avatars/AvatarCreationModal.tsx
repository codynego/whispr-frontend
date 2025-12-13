"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Save, Brain, Loader2, Check, Sparkles, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface AvatarCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarCreated: () => void;
}

export const AvatarCreationModal = ({ isOpen, onClose, onAvatarCreated }: AvatarCreationModalProps) => {
  const { user, loading: authLoading } = useAuth();

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState("friendly");
  const [personaPrompt, setPersonaPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [checkingHandle, setCheckingHandle] = useState(false);

  const TONE_CHOICES = [
    { value: "casual", label: "Casual", desc: "Relaxed and conversational" },
    { value: "friendly", label: "Friendly", desc: "Warm and approachable (Default)" },
    { value: "professional", label: "Professional", desc: "Polished and business-like" },
    { value: "witty", label: "Witty", desc: "Clever and humorous" },
    { value: "formal", label: "Formal", desc: "Structured and traditional" },
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
    
    setCheckingHandle(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/avatars/check-handle/?handle=${newHandle}`,
        { credentials: "include" }
      );
      const data = await response.json();
      setHandleAvailable(data.available);
    } catch (error) {
      // Fallback to basic validation if API fails
      setHandleAvailable(true);
    } finally {
      setCheckingHandle(false);
    }
  };

  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHandle = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setHandle(newHandle);
    setHandleAvailable(null);
    
    // Debounce the API call
    const timeout = setTimeout(() => {
      checkHandleAvailability(newHandle);
    }, 500);
    
    return () => clearTimeout(timeout);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading || handleAvailable === false) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          handle,
          description,
          tone,
          persona_prompt: personaPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create avatar. Handle may already be taken.");
      }

      toast.success("🎉 Avatar created successfully!");
      onAvatarCreated();
      onClose();
      // Reset form
      setName("");
      setHandle("");
      setDescription("");
      setTone("friendly");
      setPersonaPrompt("");
      setHandleAvailable(null);
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setHandle("");
      setDescription("");
      setTone("friendly");
      setPersonaPrompt("");
      setHandleAvailable(null);
    }
  }, [isOpen]);

  if (!isOpen || authLoading) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please log in to create an avatar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col animate-slideUp">
        {/* Modal Header with Gradient */}
        <div className="relative px-8 py-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-b border-gray-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-200/20 rounded-full blur-3xl -ml-12 -mb-12"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Create Your AI Avatar
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </h2>
                <p className="text-sm text-gray-600 mt-0.5">Build a personalized AI assistant in minutes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/50 transition text-gray-500 hover:text-gray-700 backdrop-blur-sm"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body - Form */}
        <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Your avatar will be able to:</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-800">
                <li>Chat with visitors on a public page</li>
                <li>Learn from training data you provide</li>
                <li>Reflect your unique personality and expertise</li>
              </ul>
            </div>
          </div>

          {/* Avatar Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Avatar Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition bg-white hover:border-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g., John's Business Assistant"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1.5 pl-1">
              This is how your avatar will be displayed to users
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition bg-white hover:border-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., An AI assistant specialized in startup strategy and product development"
              disabled={loading}
              maxLength={300}
            />
            <div className="flex items-center justify-between mt-1.5 px-1">
              <p className="text-xs text-gray-500">
                Brief description shown on the avatar's public page
              </p>
              <p className="text-xs text-gray-400">
                {description.length}/300
              </p>
            </div>
          </div>

          {/* Handle */}
          <div>
            <label htmlFor="handle" className="block text-sm font-semibold text-gray-700 mb-2">
              Unique Handle <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 font-mono text-sm">
                /chat/
              </div>
              <input
                type="text"
                id="handle"
                className="w-full pl-20 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition bg-white hover:border-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed font-mono"
                value={handle}
                onChange={handleHandleChange}
                required
                disabled={loading}
                placeholder="john-business-ai"
                minLength={3}
                maxLength={50}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                {checkingHandle ? (
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                ) : handleAvailable !== null && handle.length >= 3 ? (
                  handleAvailable ? (
                    <Check className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )
                ) : null}
              </div>
            </div>
            <div className="flex items-start justify-between mt-1.5 px-1">
              <p className="text-xs text-gray-500">
                Only lowercase letters, numbers, and hyphens
              </p>
              {handleAvailable === false && handle.length >= 3 && (
                <p className="text-xs text-red-600 font-medium">Handle unavailable</p>
              )}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label htmlFor="tone" className="block text-sm font-semibold text-gray-700 mb-2">
              Communication Tone <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TONE_CHOICES.map((choice) => (
                <label
                  key={choice.value}
                  className={`relative flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    tone === choice.value
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <input
                    type="radio"
                    name="tone"
                    value={choice.value}
                    checked={tone === choice.value}
                    onChange={(e) => setTone(e.target.value)}
                    disabled={loading}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          tone === choice.value
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {tone === choice.value && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="font-semibold text-gray-900">{choice.label}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 ml-6">{choice.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Persona Prompt */}
          <div>
            <label htmlFor="personaPrompt" className="block text-sm font-semibold text-gray-700 mb-2">
              Persona Instructions (Advanced)
            </label>
            <textarea
              id="personaPrompt"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition bg-white hover:border-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed resize-none font-mono text-sm"
              value={personaPrompt}
              onChange={(e) => setPersonaPrompt(e.target.value)}
              placeholder="e.g., You are a concise business advisor who prioritizes actionable steps. Always ask clarifying questions before giving advice. Keep responses under 100 words unless specifically asked for detail."
              disabled={loading}
              maxLength={2000}
            />
            <div className="flex items-start justify-between mt-1.5 px-1">
              <p className="text-xs text-gray-500">
                Custom instructions to shape your avatar's personality and behavior
              </p>
              <p className="text-xs text-gray-400">
                {personaPrompt.length}/2000
              </p>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-600">
            <span className="text-red-500">*</span> Required fields
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
              disabled={
                loading || 
                !handle.trim() || 
                !name.trim() || 
                handleAvailable === false ||
                checkingHandle
              }
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Avatar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};