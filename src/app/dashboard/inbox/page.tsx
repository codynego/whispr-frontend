"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Mail, Star, Trash2, Clock, Tag, Archive } from "lucide-react";

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

export default function InboxPage() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [emails, setEmails] = useState<Email[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchEmails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/emails/messages/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.status === 401) {
          console.error("Unauthorized: token invalid or expired");
          setLoading(false);
          return;
        }

        const data = await res.json();
        console.log("Fetched emails data:", data); // Debug log
        const emailsList = Array.isArray(data) ? data : (data.results || data.emails || []);
        const formattedEmails = emailsList.map((email: any) => ({
          ...email,
          avatar: getInitials(email.sender || email.from_name || 'Unknown'),
          time: email.date || email.time || 'Unknown',
          tag: email.label || email.tag || 'Personal',
          important: email.importance === 'high' || email.importance_score > 0.5 || email.is_important || email.important || false,
          summary: email.preview || email.body_preview || email.summary || '',
        }));
        setEmails(formattedEmails);
      } catch (err) {
        console.error("Failed to fetch emails", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, [accessToken]);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const displayedEmails = activeTab === "important" 
    ? emails.filter((email: Email) => email.important) 
    : emails;

  const handleEmailClick = (id: number) => {
    router.push(`/dashboard/inbox/messages/${id}`);
  };

  const toggleImportant = (id: number): void => {
    setEmails(emails.map((email: Email) => 
      email.id === id ? { ...email, important: !email.important } : email
    ));
  };

  const deleteEmail = (id: number): void => {
    setEmails(emails.filter((email: Email) => email.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading emails...</p>
      </div>
    );
  }

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
                {activeTab === "important" ? "Important emails" : "All messages"}
              </p>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All Messages
          </button>
          <button
            onClick={() => setActiveTab("important")}
            className={`px-4 py-2 text-sm font-medium transition-colors ml-8 ${
              activeTab === "important"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Important
          </button>
        </div>

        {/* Email List */}
        <div className="space-y-2">
          {displayedEmails.map((email: Email) => (
            <article
              key={email.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 overflow-hidden cursor-pointer"
              onClick={() => handleEmailClick(email.id)}
            >
              <div className="p-3 sm:p-4">
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
                    <p className="text-sm sm:text-base text-gray-700 font-medium mb-1 line-clamp-1">
                      {email.subject}
                    </p>

                    {/* Summary */}
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 leading-relaxed">
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
                          onClick={(e) => { e.stopPropagation(); toggleImportant(email.id); }}
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
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          aria-label="Archive"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteEmail(email.id); }}
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
        {displayedEmails.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === "important" ? "No important emails" : "All caught up!"}
            </h3>
            <p className="text-sm text-gray-600">
              {activeTab === "important" 
                ? "No important emails at the moment." 
                : "No messages at the moment."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}