// src/components/avatars/ChatMessageBubble.tsx

"use client";

import React from "react";
import Markdown from 'react-markdown';
import Image from 'next/image'; // Using Next.js Image component is best practice
import { Brain, User } from "lucide-react";
import { format } from "date-fns"; // Standardizing date formatting

interface Message {
    id: number | string;
    role: "visitor" | "assistant" | "owner";
    content: string;
    created_at: string;
}

interface ChatMessageBubbleProps {
    message: Message;
    // New Props for better UI context
    avatarPhotoUrl?: string | null;
    avatarName?: string;
}

export const ChatMessageBubble = ({ 
    message, 
    avatarPhotoUrl, 
    avatarName 
}: ChatMessageBubbleProps) => {
    // --- 1. Determine Roles and Alignment ---
    const isVisitor = message.role === "visitor";
    const isAssistant = message.role === "assistant";
    const isOwner = message.role === "owner";

    // --- 2. Define Styling and Layout based on Role ---
    
    let bubbleClass;
    let iconContent;
    let roleTag = null;
    // The main container determines alignment and gap
    const containerClass = `flex w-full gap-3 ${isVisitor ? "justify-end" : "justify-start"}`; 

    if (isVisitor) {
        // VISITOR: Aligned right, blue/indigo background
        bubbleClass = "bg-indigo-600 text-white rounded-xl rounded-tr-none";
        // Icon on the right (placeholder or actual visitor photo)
        iconContent = <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-white" /></div>;
    } else if (isOwner) {
        // OWNER (Human Takeover): Aligned left, uses Avatar photo, red styling
        bubbleClass = "bg-red-600 text-white rounded-xl rounded-tl-none border border-red-700 shadow-xl";
        roleTag = (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-800 text-white absolute -top-3 left-1/2 transform -translate-x-1/2 shadow-lg z-10 whitespace-nowrap">
                OWNER TAKEOVER
            </span>
        );
        // Icon on the left (Avatar/Owner's photo)
        iconContent = avatarPhotoUrl ? (
            <Image src={avatarPhotoUrl} alt={avatarName || "Owner"} width={32} height={32} className="rounded-full object-cover" />
        ) : (
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-gray-500" /></div>
        );
    } else {
        // ASSISTANT (AI): Aligned left, white background, emerald accents
        bubbleClass = "bg-white text-gray-900 rounded-xl rounded-tl-none border border-gray-100 shadow-lg";
        // Icon on the left (Avatar/AI photo)
        iconContent = avatarPhotoUrl ? (
            <Image src={avatarPhotoUrl} alt={avatarName || "Avatar"} width={32} height={32} className="rounded-full object-cover" />
        ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0"><Brain className="w-5 h-5 text-emerald-600" /></div>
        );
    }

    // --- 3. Final Render ---

    return (
        <div className={containerClass}>
            
            {/* ICON / AVATAR (Left Side: Assistant/Owner) */}
            {(!isVisitor) && (
                <div className="flex-shrink-0 self-end mb-1"> {/* Aligned to the bottom of the message */}
                    {iconContent}
                </div>
            )}

            {/* MESSAGE CONTENT */}
            <div className={`flex flex-col max-w-[85%] sm:max-w-[65%] ${isVisitor ? "items-end" : "items-start"} relative`}>
                {roleTag} 

                <div className={`p-4 text-sm md:text-base whitespace-pre-wrap ${bubbleClass} transition-colors duration-200`}>
                    {/* Render Markdown content */}
                    <Markdown
                        // Customize markdown components for Tailwind/color compatibility
                        components={{
                             p: ({ node, ...props }) => (
                                <p className="mb-0 text-inherit" {...props} />
                             ),
                             a: ({ node, ...props }) => (
                                <a className={isVisitor || isOwner ? "underline hover:text-indigo-200" : "text-emerald-600 hover:text-emerald-700 underline"} {...props} target="_blank" rel="noopener noreferrer" />
                             )
                             // ... ensure code blocks/headings are styled well here
                        }}
                    >
                        {message.content}
                    </Markdown>
                </div>
                
                {/* Timestamp */}
                <span className={`text-xs mt-1 text-gray-500 ${isVisitor ? "mr-1" : "ml-1"}`}>
                    {/* Use date-fns for formatting */}
                    {format(new Date(message.created_at), 'p')}
                </span>
            </div>
            
            {/* ICON / AVATAR (Right Side: Visitor) */}
            {(isVisitor) && (
                <div className="flex-shrink-0 self-end mb-1"> {/* Aligned to the bottom of the message */}
                    {iconContent}
                </div>
            )}
        </div>
    );
};