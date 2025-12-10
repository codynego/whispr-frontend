// app/dashboard/layout.tsx (or wherever your layout lives)
"use client";

import { useState, useEffect } from "react";
import { Menu, MessageCircle, X } from "lucide-react";
import Sidebar from "@/components/sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);        // Desktop: expanded/collapsed
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile: overlay open
  const [isMobile, setIsMobile] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);             // New: Chat widget state

  // Detect screen size (lg breakpoint = 1024px)
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Auto-close mobile menu when switching to desktop
      if (!mobile) setMobileMenuOpen(false);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Unified toggle — works for both mobile and desktop
  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen((prev) => !prev);
    } else {
      setSidebarOpen((prev) => !prev);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Dynamic margin for main content (sidebar width)
  const contentMargin = isMobile
    ? ""
    : sidebarOpen
      ? "lg:ml-72"  // Full sidebar (w-72)
      : "lg:ml-20"; // Collapsed sidebar (w-20)

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">

        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          desktopOpen={sidebarOpen}
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
          closeMobile={closeMobileMenu}
        />

        {/* Mobile Overlay */}
        {mobileMenuOpen && isMobile && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col ${contentMargin} transition-all duration-300`}>

          {/* Fixed Top Bar (only visible on mobile) */}
          <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 lg:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              {/* Optional: Add logo or title here */}
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 pt-16 lg:pt-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>

        {/* Chat Widget - Floating Button */}
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-full shadow-2xl hover:bg-emerald-700 transition-all flex items-center gap-3"
          aria-label="Open Chat"
        >
          <MessageCircle className="w-7 h-7" />
        </button>

        {/* Chat Modal/Widget */}
        {chatOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full h-[80vh] relative overflow-hidden">
              {/* Close Button */}
              <button
                onClick={() => setChatOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
              >
                <X className="w-7 h-7" />
              </button>

              {/* Iframe for Chat Page */}
              <iframe
                src="https://whisone/a/whisone"
                className="w-full h-full border-0"
                title="Whisone Chat"
                allow="microphone; camera"
              />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}