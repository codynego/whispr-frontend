"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Mail, CheckCircle, Bell, MessageCircle, Zap, Calendar, Clock, Menu, X } from "lucide-react";

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    { sender: "Whispr", text: "Hey there 👋 What can I help you with today?", time: "Now" },
  ]);
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

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = { sender: "You", text: input, time: "Now" };
    setMessages([...messages, newMessage]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: "Whispr", text: "Got it! Checking your recent important emails...", time: "Now" },
      ]);
      setLoading(false);
    }, 1500);
  };

  const quickActions = [
    { text: "Summarize today's emails", icon: Mail },
    { text: "Remind me if boss replies", icon: Bell },
    { text: "Add task from latest email", icon: CheckCircle },
  ];

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
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative max-w-[85%] sm:max-w-[75%] md:max-w-[70%] p-3 sm:p-4 rounded-2xl shadow-sm ${
                      msg.sender === "You"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-md"
                        : "bg-white text-gray-900 rounded-bl-md border border-gray-200"
                    }`}
                  >
                    <p className="text-sm sm:text-base break-words">{msg.text}</p>
                    <p className={`text-xs mt-2 flex items-center gap-1 ${
                      msg.sender === "You" ? "text-indigo-100" : "text-gray-500"
                    }`}>
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      {msg.time}
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
                disabled={!input.trim()}
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
                  <p className="text-xs text-gray-700 mb-2">"Follow up with client on proposal."</p>
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