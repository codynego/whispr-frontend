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

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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

  // Reset iframe state when opening chat
  const openChat = () => {
    setChatOpen(true);
    setIframeLoaded(false);
    setIframeError(false);
  };

  const closeChat = () => {
    setChatOpen(false);
  };

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

        {/* Chat Modal/Widget */}
        {chatOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full h-[80vh] relative overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-3xl">
                <h2 className="text-lg font-semibold text-gray-800">Chat Support</h2>
                <button
                  onClick={closeChat}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Iframe Container */}
              <div className="flex-1 relative bg-gray-50">
                {/* Loading State */}
                {!iframeLoaded && !iframeError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading chat...</p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {iframeError && (
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Unable to Load Chat
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Please check the chat URL or try again later.
                      </p>
                      <button
                        onClick={() => {
                          setIframeError(false);
                          setIframeLoaded(false);
                        }}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}

                {/* Iframe - REPLACE WITH YOUR ACTUAL URL */}
                <iframe
                  src="https://whisone.app/a/whisone" // ← REPLACE THIS WITH YOUR ACTUAL CHAT URL
                  className={`w-full h-full border-0 ${!iframeLoaded ? 'invisible' : 'visible'}`}
                  title="Whisone Chat"
                  allow="microphone; camera"
                  onLoad={() => setIframeLoaded(true)}
                  onError={() => setIframeError(true)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}