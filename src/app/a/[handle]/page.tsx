"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Brain, MessageSquare,  Send } from "lucide-react";

// --- Types ---
interface AvatarProfile {
  id: string;
  name: string;
  handle: string;
  photo_url: string | null;
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

// --- Constants ---
const CHAT_TIMEOUT_MS = 45000;
const CHAT_POLL_INTERVAL_MS = 1200;

// --- Chat Message Bubble Component ---
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
    <div className={`flex items-end gap-2 ${isVisitor ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      {!isVisitor && (
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
          {avatarPhotoUrl ? (
            <img src={avatarPhotoUrl} alt={avatarName} className="w-full h-full object-cover rounded-full" />
          ) : (
            <Brain className="w-4 h-4 text-white" />
          )}
        </div>
      )}
      
      <div className={`flex flex-col max-w-[75%] ${isVisitor ? 'items-end' : 'items-start'}`}>
        <div 
          className={`px-4 py-2.5 rounded-2xl shadow-sm ${
            isVisitor 
              ? 'bg-emerald-500 text-white rounded-br-sm' 
              : 'bg-white text-gray-800 rounded-bl-sm'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <span className="text-xs text-gray-400 mt-1 px-1">
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      {isVisitor && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 shadow-sm">
          <MessageSquare className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </div>
  );
}

// --- Message Input Component ---
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
    <div className="px-4 py-3 bg-white border-t border-gray-100">
      <div className="flex items-end gap-2">
        <div className="flex-1 bg-gray-50 rounded-3xl px-4 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
          <input
            type="text"
            className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
            placeholder={isLoading ? "Waiting..." : "Type a message"}
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
          className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex-shrink-0"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// --- Main Component ---
interface PublicChatShellProps {
  params: {
    handle: string;
  };
}

export default function PublicChatShell({ params }: PublicChatShellProps) {
  const avatarHandle = params.handle;

  // --- State ---
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [profile, setProfile] = useState<AvatarProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // 1. Persistent visitor ID
  useEffect(() => {
    let id = localStorage.getItem("whisone_visitor_id");
    if (!id) {
      id = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("whisone_visitor_id", id);
    }
    setVisitorId(id);
  }, []);

  // 2. Fetch profile + history
  const fetchProfileAndHistory = useCallback(async () => {
    setLoading(true);
    if (!visitorId) return;

    try {
      const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/public/`);
      if (!profileRes.ok) {
        throw new Error(`Avatar not found or not public. (${profileRes.status})`);
      }
      const profileData = await profileRes.json();
      console.log("Fetched Profile:", profileData);
      console.log("Avatar Handle:",  profileRes);
      setProfile(profileData);

      const historyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/history/?visitor_id=${visitorId}`);
      if (!historyRes.ok) throw new Error("Failed to load conversation history.");

      const historyResponseData = await historyRes.json();
      const fetchedMessages = historyResponseData.results;

      const sortedMessages: Message[] = (fetchedMessages as Message[]).sort(
        (a: Message, b: Message) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      setMessages(
        sortedMessages.length > 0
          ? sortedMessages
          : [
              {
                id: "intro",
                role: "assistant",
                content: `Hello! I'm ${profileData.name}'s AI Avatar. I know everything about their notes, files, and work. Ask me anything!`,
                created_at: new Date().toISOString(),
              },
            ]
      );
    } catch (error) {
      console.error("Fetch Error:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [avatarHandle, visitorId]);

  useEffect(() => {
    if (visitorId) fetchProfileAndHistory();
  }, [visitorId, fetchProfileAndHistory]);

  // 3. Auto-scroll
  useEffect(() => scrollToBottom(), [messages]);

  // 4. Polling for task completion
  useEffect(() => {
    if (!currentTaskId || !visitorId) return;

    setIsSending(true);

    const interval = setInterval(async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/chat-tasks/${currentTaskId}/status/`);
      if (!res.ok) return;

      const data = await res.json();

      if (data.status === "SUCCESS" || data.status === "FAILURE") {
        setCurrentTaskId(null);
        setIsSending(false);

        if (data.status === "SUCCESS") {
          const assistantReply = data.assistant_reply || "I seem to be having trouble connecting. Please try again.";

          setMessages((prev) => {
            const alreadyAdded = prev.some((m) => m.content === assistantReply && m.role === "assistant");
            if (alreadyAdded) return prev;

            return [
              ...prev,
              {
                id: Date.now(),
                role: "assistant",
                content: assistantReply,
                created_at: new Date().toISOString(),
              },
            ];
          });
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              role: "assistant",
              content: "Failed to respond. Please try again.",
              created_at: new Date().toISOString(),
            },
          ]);
        }
      }
    }, CHAT_POLL_INTERVAL_MS);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (currentTaskId) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: "assistant",
            content: "The Avatar response timed out. Please try your message again.",
            created_at: new Date().toISOString(),
          },
        ]);
      }
      setCurrentTaskId(null);
      setIsSending(false);
    }, CHAT_TIMEOUT_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [currentTaskId, visitorId]);

  // 5. Send message
  interface SendMessageParams {
    message: string;
  }

  const sendMessage = async (message: string): Promise<void> => {
    if (!message.trim() || isSending || !visitorId) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "visitor",
      content: message,
      created_at: new Date().toISOString(),
    };
    setMessages((prev: Message[]) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, visitor_id: visitorId }),
      });

      if (res.ok) {
        interface SendMessageResponse {
          task_id: string;
        }
        const data: SendMessageResponse = await res.json();
        setCurrentTaskId(data.task_id);
      } else {
        interface ErrorResponse {
          error?: string;
        }
        const errorData: ErrorResponse = await res.json();
        throw new Error(errorData.error || "Failed to send message to Avatar.");
      }
    } catch (error) {
      setMessages((prev: Message[]) => prev.filter((m) => m.id !== userMsg.id));
      setIsSending(false);
    }
  };

  // --- Render ---
  if (loading || !visitorId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-lg text-gray-700 font-medium">Connecting to {avatarHandle}...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md">
          <Brain className="w-16 h-16 text-red-500 mb-4 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Avatar Not Available</h1>
          <p className="text-gray-600">
            The AI Avatar @{avatarHandle} could not be found or is not set to public access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="flex flex-col h-full w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <header className="flex items-center gap-3 px-5 py-4 bg-emerald-500 text-white shadow-lg">
            <div className="w-11 h-11 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0 shadow-md">
              {profile.photo_url ? (
                <img src={profile.photo_url} alt={`${profile.name} photo`} className="w-full h-full object-cover rounded-full" />
              ) : (
                <Brain className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold leading-tight truncate">{profile.name}'s AI</h1>
              <p className="text-xs text-emerald-100 opacity-90">@{profile.handle} • Online</p>
            </div>
          </header>

          {/* Disclaimer */}
          {profile.settings.disclaimer_text && (
            <div className="px-5 py-3 bg-amber-50 text-amber-800 text-xs border-b border-amber-100">
              <span className="font-semibold">⚠️ Disclaimer:</span> {profile.settings.disclaimer_text}
            </div>
          )}

          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto px-5 py-4"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(0,0,0,.02) 35px, rgba(0,0,0,.02) 36px)',
              backgroundColor: '#f0f2f5'
            }}
          >
            {messages.map((msg) => (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                avatarPhotoUrl={profile.photo_url}
                avatarName={profile.name}
              />
            ))}

            {isSending && (
              <div className="flex items-end gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <MessageSquare className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <PublicMessageInput sendMessage={sendMessage} isLoading={isSending} />
        </div>
      </div>
    </div>
  );
}