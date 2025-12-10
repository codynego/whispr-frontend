// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingModal from "@/components/onboarding/OnboardingFlow";

export default function DashboardPage() {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(true); // Managed inside OnboardingModal, but here for control if needed

  useEffect(() => {
    // After onboarding, redirect to overview
    if (!showOnboarding) {
      router.push("/dashboard/overview");
    }
  }, [showOnboarding, router]);

  return (
    <>
      <OnboardingModal />
      {/* Optional loading state while redirecting */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center">
        <p className="text-2xl text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </>
  );
}