"use client";

import { useState } from "react";
import { Send, Loader2, Mail, CheckCircle, Bell } from "lucide-react";

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    { sender: "Whispr", text: "Hey there 👋 What can I help you with today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = { sender: "You", text: input };
    setMessages([...messages, newMessage]);
    setInput("");
    setLoading(true);

    // Simulate WhisprAI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: "Whispr", text: "Got it! Checking your recent important emails..." },
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat Section */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
        {/* Header */}
        <div className="pb-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-lg font-semibold">WhisprAI Assistant</h1>
          <div className="flex space-x-3 text-gray-500">
            <Mail className="w-5 h-5" />
            <CheckCircle className="w-5 h-5" />
            <Bell className="w-5 h-5" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mt-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl text-sm max-w-[70%] ${
                  msg.sender === "You"
                    ? "bg-red-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="animate-spin w-4 h-4" />
              <span>Whispr is typing...</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4 text-xs text-gray-600">
          {["Summarize today’s emails", "Remind me if boss replies", "Add task from latest email"].map(
            (action, i) => (
              <button
                key={i}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition"
                onClick={() => setInput(action)}
              >
                {action}
              </button>
            )
          )}
        </div>

        {/* Input Box */}
        <div className="mt-4 flex items-center bg-white border rounded-full shadow-sm px-4 py-2">
          <input
            type="text"
            placeholder="Ask Whispr to check new important mails"
            className="flex-1 outline-none bg-transparent text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Context Panel */}
      <div className="hidden xl:block w-80 border-l bg-white p-4">
        <h2 className="text-sm font-semibold mb-3">Context</h2>
        <div className="text-xs text-gray-500">
          <p>📬 You have 2 new emails flagged as important today.</p>
          <p className="mt-2">✅ 1 task due tomorrow: “Follow up with client on proposal.”</p>
        </div>
      </div>
    </div>
  );
}
