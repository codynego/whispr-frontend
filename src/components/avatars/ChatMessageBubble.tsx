"use client";

import React from "react";
import Markdown from 'react-markdown'; // Assuming you use a markdown renderer
import Image from 'next/image';     // If you display user/avatar photos

interface Message {
    id: number | string;
    role: "visitor" | "assistant" | "owner"; // Crucial property for public chat
    content: string;
    created_at: string; // Used for timestamp
}

interface ChatMessageBubbleProps {
    message: Message;
}

export const ChatMessageBubble = ({ message }: ChatMessageBubbleProps) => {
    // --- 1. Determine Roles and Alignment ---
    const isVisitor = message.role === "visitor";
    const isAssistant = message.role === "assistant";
    const isOwner = message.role === "owner";

    // --- 2. Define Styling based on Role ---
    const alignmentClass = isVisitor ? "justify-end" : "justify-start";
    
    let bubbleClass;
    let textColorClass;
    let roleTag = null;
    
    if (isVisitor) {
        // Visitor's message (equivalent to "user" in internal chat)
        bubbleClass = "bg-indigo-600 text-white rounded-tr-none";
        textColorClass = "text-white";
    } else if (isOwner) {
        // Owner's message (Human Takeover)
        bubbleClass = "bg-red-500 text-white rounded-tl-none border border-red-600";
        textColorClass = "text-white";
        roleTag = <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-700 text-white absolute -top-3 left-1/2 transform -translate-x-1/2 shadow-lg">OWNER TAKEOVER</span>;
    } else {
        // Avatar/Assistant's message
        bubbleClass = "bg-white text-gray-900 rounded-tl-none border border-gray-100 shadow-md";
        textColorClass = "text-gray-900";
    }

    return (
        <div className={`flex ${alignmentClass} w-full`}>
            <div className={`flex flex-col max-w-[75%] ${isVisitor ? "items-end" : "items-start"} relative`}>
                {roleTag} {/* Display Takeover Tag */}

                <div className={`p-4 rounded-xl whitespace-pre-wrap ${bubbleClass} transition-colors duration-200`}>
                    <div className={textColorClass}>
                        {/* Assuming you pass and render markdown content here */}
                        <Markdown>
                            {message.content}
                        </Markdown>
                    </div>
                </div>
                
                {/* Timestamp */}
                <span className={`text-xs mt-1 text-gray-500 ${isVisitor ? "mr-1" : "ml-1"}`}>
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
};