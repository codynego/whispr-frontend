"use client";

import { useState } from "react";
import { Mail, Star, Trash2, Clock, Tag, MoreVertical, Archive } from "lucide-react";

export default function InboxPage() {
  const [emails, setEmails] = useState([
    {
      id: 1,
      sender: "David Johnson",
      avatar: "DJ",
      subject: "Meeting follow-up: Project Proposal",
      summary: "Just wanted to confirm the next steps for tomorrow's meeting. Let me know if you have any questions.",
      tag: "Work",
      important: true,
      time: "2 min ago",
    },
    {
      id: 2,
      sender: "Spotify",
      avatar: "S",
      subject: "Your subscription is expiring soon",
      summary: "Renew your plan to continue enjoying ad-free music. Your Premium plan ends on Oct 15.",
      tag: "Personal",
      important: false,
      time: "1 hr ago",
    },
    {
      id: 3,
      sender: "HR Team",
      avatar: "HR",
      subject: "Policy Update: Remote Work",
      summary: "Please review the new guidelines for flexible work arrangements. Effective immediately.",
      tag: "Work",
      important: true,
      time: "Today, 9:30 AM",
    },
  ]);

interface Email {
    id: number;
    sender: string;
    avatar: string;
    subject: string;
    summary: string;
    tag: string;
    important: boolean;
    time: string;
}

const toggleImportant = (id: number): void => {
    setEmails(emails.map((email: Email) => 
        email.id === id ? { ...email, important: !email.important } : email
    ));
};

const deleteEmail = (id: number): void => {
    setEmails(emails.filter((email: Email) => email.id !== id));
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Inbox
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                AI-detected important emails
              </p>
            </div>
          </div>
        </header>

        {/* Email List */}
        <div className="space-y-3">
          {emails.map((email) => (
            <article
              key={email.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 overflow-hidden"
            >
              <div className="p-4 sm:p-5">
                <div className="flex gap-3 sm:gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-md">
                      {email.avatar}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Top Row: Sender and Time */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                        {email.sender}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-shrink-0 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">{email.time}</span>
                        <span className="xs:hidden">{email.time.split(',')[0]}</span>
                      </div>
                    </div>

                    {/* Subject */}
                    <p className="text-sm sm:text-base text-gray-700 font-medium mb-2 line-clamp-1">
                      {email.subject}
                    </p>

                    {/* Summary */}
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                      {email.summary}
                    </p>

                    {/* Bottom Row: Tag and Actions */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                          email.tag === "Work"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-green-50 text-green-700 border border-green-200"
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        {email.tag}
                      </span>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleImportant(email.id)}
                          className={`p-2 rounded-lg transition-all ${
                            email.important
                              ? "text-yellow-500 hover:bg-yellow-50"
                              : "text-gray-400 hover:text-yellow-500 hover:bg-gray-50"
                          }`}
                          aria-label="Toggle important"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              email.important ? "fill-yellow-500" : ""
                            }`}
                          />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          aria-label="Archive"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteEmail(email.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State (shown when no emails) */}
        {emails.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-sm text-gray-600">No important emails at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}