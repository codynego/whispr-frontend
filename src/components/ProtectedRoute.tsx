"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth(); // get loading from context if possible
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login"); // redirect if not logged in
    }
  }, [user, authLoading, router]);

  // Show loading screen until auth is resolved
  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Checking access...
      </div>
    );
  }

  // Render children only if user is logged in
  return <>{children}</>;
}
