// src/components/PublicChatShell.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Brain, MessageSquare, ArrowUp } from "lucide-react";
import toast from "react-hot-toast";

// NOTE: Ensure these components are imported/defined as required
import { ChatMessageBubble } from "@/components/avatars/ChatMessageBubble"; 




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


// --- Constants ---
const CHAT_TIMEOUT_MS = 45000;
const CHAT_POLL_INTERVAL_MS = 1200;


// --- Helper Component: PublicMessageInput (Kept for completeness, assume moved to its own file) ---
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
                className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder={isLoading ? "Waiting for Avatar response..." : "Ask me anything..."}
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isLoading}
                onKeyDown={e => {
                    if (e.key === "Enter") handleSend();
                }}
            />
            <button
                className="ml-3 p-3 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
            >
                <ArrowUp className="w-5 h-5" />
            </button>
        </div>
    );
}


// --- Main Component Definition ---

export default function PublicChatShell({ params }: { params: { handle: string } }) {
    const avatarHandle = params.handle;
    
    // --- State setup ---
    const [visitorId, setVisitorId] = useState<string | null>(null);
    const [profile, setProfile] = useState<AvatarProfile | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- Helpers ---
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // 1. Generate or retrieve persistent visitor ID
    useEffect(() => {
        let id = localStorage.getItem("whisone_visitor_id");
        if (!id) {
            id = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem("whisone_visitor_id", id);
        }
        setVisitorId(id);
    }, []);

    // 2. Fetch Profile and History
    const fetchProfileAndHistory = useCallback(async () => {
        setLoading(true);
        if (!visitorId) return;

        try {
            // Fetch Profile
            const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/public/`); 
            
            if (!profileRes.ok) {
                 const errorText = await profileRes.text();
                 throw new Error(`Avatar not found or not public. (${profileRes.status})`);
            }
            const profileData = await profileRes.json();
            setProfile(profileData);

            // Fetch History
            const historyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/history/?visitor_id=${visitorId}`);
            if (!historyRes.ok) throw new Error("Failed to load conversation history.");
            
            const historyData: Message[] = await historyRes.json();
            console.log("Fetched History:", historyData);
            
            setMessages(historyData.length > 0 ? historyData : [
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
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, [avatarHandle, visitorId]);

    useEffect(() => {
        if (visitorId) {
            fetchProfileAndHistory();
        }
    }, [visitorId, fetchProfileAndHistory]);
    
    // 3. Scroll to bottom on new messages
    useEffect(() => scrollToBottom(), [messages]);

    // 4. Chat Polling Logic (For checking the background task's completion)
    // 💥 FIX APPLIED HERE: Polling URL changed from /training-jobs/ to /chat-tasks/
    useEffect(() => {
        if (!currentTaskId || !visitorId) return;

        setIsSending(true);

        const interval = setInterval(async () => {
            // ⭐ CORRECTED ENDPOINT: Use the dedicated chat task status URL
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/avatars/chat-tasks/${currentTaskId}/status/` 
            ); 

            if (!res.ok) return;

            const data = await res.json();
            
            // Assuming the new view returns "SUCCESS" or "FAILURE"
            if (data.status === "SUCCESS" || data.status === "FAILURE") { 
                
                setCurrentTaskId(null);
                setIsSending(false);
                
                if (data.status === "SUCCESS") {
                    // Note: The new backend view should return the actual message content,
                    // which is what 'data.assistant_reply' should contain.
                    const assistantReply = data.assistant_reply || "I seem to be having trouble connecting. Please try again.";
                    
                    setMessages(prev => {
                        // Simple check to prevent duplicates
                        const isReplyAlreadyAdded = prev.some(msg => msg.content === assistantReply && msg.role === 'assistant');
                        if (isReplyAlreadyAdded) return prev;

                        return [...prev, {
                            id: Date.now(),
                            role: "assistant",
                            content: assistantReply,
                            created_at: new Date().toISOString(),
                        }];
                    });
                } else {
                    toast.error("Avatar failed to respond. Please try again.");
                }
            }
        }, CHAT_POLL_INTERVAL_MS);

        // Timeout handler
        const timeout = setTimeout(() => {
            clearInterval(interval);
            if (currentTaskId) {
                 setMessages(prev => [...prev, {
                     id: Date.now(),
                     role: "assistant",
                     content: "The Avatar response timed out. Please try your message again.",
                     created_at: new Date().toISOString(),
                 }]);
            }
            setCurrentTaskId(null);
            setIsSending(false);
        }, CHAT_TIMEOUT_MS);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [currentTaskId, visitorId]);
    


    // 5. Message Submission Handler
    const sendMessage = async (message: string) => {
        if (!message.trim() || isSending || !visitorId) return;
        
        // --- 1. Add User Message Locally ---
        const userMsg: Message = {
            id: Date.now(),
            role: "visitor",
            content: message,
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMsg]);
        setIsSending(true); // Disable input while sending

        try {
            // --- 2. Send to API and get Task ID ---
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/chat/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message, visitor_id: visitorId }),
            });

            if (res.ok) {
                const data = await res.json();
                setCurrentTaskId(data.task_id); // Triggers the polling useEffect
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to send message to Avatar.");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to initiate chat.");
            setMessages(prev => prev.filter(msg => msg.id !== userMsg.id));
            setIsSending(false);
        }
    };


    // --- Render Logic ---

    // ... (Loading/Error handling remains the same) ...
    if (loading || !visitorId) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <p className="ml-3 text-lg text-gray-700">Connecting to {avatarHandle}...</p>
            </div>
        );
    }
    
    if (!profile) {
         return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
                <Brain className="w-12 h-12 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900">Avatar Not Available</h1>
                <p className="text-lg text-gray-600 mt-2">The AI Avatar @{avatarHandle} could not be found or is not set to public access.</p>
            </div>
        );
    }


    return (
        // Responsive Chat Container: Full height, constrained width, centered
        <div className="flex flex-col h-screen md:max-h-[90vh] md:w-[95%] lg:w-[700px] mx-auto bg-white shadow-2xl rounded-xl overflow-hidden">
            
            {/* Header */}
            <header className="flex items-center gap-4 p-4 border-b border-gray-100 bg-white z-10 sticky top-0">
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                    {profile.photo_url ? (
                        // Assuming you have a standard <img> or Next.js <Image> setup
                        <img src={profile.photo_url} alt={`${profile.name} photo`} className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <Brain className="w-5 h-5 text-white" />
                    )}
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-900 leading-tight">{profile.name}&apos;s AI</h1>
                    <p className="text-xs text-gray-500">Public Chat | @{profile.handle}</p>
                </div>
            </header>

            {/* Disclaimer */}
            {profile.settings.disclaimer_text && (
                <div className="p-3 bg-yellow-50 text-yellow-800 text-sm border-b border-yellow-200">
                    <span className="font-semibold">Disclaimer:</span> {profile.settings.disclaimer_text}
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
                {messages.map((msg) => (
                    <ChatMessageBubble 
                        key={msg.id}
                        message={msg}
                        avatarPhotoUrl={profile.photo_url} 
                        avatarName={profile.name}
                    />
                ))}

                {/* Typing Indicator */}
                {isSending && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-4 h-4 text-emerald-600 animate-pulse" />
                        </div>
                        <div className="text-gray-600 italic mt-1.5">Avatar is thinking...</div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <PublicMessageInput 
                sendMessage={sendMessage}
                isLoading={isSending}
            />
        </div>
    );
}