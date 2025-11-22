// app/dashboard/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { Menu, Brain } from "lucide-react";
import Sidebar from "@/components/sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
        {/* Sidebar — Always visible on desktop, fixed */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          isMobile={isMobile}
          toggleSidebar={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* Mobile backdrop */}
        {isMobile && mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          {isMobile && (
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
              <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">Whisone</h1>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2.5 rounded-xl hover:bg-gray-100 transition"
                >
                  <Menu className="w-6 h-6 text-gray-700" />
                </button>
              </div>
            </header>
          )}

          {/* Page Content */}
          <main
            className={`
              flex-1 overflow-y-auto
              ${isMobile ? "pt-20" : "pt-0"}  // Space for mobile header
            `}
          >
            <div className="max-w-7xl mx-auto px-6 py-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}