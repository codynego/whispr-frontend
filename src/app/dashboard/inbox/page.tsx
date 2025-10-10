"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Mail, Star, Trash2, Clock, Tag, Archive, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

interface EmailAccount {
  id: number;
  provider: string;
  email_address: string;
  is_active: boolean;
  last_synced?: string;
  created_at?: string;
  updated_at?: string;
}

interface Email {
  id: number;
  account_id?: number;
  sender: string;
  avatar: string;
  subject: string;
  summary: string;
  tag: string;
  important: boolean;
  is_read: boolean;
  time: string;
}

export default function InboxPage() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [emails, setEmails] = useState<Email[]>([]);
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [accountFilter, setAccountFilter] = useState<number | null>(null);
  const [importanceFilter, setImportanceFilter] = useState<string | null>(null);
  const [readFilter, setReadFilter] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmails, setTotalEmails] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/emails/accounts/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.status === 401) {
          console.error("Unauthorized: token invalid or expired");
          return;
        }

        const data = await res.json();
        const accountsList = Array.isArray(data) ? data : (data.results || []);
        setAccounts(accountsList);
      } catch (err) {
        console.error("Failed to fetch accounts", err);
      }
    };

    fetchAccounts();
  }, [accessToken]);

  const fetchEmails = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/emails/messages/`;
      const params = new URLSearchParams();
      if (accountFilter) params.append('account', accountFilter.toString());
      if (importanceFilter) params.append('importance', importanceFilter);
      if (readFilter !== null) params.append('is_read', readFilter.toString());
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('page', currentPage.toString());
      params.append('page_size', itemsPerPage.toString());
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, {
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
      const emailsList = Array.isArray(data) ? data : (data.results || data.emails || []);
      
      // Set pagination data
      if (data.count) setTotalEmails(data.count);
      if (data.count) setTotalPages(Math.ceil(data.count / itemsPerPage));
      
      const formattedEmails = emailsList.map((email: any) => ({
        ...email,
        account_id: email.account_id || null,
        avatar: getInitials(email.sender || email.from_name || 'Unknown'),
        time: email.date || email.received_at || email.time || 'Unknown',
        tag: email.label || email.tag || 'Personal',
        important: email.importance === 'high' || email.importance_score > 0.5 || email.is_important || email.important || email.is_starred || false,
        is_read: email.is_read || false,
        summary: email.preview || email.body_preview || email.snippet || email.summary || '',
      }));
      setEmails(formattedEmails);
    } catch (err) {
      console.error("Failed to fetch emails", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchEmails();
  }, [accessToken, accountFilter, importanceFilter, readFilter, searchQuery]);

  useEffect(() => {
    fetchEmails();
  }, [currentPage]);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const displayedEmails = emails;

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

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
    if (tab === "all") {
      setImportanceFilter(null);
      setReadFilter(null);
    } else if (tab === "important") {
      setImportanceFilter('high');
      setReadFilter(null);
    } else if (tab === "unread") {
      setImportanceFilter(null);
      setReadFilter(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 font-medium">Loading emails...</p>
        </div>
      </div>
    );
  }

  const tabLabel = activeTab === "important" ? "Important emails" : 
                   activeTab === "unread" ? "Unread messages" : "All messages";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Inbox
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {emails.length} of {totalEmails} {tabLabel.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs - Modern pill style */}
          <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-gray-200 shadow-sm w-fit">
            <button
              onClick={() => handleTabClick("all")}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === "all"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              All Messages
            </button>
            <button
              onClick={() => handleTabClick("important")}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === "important"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Important
            </button>
            <button
              onClick={() => handleTabClick("unread")}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === "unread"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Unread
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="flex gap-3 mb-6 items-center flex-wrap">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={accountFilter === null ? "all" : accountFilter.toString()}
              onChange={(e) => {
                const val = e.target.value;
                setAccountFilter(val === "all" ? null : parseInt(val));
              }}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all appearance-none cursor-pointer min-w-[200px]"
            >
              <option value="all">All Accounts</option>
              {accounts
                .filter((acc) => acc.is_active)
                .map((acc) => (
                  <option key={acc.id} value={acc.id.toString()}>
                    {acc.email_address}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Email List - Compact cards */}
        <div className="space-y-1.5">
          {displayedEmails.map((email: Email) => (
            <article
              key={email.id}
              className={`group bg-white rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer ${
                !email.is_read 
                  ? 'border-indigo-200 bg-indigo-50/30 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/50' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => handleEmailClick(email.id)}
            >
              <div className="px-4 py-3">
                <div className="flex gap-3 items-center">
                  {/* Avatar - Smaller */}
                  <div className="flex-shrink-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                      {email.avatar}
                    </div>
                  </div>

                  {/* Content - Single line layout */}
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    {/* Sender */}
                    <div className="w-40 flex-shrink-0">
                      <h3 className={`text-sm font-semibold truncate ${
                        !email.is_read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {email.sender}
                      </h3>
                    </div>

                    {/* Subject & Summary */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${
                        !email.is_read ? 'text-gray-900 font-medium' : 'text-gray-600'
                      }`}>
                        <span className="font-semibold">{email.subject}</span>
                        <span className="text-gray-500 ml-2">— {email.summary}</span>
                      </p>
                    </div>

                    {/* Tag */}
                    <div className="flex-shrink-0 hidden lg:block">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md ${
                          email.tag === "Work"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        {email.tag}
                      </span>
                    </div>

                    {/* Time */}
                    <div className="flex-shrink-0 hidden sm:flex items-center gap-1.5 text-xs text-gray-500 w-32 justify-end">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{email.time.split(',')[0]}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleImportant(email.id); }}
                        className={`p-1.5 rounded-lg transition-colors ${
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
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        aria-label="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteEmail(email.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 px-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage > 3 ? currentPage - 2 + i : i + 1;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="px-3 py-2 text-sm text-gray-500">...</span>
              )}
              {totalPages > 5 && (
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {totalPages}
                </button>
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Empty State */}
        {displayedEmails.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Mail className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === "important" ? "No important emails" : 
               activeTab === "unread" ? "No unread emails" : "All caught up!"}
            </h3>
            <p className="text-sm text-gray-500">
              {activeTab === "important" 
                ? "No important emails at the moment." 
                : activeTab === "unread"
                ? "You're all caught up on unread messages."
                : "No messages at the moment."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}