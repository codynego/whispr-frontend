"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Mail, Star, Trash2, Clock, Tag, Archive, Search, Filter, 
  ChevronLeft, ChevronRight, MessageCircle, Send, Linkedin, 
  Instagram, Phone, Slack, Facebook, Sparkles, TrendingUp
} from "lucide-react";

interface Account {
  id: string;
  name: string;
  channel: string;
  address: string;
  connected: boolean;
}

interface UnifiedMessage {
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
  channel: 'email' | 'whatsapp' | 'instagram' | 'linkedin' | 'telegram' | 'slack' | 'facebook' | 'internal';
  thread_id?: string;
}

const channelConfig = {
  email: { 
    icon: Mail, 
    label: 'Email',
    gradient: 'from-indigo-500 to-purple-600'
  },
  whatsapp: { 
    icon: MessageCircle, 
    label: 'WhatsApp',
    gradient: 'from-green-500 to-green-600'
  },
  instagram: { 
    icon: Instagram, 
    label: 'Instagram',
    gradient: 'from-pink-500 to-purple-600'
  },
  linkedin: { 
    icon: Linkedin, 
    label: 'LinkedIn',
    gradient: 'from-blue-500 to-blue-600'
  },
  telegram: { 
    icon: Send, 
    label: 'Telegram',
    gradient: 'from-blue-400 to-blue-500'
  },
  slack: { 
    icon: Slack, 
    label: 'Slack',
    gradient: 'from-red-500 to-purple-600'
  },
  facebook: { 
    icon: Facebook, 
    label: 'Facebook',
    gradient: 'from-blue-600 to-blue-700'
  },
  internal: { 
    icon: MessageCircle, 
    label: 'Internal',
    gradient: 'from-indigo-500 to-purple-600'
  }
};

