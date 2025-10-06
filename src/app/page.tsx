"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, input]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto p-6 space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className="bg-white shadow p-3 rounded-lg max-w-lg">
            {msg}
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-white flex gap-2">
        <Input
          placeholder="Ask Whispr anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
}
