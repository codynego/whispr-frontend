"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Brain, Send, Lock,  MoreVertical, X } from "lucide-react";

// --- Types & Constants ---
interface AvatarProfile {
  id: string;
  name: string;
  handle: string;
  photo_url: string | null;
  description?: string;
  settings: {
    is_public: boolean;
    disclaimer_text: string;
  };
}
interface Message {
  id: number | string;
  role: "visitor" | "assistant" | "owner";
  content: string;
  created_at: string;
}
interface HistoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Message[];
}
const CHAT_TIMEOUT_MS = 45000;
const CHAT_POLL_INTERVAL_MS = 1200;

// --- Markdown Formatter ---
function formatMessageContent(content: string): React.ReactElement {
  // Split by code blocks first to preserve them
  const parts = content.split(/```[\s\S]*?```/g);
  const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
  
  const formattedParts = parts.map((part) => {
    // Process bold (**text** or __text__)
    let processed = part.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Process italic (*text* or _text_) - but not if already inside bold
    processed = processed.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
                        .replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');
    
    return processed;
  });

  // Reconstruct with code blocks
  let result = '';
  formattedParts.forEach((part, index) => {
    result += part;
    if (codeBlocks[index]) {
      const code = codeBlocks[index].replace(/```/g, '');
      result += `<code class="code-block">${code}</code>`;
    }
  });

  return (
    <span 
      dangerouslySetInnerHTML={{ __html: result }}
      className="formatted-message"
    />
  );
}

// --- Chat Bubble ---
function ChatMessageBubble({
  message,
  avatarPhotoUrl,
  avatarName,
}: {
  message: Message;
  avatarPhotoUrl: string | null;
  avatarName: string;
}) {
  const isVisitor = message.role === "visitor";

  return (
    <div className={`flex items-end gap-2 ${isVisitor ? "justify-end" : "justify-start"} mb-2`}>
      {!isVisitor && (
        // Small Avatar for Assistant (Optional, but helps distinguish)
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 self-start mt-1 hidden sm:flex">
          {avatarPhotoUrl ? (
            <img src={avatarPhotoUrl} alt={avatarName} className="w-full h-full object-cover rounded-full" />
          ) : (
            <Brain className="w-3 h-3 text-white" />
          )}
        </div>
      )}
      <div className={`flex flex-col ${isVisitor ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[70%]`}>
        <div
          className={`px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words min-w-[70px] relative shadow-md ${
            isVisitor
              ? "bg-emerald-500 text-white rounded-xl rounded-br-sm" // Visitor: Green/Blue, sharp corner bottom-right
              : "bg-white text-gray-800 rounded-xl rounded-tl-sm border border-gray-100" // Assistant: White/Light, sharp corner top-left
          }`}
        >
          {formatMessageContent(message.content)}
          <span className={`text-xs mt-1 block text-right ${isVisitor ? 'text-emerald-100' : 'text-gray-400'}`}>
            {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            {/* Optional: Add a checkmark icon here like WhatsApp does */}
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Chat Header (Replaces Sidebar/Mobile Header) ---
function ChatHeader({ profile, onInfoClick }: { profile: AvatarProfile, onInfoClick: () => void }) {
  return (
    <header className="flex-shrink-0 bg-white shadow-md border-b border-gray-100 p-4 sticky top-0 z-20">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onInfoClick}>
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <Brain className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900 leading-snug">{profile.name}'s AI</h1>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700 p-1 rounded-full transition">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

// --- Info Panel Content (Shared between modal and sidebar) ---
function InfoPanelContent({ 
  profile, 
  currentPath, 
  isAuthenticated,
  onClose 
}: { 
  profile: AvatarProfile; 
  currentPath: string; 
  isAuthenticated: boolean;
  onClose: () => void;
}) {
  const redirectUrl = encodeURIComponent(currentPath);
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Chat Info & Settings</h2>
        <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Avatar Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg mb-3">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <Brain className="w-10 h-10 text-white" />
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{profile.name}'s AI</h3>
          <p className="text-sm text-gray-500">@{profile.handle}</p>
        </div>
        {profile.description && (
          <p className="text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded-lg italic border-l-4 border-emerald-400">
            "{profile.description}"
          </p>
        )}
      </div>

      {/* Disclaimer */}
      {profile.settings.disclaimer_text && (
        <div className="p-4 border-b border-gray-100 bg-amber-50">
          <p className="text-xs font-semibold text-amber-800 flex items-start gap-2">
            <span className="flex-shrink-0">⚠️ Disclaimer:</span> 
            <span>{profile.settings.disclaimer_text}</span>
          </p>
        </div>
      )}

      {/* Authentication Section (only if not authenticated) */}
      {!isAuthenticated && (
        <div className="p-4 space-y-3 mt-auto">
          <h4 className="font-bold text-gray-700 text-sm border-b pb-2">Full Access Required</h4>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-gray-900 mb-1">Unlimited Chat & History</h5>
              <p className="text-xs text-gray-600">Sign up to keep your conversations saved.</p>
            </div>
          </div>
          <a
            href={`/auth/register?redirect=${redirectUrl}`}
            className="block w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-all shadow-lg text-sm"
          >
            Sign Up / Log In
          </a>
          <button
            onClick={onClose}
            className="block w-full text-gray-500 hover:text-gray-700 text-xs py-1 transition-colors"
          >
            Continue as Guest (Limited)
          </button>
        </div>
      )}
    </div>
  );
}

// --- Input Component ---
function PublicMessageInput({
  sendMessage,
  isLoading,
}: {
  sendMessage: (message: string) => void;
  isLoading: boolean;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput("");
      // Keep focus on the input after sending
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex-shrink-0 bg-white border-t border-gray-200 p-3 sticky bottom-0 z-10">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <div className="flex-1 bg-gray-100 rounded-3xl px-4 py-2 focus-within:ring-2 focus-within:ring-emerald-500 transition-all border border-gray-200">
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-sm outline-none placeholder-gray-500 resize-none max-h-40 overflow-y-auto"
            placeholder={isLoading ? "AI is typing..." : "Message @{AvatarHandle}"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="w-11 h-11 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white shadow-lg transition flex-shrink-0"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function PublicChatShell({ params }: { params: Promise<{ handle: string }> }) {
  const [avatarHandle, setAvatarHandle] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [profile, setProfile] = useState<AvatarProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    params.then(p => setAvatarHandle(p.handle));
  }, [params]);

  // Visitor ID & Auth Check
  useEffect(() => {
    let id = localStorage.getItem("whisone_visitor_id");
    if (!id) {
      id = `vis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("whisone_visitor_id", id);
    }
    setVisitorId(id);

    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/`, {
          credentials: 'include'
        });
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch profile + history
  const fetchProfileAndHistory = useCallback(async () => {
    if (!visitorId || !avatarHandle) return;
    setLoading(true);
    try {
      const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/public/`);
      if (!profileRes.ok) throw new Error("Avatar not found");
      const profileData: AvatarProfile = await profileRes.json();
      setProfile(profileData);

      const historyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/history/?visitor_id=${visitorId}`);
      if (!historyRes.ok) throw new Error("Failed to load history");
      const historyData: HistoryResponse = await historyRes.json();

      const sorted = historyData.results.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      setMessages(
        sorted.length > 0
          ? sorted
          : [{
              id: "intro",
              role: "assistant" as const,
              content: `Hello! I'm **${profileData.name}**'s AI Avatar. How can I help you today?`,
              created_at: new Date().toISOString(),
            }]
      );
    } catch (err) {
      console.error(err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [avatarHandle, visitorId]);

  useEffect(() => {
    if (visitorId && avatarHandle) fetchProfileAndHistory();
  }, [visitorId, avatarHandle, fetchProfileAndHistory]);

  useEffect(() => scrollToBottom(), [messages]);

  // Show info panel after 6 messages for unauthenticated users
  useEffect(() => {
    if (!isAuthenticated && messages.length >= 6 && !showInfoPanel) {
      const timer = setTimeout(() => setShowInfoPanel(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [messages.length, isAuthenticated, showInfoPanel]);

  // Polling
  useEffect(() => {
    if (!currentTaskId) return;
    setIsSending(true);
    const interval = setInterval(async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/chat-tasks/${currentTaskId}/status/`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === "SUCCESS" || data.status === "FAILURE") {
        clearInterval(interval);
        setCurrentTaskId(null);
        setIsSending(false);
        if (data.status === "SUCCESS" && data.assistant_reply) {
          setMessages(prev => {
            // Simple check to prevent duplicates if polling lags
            if (prev.some(m => m.content === data.assistant_reply && m.role === "assistant")) return prev;
            return [...prev, {
              id: Date.now(),
              role: "assistant",
              content: data.assistant_reply,
              created_at: new Date().toISOString(),
            }];
          });
        }
      }
    }, CHAT_POLL_INTERVAL_MS);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsSending(false);
      setCurrentTaskId(null);
      setMessages(prev => [...prev, {
        id: "timeout",
        role: "assistant",
        content: "*Response timed out. Please try again.*",
        created_at: new Date().toISOString(),
      }]);
    }, CHAT_TIMEOUT_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [currentTaskId]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isSending || !visitorId || !avatarHandle) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "visitor",
      content: message,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsSending(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, visitor_id: visitorId }),
      });
      if (res.ok) {
        const { task_id } = await res.json();
        setCurrentTaskId(task_id);
      } else {
        throw new Error("Failed to send");
      }
    } catch {
      // Rollback user message on failure
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      setIsSending(false);
    }
  };

  // --- Loading / Error States ---
  if (loading || !visitorId) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Connecting to @{avatarHandle}...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-white p-4">
        <div className="bg-white rounded-xl shadow-2xl p-10 text-center max-w-md border border-gray-100">
          <Brain className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Avatar Not Found</h1>
          <p className="text-gray-600">The AI avatar @{avatarHandle} is not public or doesn't exist.</p>
        </div>
      </div>
    );
  }

  // --- Main Layout ---
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      
      {/* Chat Column */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Chat Header */}
        <ChatHeader profile={profile} onInfoClick={() => setShowInfoPanel(true)} />

        {/* Messages Area (Scrollable Main Content) */}
        <main className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar" style={{backgroundImage: "url('/whatsapp-bg.png')", backgroundSize: 'auto'}}>
          <div className="max-w-4xl mx-auto">
            {messages.map(msg => (
              <ChatMessageBubble 
                key={msg.id} 
                message={msg} 
                avatarPhotoUrl={profile.photo_url} 
                avatarName={profile.name} 
              />
            ))}
            
            {/* Typing Indicator */}
            {isSending && currentTaskId === null && (
              <div className="flex items-end gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex-shrink-0 self-start mt-1 hidden sm:flex">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
                <div className="bg-white px-3 py-2 rounded-xl rounded-tl-sm border border-gray-100 shadow-sm">
                  <div className="typing-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Fixed Input Bar */}
        <PublicMessageInput sendMessage={sendMessage} isLoading={isSending && currentTaskId !== null} />
      </div>

      {/* Desktop Sidebar */}
      {showInfoPanel && (
        <aside className="hidden lg:flex flex-col w-80 bg-white border-l border-gray-100 shadow-lg overflow-y-auto">
          <InfoPanelContent 
            profile={profile}
            currentPath={`/a/${avatarHandle}`}
            isAuthenticated={isAuthenticated}
            onClose={() => setShowInfoPanel(false)}
          />
        </aside>
      )}

      {/* Mobile Modal */}
      {showInfoPanel && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-slideUp">
            <InfoPanelContent 
              profile={profile}
              currentPath={`/a/${avatarHandle}`}
              isAuthenticated={isAuthenticated}
              onClose={() => setShowInfoPanel(false)}
            />
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Global styles for code blocks and markdown */
        .formatted-message strong {
          font-weight: 600;
          color: inherit;
        }
        
        .formatted-message em {
          font-style: italic;
          color: inherit;
        }
        
        .formatted-message .code-block {
          display: block;
          background: rgba(0, 0, 0, 0.05);
          padding: 8px 12px;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          margin: 8px 0;
          white-space: pre-wrap;
          border: 1px solid rgba(0, 0, 0, 0.1);
          color: #333; /* Darker text for readability in code block */
        }
      `}</style>

      <style jsx>{`
        /* Typing indicator dots */
        .typing-dots {
            display: flex;
            align-items: center;
            height: 16px; /* Ensure space for dots */
        }
        .typing-dots span {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #999;
          margin: 0 2px;
          animation: wave 1.2s infinite;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes wave {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); } /* Reduced bounce height */
        }

        /* Animations for Modal */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }

        /* Optional: Custom Scrollbar for subtle look */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #ccc;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: #f1f1f1;
        }
      `}</style>
    </div>
  );
}