export default function UnifiedInboxPage() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [accountFilter, setAccountFilter] = useState<string | null>(null);
  const [importanceFilter, setImportanceFilter] = useState<string | null>(null);
  const [readFilter, setReadFilter] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/unified/accounts/all/`, {
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
        setFilteredAccounts(accountsList);
      } catch (err) {
        console.error("Failed to fetch accounts", err);
      }
    };

    fetchAccounts();
  }, [accessToken]);

  // Filter accounts when channel changes
  useEffect(() => {
    if (channelFilter === "all") {
      setFilteredAccounts(accounts);
      setAccountFilter(null);
    } else {
      const filtered = accounts.filter(acc => acc.channel === channelFilter);
      setFilteredAccounts(filtered);
      setAccountFilter(null);
    }
  }, [channelFilter, accounts]);

  const fetchMessages = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/unified/messages/`;
      const params = new URLSearchParams();
      
      if (channelFilter !== "all") params.append('channel', channelFilter);
      if (accountFilter) {
        const numericId = accountFilter.split('-')[1];
        params.append('account', numericId);
      }
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
      const messagesList = Array.isArray(data) ? data : (data.results || data.messages || []);
      
      if (data.total_items) setTotalMessages(data.total_items);
      if (data.total_pages) setTotalPages(data.total_pages);
      
      const formattedMessages = messagesList.map((msg: any) => ({
        ...msg,
        account_id: msg.account_id || null,
        avatar: getInitials(msg.sender || msg.from_name || 'Unknown'),
        time: formatTime(msg.received_at || msg.date || msg.time || 'Unknown'),
        tag: msg.label || msg.tag || 'Personal',
        channel: msg.channel || 'email',
        important: msg.importance === 'high' || msg.important || false,
        is_read: msg.is_read || false,
        summary: msg.body || msg.preview || msg.body_preview || msg.snippet || msg.summary || msg.content || '',
        thread_id: msg.thread_id || null,
      }));
      setMessages(formattedMessages);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchMessages();
  }, [accessToken, channelFilter, accountFilter, importanceFilter, readFilter, searchQuery]);

  useEffect(() => {
    fetchMessages();
  }, [currentPage]);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const formatTime = (timeString: string): string => {
    try {
      const date = new Date(timeString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  const handleMessageClick = (id: number, channel: string) => {
    router.push(`/dashboard/inbox/messages/${channel}/${id}`);
  };

  const toggleImportant = (id: number): void => {
    setMessages(messages.map((msg: UnifiedMessage) => 
      msg.id === id ? { ...msg, important: !msg.important } : msg
    ));
  };

  const deleteMessage = (id: number): void => {
    setMessages(messages.filter((msg: UnifiedMessage) => msg.id !== id));
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
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

  const getChannelIcon = (channel: string) => {
    const config = channelConfig[channel as keyof typeof channelConfig] || channelConfig.internal;
    const IconComponent = config.icon;
    return <IconComponent className="w-3.5 h-3.5" />;
  };

  const getChannelDisplayIcon = (channel: string) => {
    const config = channelConfig[channel as keyof typeof channelConfig] || channelConfig.internal;
    const IconComponent = config.icon;
    return <IconComponent className="w-4 h-4" />;
  };

  // Get empty state message based on current filters
  const getEmptyStateMessage = () => {
    if (searchQuery.trim()) {
      return `No messages found for "${searchQuery}"${channelFilter !== "all" ? ` in ${channelConfig[channelFilter as keyof typeof channelConfig]?.label}` : ''}`;
    }
    
    if (activeTab === "important") {
      return `No important messages${channelFilter !== "all" ? ` in ${channelConfig[channelFilter as keyof typeof channelConfig]?.label}` : ''}`;
    }
    
    if (activeTab === "unread") {
      return `No unread messages${channelFilter !== "all" ? ` in ${channelConfig[channelFilter as keyof typeof channelConfig]?.label}` : ''}`;
    }
    
    if (channelFilter !== "all") {
      return `No messages in ${channelConfig[channelFilter as keyof typeof channelConfig]?.label}`;
    }
    
    return "No messages at the moment. Enjoy the peace!";
  };

  const getEmptyStateSubMessage = () => {
    if (searchQuery.trim()) {
      return "Try adjusting your search terms or filters";
    }
    
    if (channelFilter !== "all") {
      return "Messages from this channel will appear here when received";
    }
    
    return "All your messages from connected channels will appear here";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 border-4 border-indigo-100 rounded-2xl animate-pulse"></div>
            <div className="absolute inset-0 w-14 h-14 border-4 border-transparent border-t-indigo-600 rounded-2xl animate-spin"></div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">Loading messages</p>
            <p className="text-xs text-gray-500 mt-1">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  const tabLabel = activeTab === "important" ? "Important messages" : 
                   activeTab === "unread" ? "Unread messages" : "All messages";

  const channelLabel = channelFilter === "all" ? "all channels" : channelConfig[channelFilter as keyof typeof channelConfig]?.label.toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between gap-6 mb-8">
            <div className="flex items-start gap-5">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200/50 ring-4 ring-indigo-50">
                  <MessageCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1.5">
                  Unified Inbox
                </h1>
                <div className="flex items-center gap-3 text-sm">
                  <p className="text-gray-600">
                    <span className="font-semibold text-indigo-600">{messages.length}</span> of {totalMessages} {tabLabel.toLowerCase()}
                  </p>
                  {channelFilter !== "all" && (
                    <>
                      <span className="text-gray-300">•</span>
                      <p className="text-gray-500">from {channelLabel}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="px-4 py-2.5 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-gray-900">{messages.filter(m => !m.is_read).length}</span>
                  <span className="text-gray-500">unread</span>
                </div>
              </div>
              <div className="px-4 py-2.5 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-gray-900">{messages.filter(m => m.important).length}</span>
                  <span className="text-gray-500">important</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-200 shadow-sm w-fit">
            <button
              onClick={() => handleTabClick("all")}
              className={`relative px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                activeTab === "all"
                  ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              All Messages
              {activeTab === "all" && (
                <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
              )}
            </button>
            <button
              onClick={() => handleTabClick("important")}
              className={`relative px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                activeTab === "important"
                  ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              Important
            </button>
            <button
              onClick={() => handleTabClick("unread")}
              className={`relative px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                activeTab === "unread"
                  ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Unread
              {messages.filter(m => !m.is_read).length > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full ${
                  activeTab === "unread" 
                    ? "bg-white/20 text-white" 
                    : "bg-indigo-100 text-indigo-600"
                }`}>
                  {messages.filter(m => !m.is_read).length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Modern Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm hover:shadow-md"
            />
          </div>
          
          {/* Channel Filter */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
              {channelFilter === "all" ? (
                <MessageCircle className="w-4 h-4 text-gray-400" />
              ) : (
                getChannelDisplayIcon(channelFilter)
              )}
            </div>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-md"
            >
              <option value="all">All Channels</option>
              {Object.entries(channelConfig).map(([key, config]) => {
                const IconComponent = config.icon;
                return (
                  <option key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      {config.label}
                    </div>
                  </option>
                );
              })}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Account Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
            <select
              value={accountFilter === null ? "all" : accountFilter}
              onChange={(e) => {
                const val = e.target.value;
                setAccountFilter(val === "all" ? null : val);
              }}
              className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-md"
            >
              <option value="all">
                {channelFilter === "all" ? "All Accounts" : `All ${channelConfig[channelFilter as keyof typeof channelConfig]?.label} Accounts`}
              </option>
              {filteredAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.address})
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Message List - Ultra Modern Cards */}
        <div className="space-y-2">
          {messages.map((message: UnifiedMessage) => {
            const config = channelConfig[message.channel] || channelConfig.internal;
            return (
              <article
                key={`${message.channel}-${message.id}`}
                className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer hover:scale-[1.01] ${
                  !message.is_read 
                    ? 'border-indigo-200 bg-gradient-to-r from-indigo-50/50 to-purple-50/30 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50' 
                    : 'border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-xl'
                }`}
                onClick={() => handleMessageClick(message.id, message.channel)}
              >
                <div className="px-5 py-4">
                  <div className="flex gap-4 items-center">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className={`w-11 h-11 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-200/50 ring-2 ring-white`}>
                        {message.avatar}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex items-center gap-4">
                      {/* Channel Badge */}
                      <div className="flex-shrink-0 hidden lg:block">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                          {getChannelIcon(message.channel)}
                          <span className="text-xs font-semibold text-gray-700">
                            {config.label}
                          </span>
                        </div>
                      </div>

                      {/* Sender */}
                      <div className="w-40 flex-shrink-0">
                        <h3 className={`text-sm font-bold truncate ${
                          !message.is_read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {message.sender}
                        </h3>
                      </div>

                      {/* Subject & Summary */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${
                          !message.is_read ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          <span className={!message.is_read ? 'font-bold' : 'font-semibold'}>{message.subject}</span>
                          <span className="text-gray-500 font-normal ml-2">— {message.summary}</span>
                        </p>
                      </div>

                      {/* Tag */}
                      {message.tag && (
                        <div className="flex-shrink-0 hidden xl:block">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${
                            message.tag === "Work"
                              ? "bg-blue-50 text-blue-700 border border-blue-100"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          }`}>
                            <Tag className="w-3 h-3" />
                            {message.tag}
                          </span>
                        </div>
                      )}

                      {/* Time */}
                      <div className="flex-shrink-0 hidden sm:flex items-center gap-2 text-xs font-medium text-gray-500 w-28 justify-end">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{message.time.split(',')[0]}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleImportant(message.id); }}
                          className={`p-2 rounded-lg transition-all ${
                            message.important
                              ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                              : "text-gray-400 hover:text-amber-500 hover:bg-amber-50"
                          }`}
                          aria-label="Toggle important"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              message.important ? "fill-amber-500" : ""
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
                          onClick={(e) => { e.stopPropagation(); deleteMessage(message.id); }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Modern Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage > 3 ? currentPage - 2 + i : i + 1;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                      currentPage === pageNum
                        ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200/50"
                        : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm hover:shadow-md"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="px-3 py-2 text-sm font-semibold text-gray-400">...</span>
              )}
              {totalPages > 5 && (
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                    currentPage === totalPages
                      ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200/50"
                      : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm hover:shadow-md"
                  }`}
                >
                  {totalPages}
                </button>
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modern Empty State */}
        {messages.length === 0 && !loading && (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100/50">
              {channelFilter === "all" ? (
                <MessageCircle className="w-10 h-10 text-indigo-400" strokeWidth={2} />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  {getChannelDisplayIcon(channelFilter)}
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {getEmptyStateMessage()}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {getEmptyStateSubMessage()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}