// app/dashboard/layout.tsx   (or components/layouts/DashboardLayout.tsx)
"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/sidebar"; // keep your existing Sidebar component
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);       // Desktop: expanded by default
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile: overlay menu
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount + resize
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false); // collapsed on mobile by default
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
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
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar
          isOpen={!isMobile && sidebarOpen}           // desktop: controlled by sidebarOpen
          mobileOpen={isMobile && mobileMenuOpen}     // mobile: overlay when mobileMenuOpen
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
          closeMobile={closeMobileMenu}
        />

        {/* Mobile backdrop */}
        {mobileMenuOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar (mobile hamburger only) */}
          {isMobile && (
            <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            </header>
          )}

          {/* Page content */}
          <main
            className={`
              flex-1 overflow-y-auto bg-gray-50
              transition-all duration-300
              ${isMobile ? "pt-16" : sidebarOpen ? "lg:ml-64" : "lg:ml-20"}
            `}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}