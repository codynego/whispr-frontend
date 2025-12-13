"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Brain, MessageSquare, Send, Sparkles, Lock, TrendingUp } from "lucide-react";

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
  
  const formattedParts = parts.map((part, index) => {
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
    <div className={`flex items-end gap-3 ${isVisitor ? "flex-row-reverse" : "flex-row"} mb-5`}>
      {!isVisitor && (
        <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md">
          {avatarPhotoUrl ? (
            <img src={avatarPhotoUrl} alt={avatarName} className="w-full h-full object-cover rounded-full" />
          ) : (
            <Brain className="w-5 h-5 text-white" />
          )}
        </div>
      )}
      <div className={`flex flex-col ${isVisitor ? "items-end" : "items-start"} max-w-[80%]`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isVisitor
              ? "bg-emerald-500 text-white rounded-br-none"
              : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
          }`}
        >
          {formatMessageContent(message.content)}
        </div>
        <span className="text-xs text-gray-400 mt-1 px-1">
          {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      {isVisitor && (
        <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 shadow-md">
          <MessageSquare className="w-5 h-5 text-gray-600" />
        </div>
      )}
    </div>
  );
}

// --- Auth Prompt Component ---
function AuthPromptCard({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
          <Sparkles className="w-12 h-12 mb-4 relative z-10" />
          <h2 className="text-2xl font-bold mb-2 relative z-10">Unlock Full Experience</h2>
          <p className="text-emerald-50 text-sm relative z-10">Sign up to access premium features and save your progress</p>
        </div>

        {/* Benefits */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Unlimited Conversations</h3>
              <p className="text-sm text-gray-600">Chat without limits and explore deeper insights</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Save Your Progress</h3>
              <p className="text-sm text-gray-600">Access your chat history anytime, anywhere</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Premium Features</h3>
              <p className="text-sm text-gray-600">Unlock advanced AI capabilities and tutorials</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-2 space-y-3">
          <a
            href="/auth/register"
            className="block w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl text-center transition-all transform hover:scale-105 shadow-lg"
          >
            Sign Up Free
          </a>
          <a
            href="/auth/login"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl text-center transition-all"
          >
            Log In
          </a>
          <button
            onClick={onClose}
            className="block w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
          >
            Continue as Guest
          </button>
        </div>
      </div>
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
  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-4">
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        <div className="flex-1 bg-gray-100 rounded-full px-5 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
          <input
            type="text"
            className="w-full bg-transparent text-sm outline-none placeholder-gray-500"
            placeholder={isLoading ? "Thinking..." : "Type your message..."}
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
          className="w-11 h-11 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white shadow-lg transition"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// --- Avatar Sidebar/Header Component ---
function AvatarInfo({ profile }: { profile: AvatarProfile }) {
  return (
    <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0 shadow-lg backdrop-blur-sm">
          {profile.photo_url ? (
            <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <Brain className="w-9 h-9" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold mb-1">{profile.name}'s AI</h1>
          <p className="text-sm opacity-90 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
            @{profile.handle} • Online
          </p>
        </div>
      </div>
      {profile.description && (
        <p className="text-sm opacity-95 leading-relaxed bg-white bg-opacity-10 rounded-xl p-3 backdrop-blur-sm">
          {profile.description}
        </p>
      )}
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
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    params.then(p => setAvatarHandle(p.handle));
  }, [params]);

  // Visitor ID
  useEffect(() => {
    let id = localStorage.getItem("whisone_visitor_id");
    if (!id) {
      id = `vis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("whisone_visitor_id", id);
    }
    setVisitorId(id);

    // Check authentication status
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
              content: `Hello! I'm ${profileData.name}'s AI Avatar!`,
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

  // Show auth prompt after 6 messages for unauthenticated users
  useEffect(() => {
    if (!isAuthenticated && messages.length >= 6 && !showAuthPrompt) {
      const timer = setTimeout(() => setShowAuthPrompt(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [messages.length, isAuthenticated, showAuthPrompt]);

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
        content: "Response timed out. Please try again.",
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
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      setIsSending(false);
    }
  };

  // --- Loading / Error States ---
  if (loading || !visitorId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Connecting to @{avatarHandle}...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md">
          <Brain className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Avatar Not Found</h1>
          <p className="text-gray-600">@{avatarHandle} is not public or doesn't exist.</p>
        </div>
      </div>
    );
  }

  // --- Main Layout ---
  return (
    <div className="flex h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Auth Prompt Modal */}
      {showAuthPrompt && <AuthPromptCard onClose={() => setShowAuthPrompt(false)} />}

      {/* Desktop Sidebar | Mobile Header */}
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-10 overflow-y-auto">
        <AvatarInfo profile={profile} />
        {profile.settings.disclaimer_text && (
          <div className="mx-5 mb-5 p-4 bg-amber-50 text-amber-800 rounded-xl text-sm border border-amber-200">
            <span className="font-bold">⚠️ Disclaimer:</span> {profile.settings.disclaimer_text}
          </div>
        )}
      </aside>

      <div className="flex flex-col flex-1 md:ml-80">
        {/* Mobile Header */}
        <header className="md:hidden">
          <AvatarInfo profile={profile} />
          {profile.settings.disclaimer_text && (
            <div className="px-5 py-3 bg-amber-50 text-amber-800 text-xs border-b border-amber-200">
              <span className="font-bold">⚠️ Disclaimer:</span> {profile.settings.disclaimer_text}
            </div>
          )}
        </header>

        {/* Messages Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {messages.map(msg => (
              <ChatMessageBubble key={msg.id} message={msg} avatarPhotoUrl={profile.photo_url} avatarName={profile.name} />
            ))}
            {isSending && (
              <div className="flex items-end gap-3 mb-5">
                <div className="w-9 h-9 rounded-full bg-emerald-500 flex-shrink-0 shadow-md flex items-center justify-center">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm">
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
        <PublicMessageInput sendMessage={sendMessage} isLoading={isSending} />
      </div>

      <style jsx>{`
        .typing-dots span {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #999;
          margin: 0 2px;
          animation: wave 1.2s infinite;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes wave {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
        
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
        }

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
      `}</style>
    </div>
  );
}