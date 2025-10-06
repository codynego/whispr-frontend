"use client";

import { useState } from "react";
import { Mail, Star, Trash2 } from "lucide-react";

export default function InboxPage() {
  const [emails] = useState([
    {
      id: 1,
      sender: "David Johnson",
      subject: "Meeting follow-up: Project Proposal",
      summary: "Just wanted to confirm the next steps for tomorrow’s meeting.",
      tag: "Work",
      important: true,
    },
    {
      id: 2,
      sender: "Spotify",
      subject: "Your subscription is expiring soon",
      summary: "Renew your plan to continue enjoying ad-free music.",
      tag: "Personal",
      important: false,
    },
    {
      id: 3,
      sender: "HR Team",
      subject: "Policy Update: Remote Work",
      summary: "Please review the new guidelines for flexible work arrangements.",
      tag: "Work",
      important: true,
    },
  ]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">📬 Inbox</h1>
      <p className="text-gray-500 text-sm mb-6">
        Important and summarized emails detected by WhisprAI.
      </p>

      <div className="space-y-4">
        {emails.map((email) => (
          <div
            key={email.id}
            className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800">{email.sender}</p>
                <p className="text-sm text-gray-600">{email.subject}</p>
              </div>
              <div className="flex space-x-2">
                {email.important && (
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                )}
                <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{email.summary}</p>
            <div className="mt-3">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  email.tag === "Work"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {email.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
