"use client";

import React, { useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

interface PublicMessageInputProps {
    sendMessage: (message: string) => void;
    isLoading: boolean;
}

export const PublicMessageInput = ({ sendMessage, isLoading }: PublicMessageInputProps) => {
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        sendMessage(input);
        setInput("");
    };

    return (
        <div className="border-t border-gray-200 bg-white p-6">
            <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 py-3 border border-gray-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder="Ask the Avatar anything..."
                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <ArrowUp className="w-5 h-5" />
                    )}
                </button>
            </div>
        </div>
    );
};