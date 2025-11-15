"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Send, Loader2, Mail, CheckCircle, Bell, MessageCircle, Zap,  Clock, Menu, X, Settings, User } from "lucide-react";

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
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [pollStartTime, setPollStartTime] = useState<Date | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling effect for task status
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (currentTaskId && accessToken) {
      // Start polling regardless of loading, but use loading for UI
      // Set poll start time if not set
      if (!pollStartTime) {
        setPollStartTime(new Date());
      }

      console.log('Starting polling for task:', currentTaskId);
      interval = setInterval(async () => {
        try {
          console.log('Polling task:', currentTaskId);
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistant/chat/response/${currentTaskId}/`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          console.log('Poll response status:', res.status);

          if (!res.ok) {
            console.error("Polling failed:", res.status);
            // Don't stop on non-200, continue polling unless timeout
            return;
          }

          const data = await res.json();
          console.log('Poll data:', data);

          // Check timeout
          if (pollStartTime) {
            const now = new Date();
            if (now.getTime() - pollStartTime.getTime() > 60000) { // 60 seconds timeout
              console.log('Polling timeout reached');
              setLoading(false);
              setCurrentTaskId(null);
              setPollStartTime(null);
              setMessages((prev) => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: "Sorry, the response is taking too long. Please try again.",
                created_at: new Date().toISOString(),
              }]);
              if (interval) clearInterval(interval);
              return;
            }
          }

          if (data.status === "done") {
            console.log('Task completed successfully');
            const assistantMessage: AssistantMessage = {
              id: Date.now() + 1,
              role: 'assistant',
              content: data.assistant_reply || "Thanks for your message! I'll process that.",
              created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setLoading(false);
            setCurrentTaskId(null);
            setPollStartTime(null);
            if (interval) clearInterval(interval);
          }
          // Else continue polling (status: "pending")
        } catch (err) {
          console.error("Polling error:", err);
          // On error, stop polling and show error
          setMessages((prev) => [...prev, {
            id: Date.now() + 1,
            role: 'assistant',
            content: "Error checking response. Please try again.",
            created_at: new Date().toISOString(),
          }]);
          setLoading(false);
          setCurrentTaskId(null);
          setPollStartTime(null);
          if (interval) clearInterval(interval);
        }
      }, 1000); // Reduced to 1 second for faster response
    }

    return () => {
      if (interval) {
        console.log('Clearing polling interval');
        clearInterval(interval);
      }
    };
  }, [currentTaskId, accessToken, pollStartTime]); // Removed loading from deps, added pollStartTime if needed, but mainly currentTaskId triggers start/stop

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
    setPollStartTime(null); // Reset timeout

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
        console.log('POST response:', data);
        if (data.task_id) {
          setCurrentTaskId(data.task_id);
        } else {
          console.error('No task_id in response');
          setLoading(false);
          setMessages((prev) => [...prev, {
            id: Date.now() + 1,
            role: 'assistant',
            content: "Sorry, something went wrong. Please try again.",
            created_at: new Date().toISOString(),
          }]);
        }
      } else {
        console.error("Failed to send message:", res.status);
        const errorData = await res.json().catch(() => ({}));
        console.error('Error details:', errorData);
        setMessages((prev) => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: "Sorry, something went wrong. Please try again.",
          created_at: new Date().toISOString(),
        }]);
        setLoading(false);
      }
    } catch (err) {
      console.error("Send error", err);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Network error. Please check your connection.",
        created_at: new Date().toISOString(),
      }]);
      setLoading(false);
    }
  };

  const quickActions = [
  { text: "Summarize today's emails", icon: Mail },
  { text: "Reply to pending messages", icon: Send },
  { text: "Find follow-ups due today", icon: Clock },
  ];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const recentInteractions = [
    { id: 1, title: "Email Summary", time: "2 min ago", icon: Mail },
    { id: 2, title: "Task Reminders", time: "1 hour ago", icon: Clock },
    { id: 3, title: "Quick Reply Draft", time: "Today", icon: Send },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full relative xl:ml-0">
        {/* Header */}
        <header className="flex justify-between items-center px-4 sm:px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex-shrink-0 z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-md flex-shrink-0">
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
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md"
                        : "bg-white text-gray-900 rounded-bl-md border border-gray-200"
                    }`}
                  >
                    {formatMessage(msg.content)}
                    <p className={`text-xs mt-2 flex items-center gap-1 ${
                      msg.role === "user" ? "text-blue-100" : "text-gray-500"
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
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
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
                  <action.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
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
                className="disabled:opacity-50 disabled:cursor-not-allowed p-2 sm:p-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex-shrink-0"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sidebar */}
      <aside className={`
        fixed xl:static top-0 left-0 h-full w-64 max-w-[80%] sm:max-w-md
        bg-white border-r border-gray-200 shadow-lg xl:shadow-none
        transform transition-transform duration-300 ease-in-out z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Mobile Close Button */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 xl:hidden">
            <h2 className="text-lg font-bold text-gray-900">Navigation</h2>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Sidebar Content */}
          <nav className="flex-1 overflow-y-auto p-4">
            {/* User Profile */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">John Doe</p>
                  <p className="text-xs text-gray-600">john@company.com</p>
                </div>
              </div>
            </div>

            {/* Recent Interactions */}
            <div className="space-y-2 mb-6">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-blue-600" />
                Recent Interactions
              </h3>
              {recentInteractions.map((interaction) => (
                <button
                  key={interaction.id}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  onClick={() => {
                    setInput(`Continue with: ${interaction.title}`);
                    setSidebarOpen(false);
                  }}
                >
                  <interaction.icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{interaction.title}</p>
                    <p className="text-xs text-gray-500 truncate">{interaction.time}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Settings */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-600" />
                Settings
              </h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left text-sm text-gray-700">
                  <Mail className="w-4 h-4 text-gray-600" />
                  Email Preferences
                </button>
                <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left text-sm text-gray-700">
                  <Bell className="w-4 h-4 text-gray-600" />
                  Notifications
                </button>
              </div>
            </div>
          </nav>
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