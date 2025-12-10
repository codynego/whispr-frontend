"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
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

          {/* Page Content - This is the KEY FIX */}
          <main className="flex-1 pt-16 lg:pt-0">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}