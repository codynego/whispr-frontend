// app/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingModal from "@/components/onboarding/OnboardingFlow";

const ONBOARDING_KEY = "whisone_onboarding_completed";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const isCompleted = localStorage.getItem(ONBOARDING_KEY) === "true";
    if (isCompleted) {
      router.push("/dashboard/overview");
    }
  }, [router]);

  const handleComplete = () => {
    router.push("/dashboard/overview");
  };

  return (
    <>
      <OnboardingModal onComplete={handleComplete} />
      {/* Fallback content while checking/redirecting */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center">
        <p className="text-2xl text-gray-600">Loading your dashboard...</p>
      </div>
    </>
  );
}