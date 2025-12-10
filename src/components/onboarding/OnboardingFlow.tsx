// components/OnboardingModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, Sparkles, FileText, Users, MessageSquare, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const ONBOARDING_KEY = "whisone_onboarding_completed";

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const hasCompleted = localStorage.getItem(ONBOARDING_KEY) === "true";
    if (!hasCompleted && user) { // Only show if user is logged in and not completed
      setIsOpen(true);
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) setStep(1);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(ONBOARDING_KEY, "true");
  };

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else handleClose();
  };

  const handleAction = (path: string) => {
    handleClose();
    router.push(path);
  };

  const steps = [
    // Step 1: Welcome
    <div key="step1" className="text-center space-y-6">
      <Sparkles className="w-16 h-16 text-emerald-600 mx-auto" />
      <h2 className="text-3xl font-bold text-gray-900">Welcome to Whisone 👋</h2>
      <p className="text-xl text-gray-600">
        I’ll help you remember and organize everything. Tap Next to get started.
      </p>
      <button
        onClick={handleNext}
        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
      >
        Next <ArrowRight className="w-6 h-6" />
      </button>
    </div>,

    // Step 2: Create Your First Memory
    <div key="step2" className="text-center space-y-6">
      <FileText className="w-16 h-16 text-emerald-600 mx-auto" />
      <h2 className="text-3xl font-bold text-gray-900">Create Your First Memory</h2>
      <p className="text-xl text-gray-600">
        Here you save anything you don’t want to forget — tasks, notes, ideas, dates.
      </p>
      <button
        onClick={() => handleAction("/dashboard/notes")} // Assuming path to create memory
        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
      >
        Create a Memory <ArrowRight className="w-6 h-6" />
      </button>
      <button onClick={handleNext} className="text-emerald-600 font-medium">Skip to Next</button>
    </div>,

    // Step 3: Meet Avatars
    <div key="step3" className="text-center space-y-6">
      <Users className="w-16 h-16 text-emerald-600 mx-auto" />
      <h2 className="text-3xl font-bold text-gray-900">Meet Avatars</h2>
      <p className="text-xl text-gray-600">
        Avatars act like personal assistants. You can create one for studying, support, business, Bible study, interviews, etc.
      </p>
      <button
        onClick={() => handleAction("/dashboard/avatars")} // Assuming path to create avatar
        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
      >
        Create Your First Avatar <ArrowRight className="w-6 h-6" />
      </button>
      <button onClick={handleNext} className="text-emerald-600 font-medium">Skip to Next</button>
    </div>,

    // Step 4: Try Talking to Whisone
    <div key="step4" className="text-center space-y-6">
      <MessageSquare className="w-16 h-16 text-emerald-600 mx-auto" />
      <h2 className="text-3xl font-bold text-gray-900">Try Talking to Whisone</h2>
      <p className="text-xl text-gray-600">
        Chat with your avatar or save a memory using plain language.
      </p>
      <div className="space-y-3 text-left text-gray-700 bg-gray-50 p-6 rounded-2xl">
        <p className="italic">“Remind me to pay my light bill on the 15th.”</p>
        <p className="italic">“Save this number: 08123456789.”</p>
      </div>
      <button
        onClick={() => handleAction("/dashboard/assistant")} // Assuming demo chat path
        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
      >
        Try a Demo Chat <ArrowRight className="w-6 h-6" />
      </button>
      <button onClick={handleNext} className="text-emerald-600 font-medium">Skip to Next</button>
    </div>,

    // Step 5: You’re Ready
    <div key="step5" className="text-center space-y-6">
      <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto" />
      <h2 className="text-3xl font-bold text-gray-900">You’re Ready!</h2>
      <p className="text-xl text-gray-600">
        You’re all set! Whisone will now help you remember everything important.
      </p>
      <button
        onClick={() => {
          handleClose();
          router.push("/dashboard");
        }}
        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
      >
        Start Using Whisone <ArrowRight className="w-6 h-6" />
      </button>
    </div>,
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
        {steps[step - 1]}
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${i + 1 === step ? "bg-emerald-600" : "bg-gray-200"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

