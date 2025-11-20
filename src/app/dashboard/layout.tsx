// app/dashboard/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { Menu, MessageCircle, X } from "lucide-react";
import Sidebar from "@/components/sidebar"; // We'll update this next if needed
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);           // Desktop: open by default
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);    // Mobile: closed
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen((v) => !v);
    } else {
      setSidebarOpen((v) => !v);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 overflow-hidden">
        {/* Sidebar - Desktop (persistent) + Mobile (overlay) */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50
            w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50
            shadow-2xl transition-all duration-300 ease-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            ${isMobile && mobileMenuOpen ? "translate-x-0" : ""}
            lg:translate-x-0 lg:static lg:z-auto
          `}
        >
          <div className="flex h-full flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <MessageCircle className="w-7 h-7 text-emerald-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">Whisone</span>
                <p className="text-xs text-emerald-600 font-medium">Your AI Second Brain</p>
              </div>
              {isMobile && (
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              )}
            </div>

            {/* Pass open state down to your existing Sidebar component */}
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                isOpen={sidebarOpen}
                isMobile={isMobile}
                mobileOpen={mobileMenuOpen}
                toggleSidebar={toggleSidebar}
                closeMobile={closeMobileMenu}
              />
            </div>

            {/* Optional: User profile footer in sidebar */}
            <div className="p-5 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-sm">JD</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">john@example.com</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay Backdrop */}
        {mobileMenuOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar - Only visible on mobile or when sidebar collapsed on desktop */}
          <header
            className={`
              fixed top-0 left-0 right-0 z-30
              bg-white/80 backdrop-blur-md border-b border-gray-200/50
              flex items-center justify-between px-6 py-4
              transition-all duration-300
              ${!isMobile && sidebarOpen ? "lg:left-64" : "lg:left-0"}
              ${isMobile ? "left-0" : ""}
            `}
          >
            <button
              onClick={toggleSidebar}
              className="p-2.5 rounded-xl hover:bg-gray-100 transition-all hover:scale-105"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:block">
                Your AI Second Brain is live
              </span>
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </header>

          {/* Page Content */}
          <main
            className={`
              flex-1 overflow-y-auto pt-20 lg:pt-0
              transition-all duration-300
              ${!isMobile && sidebarOpen ? "lg:ml-64" : "lg:ml-0"}
            `}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>

        {/* Subtle background decoration (same as landing) */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 -right-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>
      </div>
    </ProtectedRoute>
  );
}