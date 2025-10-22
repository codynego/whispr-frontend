"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Send, Loader2, Mail, CheckCircle, Bell, MessageCircle, Zap, Calendar, Clock, Menu, X } from "lucide-react";

interface AssistantMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const formatMessage = (content: string): React.JSX.Element => {
  // First, replace **bold** with <strong>
  const processed = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Split into intro and bullet parts based on * patterns
  const parts = processed.split(/\s*\*\s+/);

  if (parts.length === 1) {
    // No bullets detected
    return <p className="text-sm sm:text-base break-words mb-0" dangerouslySetInnerHTML={{ __html: processed }} />;
  }

  const intro = parts[0].trim();
  const bulletTexts = parts.slice(1).map(text => text.trim());

  const bullets = bulletTexts.map((text, i) => (
    <li key={i} className="text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: text }} />
  ));

  return (
    <div className="space-y-2">
      {intro && (
        <p className="text-sm sm:text-base break-words mb-2" dangerouslySetInnerHTML={{ __html: intro }} />
      )}
      <ul className="list-disc pl-5 space-y-1">
        {bullets}
      </ul>
    </div>
  );
};

export default function AssistantPage() {
  const { accessToken } = useAuth();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!accessToken) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistant/chat/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.status === 401) {
          console.error("Unauthorized");
          return;
        }

        const data = await res.json();
        const messagesList = Array.isArray(data) ? data : (data.results || []);
        // Sort messages by created_at ascending (oldest first)
        const sortedMessages: AssistantMessage[] = messagesList.sort((a: AssistantMessage, b: AssistantMessage) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        // Prepend welcome if no messages
        if (sortedMessages.length === 0) {
          setMessages([{
            id: Date.now(),
            role: 'assistant',
            content: "Hey there 👋 What can I help you with today?",
            created_at: new Date().toISOString()
          }]);
        } else {
          setMessages(sortedMessages);
        }
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    fetchMessages();
  }, [accessToken]);

  const handleSend = async () => {
    if (!input.trim() || !accessToken) return;

    const userMessage: AssistantMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const tempInput = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistant/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: tempInput,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage: AssistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.assistant_reply || "Thanks for your message! I'll process that.",
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        console.error("Failed to send message");
        setMessages((prev) => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: "Sorry, something went wrong. Please try again.",
          created_at: new Date().toISOString(),
        }]);
      }
    } catch (err) {
      console.error("Send error", err);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Network error. Please check your connection.",
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
  { text: "@Summarize today's emails", icon: Mail },
  { text: "@Reply to pending messages", icon: Send },
  { text: "@Find follow-ups due today", icon: Clock },
  ];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full relative">
        {/* Header */}
        <header className="flex justify-between items-center px-4 sm:px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex-shrink-0 z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md flex-shrink-0">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">WhisprAI Assistant</h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Your AI productivity companion</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors xl:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
            </button>
          </div>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4 min-h-full flex flex-col">
            <div className="flex-1 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative max-w-[85%] sm:max-w-[75%] md:max-w-[70%] p-3 sm:p-4 rounded-2xl shadow-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-md"
                        : "bg-white text-gray-900 rounded-bl-md border border-gray-200"
                    }`}
                  >
                    {formatMessage(msg.content)}
                    <p className={`text-xs mt-2 flex items-center gap-1 ${
                      msg.role === "user" ? "text-indigo-100" : "text-gray-500"
                    }`}>
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  </div>
                  <div className="text-sm text-gray-600">
                    Whispr is typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Spacer for fixed bottom section */}
            <div className="h-32 sm:h-36 flex-shrink-0" />
          </div>
        </div>

        {/* Fixed Bottom Section - Quick Actions + Input */}
        <div className="absolute bottom-0 left-0 right-0 xl:right-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-4 px-4 sm:px-6 z-10">
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-gray-700 border border-gray-200 transition-all hover:shadow-sm hover:border-gray-300"
                  onClick={() => setInput(action.text)}
                >
                  <action.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 flex-shrink-0" />
                  <span className="truncate">{action.text}</span>
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl shadow-lg px-4 py-3 hover:shadow-xl transition-shadow">
              <input
                type="text"
                placeholder="Ask Whispr to check new important mails..."
                className="flex-1 outline-none bg-transparent text-sm sm:text-base text-gray-900 placeholder:text-gray-500 min-w-0"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="disabled:opacity-50 disabled:cursor-not-allowed p-2 sm:p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex-shrink-0"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Context Sidebar */}
      <aside className={`
        fixed xl:static top-0 right-0 h-full w-80 max-w-[85%] sm:max-w-sm
        bg-white border-l border-gray-200 shadow-2xl xl:shadow-none
        transform transition-transform duration-300 ease-in-out z-50
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
      `}>
        <div className="h-full overflow-y-auto p-4 sm:p-6">
          {/* Mobile Close Button */}
          <div className="flex justify-between items-center mb-6 xl:hidden">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              Quick Context
            </h2>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 hidden xl:flex">
            <Zap className="w-4 h-4 text-indigo-600" />
            Quick Context
          </h2>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-gray-900 mb-1">2 new important emails</p>
                  <p className="text-xs text-gray-600">From: manager@company.com</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-gray-900 mb-2">1 task due tomorrow</p>
                  <p className="text-xs text-gray-700 mb-2">Follow up with client on proposal.</p>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    Due: Oct 7, 2025
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-gray-900 mb-1">Active reminders</p>
                  <p className="text-xs text-gray-600">You have 3 active email reminders set</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}