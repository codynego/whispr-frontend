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
  // Use a single state for desktop/main sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Mobile: overlay menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount + resize
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      // When transitioning from desktop to mobile, automatically close the overlay
      if (mobile) setMobileMenuOpen(false); 
    };
    
    // Initial check
    check(); 
    
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Toggle function handles both mobile (overlay) and desktop (collapse)
  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen((v) => !v);
    } else {
      setSidebarOpen((v) => !v);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Calculate the correct margin for the main content area
  const marginClass = isMobile 
    ? "pt-0" 
    : sidebarOpen 
      ? "lg:ml-72" // Corresponds to w-72
      : "lg:ml-20"; // Corresponds to w-20 (collapsed)

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileMenuOpen} // Only handles mobile overlay
          desktopOpen={sidebarOpen}    // Handles desktop expand/collapse
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
          
          {/* Top bar (Always present on mobile for hamburger, persistent on desktop for spacing) */}
          <header 
            className={`
              fixed top-0 right-0 z-30 bg-white border-b border-gray-200 
              transition-all duration-300 ease-out
              ${marginClass} 
              w-full lg:w-auto
            `}
          >
            {/* Content for the Top Bar - Only the Hamburger on Mobile */}
            <div className="px-4 py-3 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            </div>
            {/* Optional: Add desktop header content here */}
            
          </header>

          {/* Page content */}
          <main
            className={`
              flex-1 overflow-y-auto bg-gray-50 pt-16
              transition-all duration-300
              ${marginClass} 
            `}
          >
            <div className="max-w-7xl mx-auto  sm:px-6 lg:px-3">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}