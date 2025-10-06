"use client";

import { useState, useEffect } from "react";
import { Menu, Mic, MicOff } from "lucide-react";
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
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

    recognitionInstance.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript;
      console.log('Voice command:', transcript);
      handleVoiceCommand(transcript);
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

interface VoiceCommandHandler {
    (command: string): void;
}

const handleVoiceCommand: VoiceCommandHandler = (command: string) => {
    const lowerCommand: string = command.toLowerCase();
    
    // Example voice commands
    if (lowerCommand.includes('open menu') || lowerCommand.includes('show menu')) {
        setMobileOpen(true);
    } else if (lowerCommand.includes('close menu') || lowerCommand.includes('hide menu')) {
        setMobileOpen(false);
    } else if (lowerCommand.includes('toggle sidebar')) {
        toggleSidebar();
    }
    
    // You can add more custom voice commands here
    console.log('Processing voice command:', command);
};

  const toggleVoiceListening = () => {
    if (!recognition) {
      alert('Voice recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

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
        <Sidebar 
          isOpen={isOpen}
          mobileOpen={mobileOpen}
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
        />
        
        {/* Mobile Backdrop */}
        {mobileOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
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
          {/* Mobile Hamburger Button */}
          {isMobile && !mobileOpen && (
            <button 
              className="fixed top-4 left-4 z-30 p-3 bg-white rounded-xl shadow-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all hover:shadow-xl active:scale-95"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          
          {/* Floating Voice Command Button */}
          <button
            onClick={toggleVoiceListening}
            className={`
              fixed bottom-6 right-6 z-[2000] p-4 rounded-full shadow-2xl
              transition-all duration-300 hover:scale-110 active:scale-95
              ${isListening 
                ? 'bg-gradient-to-r from-red-500 to-pink-600 animate-pulse' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              }
            `}
            aria-label={isListening ? "Stop listening" : "Start voice command"}
          >
            {isListening ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
            
            {/* Listening indicator rings */}
            {isListening && (
              <>
                <span className="absolute inset-0 rounded-full bg-red-400 opacity-75 animate-ping" />
                <span className="absolute inset-0 rounded-full bg-red-400 opacity-50 animate-pulse" />
              </>
            )}
          </button>

          {/* Voice Command Status Indicator */}
          {isListening && (
            <div className="fixed bottom-24 right-6 z-40 bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3 animate-in slide-in-from-bottom-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-900">Listening...</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Try: "Open menu" or "Toggle sidebar"</p>
            </div>
          )}
          
          {/* Content Container */}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}