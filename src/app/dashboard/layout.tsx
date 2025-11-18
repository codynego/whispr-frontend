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
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false); // Collapsed by default on mobile
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const closeMobileSidebar = () => setMobileOpen(false);

  const mainMargin = isMobile ? "ml-0" : isOpen ? "ml-64" : "ml-20";
  const mainPadding = isMobile ? "pt-16" : "pt-4";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 overflow-x-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={isOpen}
          mobileOpen={mobileOpen}
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
        />

        {/* Mobile Overlay */}
        {mobileOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={closeMobileSidebar}
            aria-hidden="true"
          />
        )}

        {/* Main Content */}
        <main
          className={`
            transition-all duration-300 ease-in-out
            ${mainMargin} ${mainPadding}
            px-4 sm:px-6 lg:px-8 pb-8
            min-h-screen
          `}
        >
          {/* Mobile Hamburger (only when sidebar is closed) */}
          {isMobile && !mobileOpen && (
            <button
              onClick={() => setMobileOpen(true)}
              className="fixed top-4 left-4 z-30 p-3 bg-white rounded-xl shadow-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all hover:shadow-xl active:scale-95"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Page Content */}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}