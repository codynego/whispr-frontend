"use client"; // <<< REQUIRED DIRECTIVE FOR USING HOOKS IN NEXT.JS

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Brain, MessageSquare, ArrowUp } from "lucide-react";
import toast from "react-hot-toast";
// import { format } from "date-fns";
import { ChatMessageBubble } from "@/components/avatars/ChatMessageBubble"; // Reused/Adapted Component

// Simplified types for the public view
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
    role: "visitor" | "assistant" | "owner"; // Added owner role for potential takeover display
    content: string;
    created_at: string;
}

// --- Component Definition ---

export default function PublicChatShell({ params }: { params: { handle: string } }) {
    const avatarHandle = params.handle;
    
    // Use a simple session ID for the visitor, stored in localStorage
    const [visitorId, setVisitorId] = useState<string | null>(null);
    const [profile, setProfile] = useState<AvatarProfile | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- Helpers ---
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // Generate or retrieve persistent visitor ID
    useEffect(() => {
        let id = localStorage.getItem("whisone_visitor_id");
        if (!id) {
            id = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem("whisone_visitor_id", id);
        }
        setVisitorId(id);
    }, []);

    // --- Fetch Profile and History ---
    const fetchProfileAndHistory = useCallback(async () => {
        setLoading(true);
        if (!visitorId) return; // Wait for visitorId generation

        try {
            // 1. Fetch Profile (GET /api/avatars/<handle>/public/ - USING THE CORRECT PUBLIC ROUTE)
            const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/public/${avatarHandle}/`); // <<< FIX APPLIED HERE
            
            if (!profileRes.ok) {
                // If it fails, check for 404/403 and provide specific error
                const errorText = await profileRes.text();
                throw new Error(`Avatar not found or not public. (${profileRes.status}: ${errorText.substring(0, 50)}...)`);
            }
            const profileData = await profileRes.json();

            // Note: The backend view (AvatarRetrievePublicView) already enforces is_public=True, 
            // but this client-side check is a good safeguard.
            if (!profileData.settings.is_public) {
                // This shouldn't be reached if backend is correct, but safe check remains
                throw new Error("This Avatar is not currently public.");
            }

            setProfile(profileData);

            // 2. Fetch History (GET /api/avatars/<handle>/history/ - simplified endpoint)
            const historyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/history/?visitor_id=${visitorId}`);
            if (!historyRes.ok) throw new Error("Failed to load conversation history.");
            
            // Assuming historyData is an array of messages
            const historyData = await historyRes.json();
            // Note: History endpoint is ListAPIView, returns an array directly, not { messages: [...] }
            const historyMessages: Message[] = Array.isArray(historyData) ? historyData : []; 

            setMessages(historyMessages.length > 0 ? historyMessages : [
                {
                    id: 'intro',
                    role: "assistant",
                    content: `Hello! I'm ${profileData.name}'s AI Avatar. I know everything about their notes, files, and work. Ask me anything!`,
                    created_at: new Date().toISOString(),
                }
            ]);

        } catch (error: any) {
            console.error("Fetch Error:", error);
            toast.error(error.message || "Failed to load the Avatar page.");
            setProfile(null); // Clear profile on error
        } finally {
            setLoading(false);
        }
    }, [avatarHandle, visitorId]);

    useEffect(() => {
        if (visitorId) {
            fetchProfileAndHistory();
        }
    }, [visitorId, fetchProfileAndHistory]);
    
    useEffect(() => scrollToBottom(), [messages]);

    // --- Polling (Adapted from AssistantPage) ---
    const handlePolling = useCallback(() => {
        if (!currentTaskId || !visitorId) return;

        const interval = setInterval(async () => {
            // GET /api/avatars/training-jobs/<uuid:id>/status/ -- REUSING THE TASK STATUS ENDPOINT FOR CHAT
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/avatars/training-jobs/${currentTaskId}/status/` 
            ); 

            if (!res.ok) return;

            const data = await res.json();
            // Assuming the successful completion status is 'success' as per your backend view:
            if (data.status === "success") { 
                setMessages(prev => {
                    const assistantReply = data.assistant_reply || "I seem to be having trouble connecting. Please try again.";
                    
                    // Check if the reply is already present to prevent duplicates on successful poll
                    const isReplyAlreadyAdded = prev.some(msg => msg.content === assistantReply && msg.role === 'assistant');
                    
                    if (isReplyAlreadyAdded) return prev;

                    return [...prev, {
                        id: Date.now(),
                        role: "assistant",
                        content: assistantReply,
                        created_at: new Date().toISOString(),
                    }];
                });
                setCurrentTaskId(null);
                clearInterval(interval);
            }
        }, 1200);

        const timeout = setTimeout(() => {
            clearInterval(interval);
            if (currentTaskId) { // Only show error if a task was active
                 setMessages(prev => [...prev, {
                    id: Date.now(),
                    role: "assistant",
                    content: "The Avatar response timed out. Please try your message again.",
                    created_at: new Date().toISOString(),
                 }]);
            }
            setCurrentTaskId(null);
        }, 45000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [currentTaskId, visitorId]);
    
    useEffect(() => {
        handlePolling();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTaskId]);
    

    // --- Message Submission Handler ---
    const sendMessage = async (message: string) => {
        if (!message.trim() || currentTaskId || !visitorId) return;

        const userMsg: Message = {
            id: Date.now(),
            role: "visitor", // Renamed from "user" to "visitor" for public context
            content: message,
            created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMsg]);
        
        try {
            // POST /api/avatars/<handle>/chat/
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/chat/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message, visitor_id: visitorId }),
            });

            if (res.ok) {
                const data = await res.json();
                setCurrentTaskId(data.task_id);
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to send message to Avatar.");
            }
        } catch (error: any) {
             toast.error(error.message || "Failed to initiate chat.");
             // Remove the user message on error to allow retry
             setMessages(prev => prev.filter(msg => msg.id !== userMsg.id));
        }
    };


    if (loading || !profile) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <p className="ml-3 text-lg text-gray-700">Loading {avatarHandle}...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto w-full bg-white shadow-xl">
            {/* Header */}
            <header className="flex items-center gap-4 p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center shadow-md">
                    <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{profile.name}&apos;s AI</h1>
                    <p className="text-sm text-gray-600">Public Avatar | @{profile.handle}</p>
                </div>
            </header>

            {/* Disclaimer */}
            {profile.settings.disclaimer_text && (
                <div className="p-4 bg-yellow-50 text-yellow-800 text-sm border-b border-yellow-200">
                    ⚠️ {profile.settings.disclaimer_text}
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg) => (
                    <ChatMessageBubble // Reusing/Adapting the component from the internal chat
                        key={msg.id}
                        message={msg}
                    />
                ))}

                {currentTaskId && (
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                            <MessageSquare className="w-4 h-4 text-emerald-600 animate-pulse" />
                        </div>
                        <div className="text-gray-600 italic">Avatar is thinking...</div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <PublicMessageInput 
                sendMessage={sendMessage}
                isLoading={!!currentTaskId}
            />
        </div>
    );
}

// --- Simple PublicMessageInput Component ---
interface PublicMessageInputProps {
    sendMessage: (message: string) => void;
    isLoading: boolean;
}

function PublicMessageInput({ sendMessage, isLoading }: PublicMessageInputProps) {
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (input.trim() && !isLoading) {
            sendMessage(input);
            setInput("");
        }
    };

    return (
        <div className="flex items-center p-4 border-t border-gray-100 bg-white">
            <input
                type="text"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none"
                placeholder={isLoading ? "Waiting for Avatar..." : "Type your message..."}
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isLoading}
                onKeyDown={e => {
                    if (e.key === "Enter") handleSend();
                }}
            />
            <button
                className="ml-2 px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center disabled:opacity-50"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                aria-label="Send"
            >
                <ArrowUp className="w-4 h-4" />
            </button>
        </div>
    );
}