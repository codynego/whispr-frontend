"use client";

import { useState, useEffect } from "react";
import { Menu, MessageCircle, X } from "lucide-react";

// Mock components - replace with your actual imports
const Sidebar = ({ mobileOpen, desktopOpen, isMobile, toggleSidebar, closeMobile }: any) => (
  <div className={`fixed top-0 left-0 h-full bg-gray-900 text-white transition-all duration-300 z-50 ${
    isMobile 
      ? (mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72')
      : (desktopOpen ? 'w-72' : 'w-20')
  }`}>
    <div className="p-4">Sidebar Content</div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [mounted]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen((prev) => !prev);
    } else {
      setSidebarOpen((prev) => !prev);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const contentMargin = isMobile
    ? ""
    : sidebarOpen
      ? "lg:ml-72"
      : "lg:ml-20";

  const openChat = () => {
    // Open chat in a centered popup window
    const width = 800;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      'https://whisone.app/a/whisone',
      'whisone-chat',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  const closeChat = () => {
    setChatOpen(false);
  };

  // Prevent hydration mismatch - don't render until mounted
  if (!mounted) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-gray-50">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          desktopOpen={sidebarOpen}
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
          closeMobile={closeMobileMenu}
        />

        {mobileMenuOpen && isMobile && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}

        <div className={`flex-1 flex flex-col ${contentMargin} transition-all duration-300`}>
          <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 lg:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </header>

          <main className="flex-1 pt-16 lg:pt-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>

        {/* Chat Widget - Floating Button */}
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-full shadow-2xl hover:bg-emerald-700 hover:scale-110 transition-all flex items-center gap-3"
          aria-label="Open Chat"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      </div>
    </ProtectedRoute>
  );
}