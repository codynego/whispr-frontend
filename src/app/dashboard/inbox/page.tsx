"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Mail, Star, Trash2, Archive, Search, 
  ChevronLeft, ChevronRight, MessageCircle, Send, Linkedin, 
  Instagram, Slack, Facebook, X, Circle
} from "lucide-react";

interface Account {
  id: string;
  name: string;
  channel: string;
  address: string;
  connected: boolean;
}

interface UnifiedConversation {
  id: number;
  account_id?: number;
  sender: string;
  avatar: string;
  subject: string;
  summary: string;
  tag: string;
  important: 'low' | 'medium' | 'high';
  is_read: boolean;
  time: string;
  channel: 'email' | 'whatsapp' | 'instagram' | 'linkedin' | 'telegram' | 'slack' | 'facebook' | 'internal';
  thread_id?: string;
  is_incoming?: boolean;
  messages_count: number;
  next_step_suggestion?: string;
  is_archived: boolean;
}

const channelConfig = {
  email: { 
    icon: Mail, 
    label: 'Email',
    gradient: 'from-blue-500 to-blue-600',
    color: 'text-blue-600'
  },
  whatsapp: { 
    icon: MessageCircle, 
    label: 'WhatsApp',
    gradient: 'from-emerald-500 to-emerald-600',
    color: 'text-emerald-600'
  },
  instagram: { 
    icon: Instagram, 
    label: 'Instagram',
    gradient: 'from-pink-500 to-purple-600',
    color: 'text-pink-600'
  },
  linkedin: { 
    icon: Linkedin, 
    label: 'LinkedIn',
    gradient: 'from-blue-500 to-blue-600',
    color: 'text-blue-600'
  },
  telegram: { 
    icon: Send, 
    label: 'Telegram',
    gradient: 'from-sky-400 to-sky-500',
    color: 'text-sky-600'
  },
  slack: { 
    icon: Slack, 
    label: 'Slack',
    gradient: 'from-violet-500 to-violet-600',
    color: 'text-violet-600'
  },
  facebook: { 
    icon: Facebook, 
    label: 'Facebook',
    gradient: 'from-blue-600 to-blue-700',
    color: 'text-blue-600'
  },
  internal: { 
    icon: MessageCircle, 
    label: 'Internal',
    gradient: 'from-slate-500 to-slate-600',
    color: 'text-slate-600'
  }
};

const getStarClasses = (importance: string) => {
  switch (importance) {
    case 'low':
      return 'text-slate-400 hover:text-slate-600 hover:bg-slate-50';
    case 'medium':
      return 'text-amber-500 hover:text-amber-600 hover:bg-amber-50';
    case 'high':
      return 'text-red-500 hover:text-red-600 hover:bg-red-50';
    default:
      return 'text-slate-400 hover:text-blue-600 hover:bg-blue-50';
  }
};

const cycleImportance = (current: string): 'low' | 'medium' | 'high' => {
  const levels = ['low', 'medium', 'high'] as const;
  const index = levels.indexOf(current as any);
  return levels[(index + 1) % levels.length];
};

export default function UnifiedInboxPage() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<UnifiedConversation[]>([]);
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
  const [totalConversations, setTotalConversations] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/unified/accounts/`, {
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
        const mappedAccounts = accountsList.map((acc: any) => ({
          id: acc.id.toString(),
          name: acc.address_or_id || acc.provider || 'Account',
          channel: acc.channel,
          address: acc.address_or_id,
          connected: acc.is_active
        }));
        setAccounts(mappedAccounts);
        setFilteredAccounts(mappedAccounts);
      } catch (err) {
        console.error("Failed to fetch accounts", err);
      }
    };

    fetchAccounts();
  }, [accessToken]);

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

  const fetchConversations = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/unified/conversations/`;
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
      const conversationsList = Array.isArray(data) ? data : (data.results || data.conversations || []);

      if (data.total_items) setTotalConversations(data.total_items);
      if (data.total_pages) setTotalPages(data.total_pages);
      
      const formattedConversations = conversationsList.map((conv: any) => ({
        ...conv,
        account_id: conv.account?.id || null,
        avatar: getInitials(conv.last_sender || 'Unknown'),
        time: formatTime(conv.last_message_at),
        tag: conv.label || 'Personal',
        channel: conv.channel || 'email',
        important: conv.importance || 'low',
        is_read: conv.is_read || false,
        summary: conv.summary || (conv.last_message ? (conv.last_message.content || '').substring(0, 100) + (conv.last_message.content && conv.last_message.content.length > 100 ? '...' : '') : ''),
        thread_id: conv.thread_id,
        subject: conv.title || '(No Subject)',
        messages_count: conv.messages_count || 0,
        next_step_suggestion: conv.next_step_suggestion,
        is_archived: conv.is_archived || false,
      }));
      setConversations(formattedConversations);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchConversations();
  }, [accessToken, channelFilter, accountFilter, importanceFilter, readFilter, searchQuery]);

  useEffect(() => {
    fetchConversations();
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
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (diffHours < 24) {
        if (diffHours < 1) {
          const mins = Math.floor(diffMs / (1000 * 60));
          return mins < 1 ? 'Just now' : `${mins}m ago`;
        }
        return `${Math.floor(diffHours)}h ago`;
      }

      if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
      }

      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return timeString;
    }
  };

  const handleConversationClick = (id: number) => {
    router.push(`/dashboard/inbox/conversations/${id}`);
  };

  const cycleConversationImportance = (id: number): void => {
    setConversations(conversations.map((conv: UnifiedConversation) => 
      conv.id === id ? { ...conv, important: cycleImportance(conv.important) } : conv
    ));
  };

  const deleteConversation = (id: number): void => {
    setConversations(conversations.filter((conv: UnifiedConversation) => conv.id !== id));
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
    return <IconComponent className="w-3 h-3" />;
  };

  const getChannelDisplayIcon = (channel: string) => {
    const config = channelConfig[channel as keyof typeof channelConfig] || channelConfig.internal;
    const IconComponent = config.icon;
    return <IconComponent className="w-4 h-4 text-white" />;
  };

  const getEmptyStateMessage = () => {
    if (searchQuery.trim()) {
      return `No conversations found for "${searchQuery}"`;
    }
    
    if (activeTab === "important") {
      return "No important conversations";
    }
    
    if (activeTab === "unread") {
      return "All caught up!";
    }
    
    if (channelFilter !== "all") {
      return `No conversations in ${channelConfig[channelFilter as keyof typeof channelConfig]?.label}`;
    }
    
    return "No conversations yet";
  };

  const getEmptyStateSubMessage = () => {
    if (searchQuery.trim()) {
      return "Try different search terms or adjust your filters";
    }
    
    if (activeTab === "unread") {
      return "You've read all your conversations";
    }
    
    return "Conversations from connected channels will appear here";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="text-sm font-medium text-slate-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  const unreadCount = conversations.filter(c => !c.is_read).length;
  const importantCount = conversations.filter(c => c.important === 'high').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/50">
                  <Mail className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">
                  Unified Inbox
                </h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm">
                  <p className="text-slate-600">
                    <span className="font-semibold text-blue-600">{conversations.length}</span> of <span className="font-semibold">{totalConversations}</span> conversations
                  </p>
                  {channelFilter !== "all" && (
                    <>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${channelConfig[channelFilter as keyof typeof channelConfig]?.gradient}`}></div>
                        <span className="text-slate-600">{channelConfig[channelFilter as keyof typeof channelConfig]?.label}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
              <div className="px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Circle className="w-4 h-4 text-blue-600 fill-current" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">{unreadCount}</div>
                    <div className="text-xs text-slate-500">Unread</div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">{importantCount}</div>
                    <div className="text-xs text-slate-500">Important</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm w-fit overflow-x-auto">
            <button
              onClick={() => handleTabClick("all")}
              className={`px-4 md:px-6 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleTabClick("important")}
              className={`px-4 md:px-6 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "important"
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              Important
              {importantCount > 0 && activeTab !== "important" && (
                <span className="px-1.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-600 rounded-full">
                  {importantCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabClick("unread")}
              className={`px-4 md:px-6 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "unread"
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className={`px-1.5 py-0.5 text-xs font-bold rounded-full ${
                  activeTab === "unread" 
                    ? "bg-white/20 text-white" 
                    : "bg-blue-100 text-blue-600"
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          {/* Channel Filter */}
          <div className="relative">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer shadow-sm"
            >
              <option value="all">All Channels</option>
              {Object.entries(channelConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Account Filter */}
          <div className="relative">
            <select
              value={accountFilter === null ? "all" : accountFilter}
              onChange={(e) => {
                const val = e.target.value;
                setAccountFilter(val === "all" ? null : val);
              }}
              className="w-full pl-4 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer shadow-sm"
            >
              <option value="all">All Accounts</option>
              {filteredAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Importance Filter */}
          <div className="relative">
            <select
              value={importanceFilter || "all"}
              onChange={(e) => setImportanceFilter(e.target.value === "all" ? null : e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer shadow-sm"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Conversations */}
        <div className="space-y-2">
          {conversations.map((conversation: UnifiedConversation) => {
            const config = channelConfig[conversation.channel] || channelConfig.internal;
            const IconComponent = config.icon;
            
            return (
              <article
                key={conversation.id}
                className={`group relative bg-white rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-lg overflow-hidden ${
                  !conversation.is_read 
                    ? 'border-blue-200 bg-blue-50/30 hover:border-blue-400' 
                    : 'border-slate-200 hover:border-slate-300'
                } ${conversation.is_archived ? 'opacity-50' : ''}`}
                onClick={() => handleConversationClick(conversation.id)}
              >
                <div className="px-4 md:px-5 py-3.5">
                  <div className="flex items-center gap-3 md:gap-4">
                    {/* Unread indicator */}
                    {!conversation.is_read && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 animate-pulse"></div>
                    )}

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-11 h-11 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                        {conversation.avatar}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-lg flex items-center justify-center border-2 border-white shadow-md">
                        <IconComponent className={`w-3 h-3 ${config.color}`} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-sm md:text-base truncate ${
                              !conversation.is_read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                            }`}>
                              {conversation.sender}
                            </h3>
                            {conversation.important === 'high' && (
                              <Star className="w-4 h-4 text-red-500 fill-current flex-shrink-0" />
                            )}
                          </div>
                          <p className={`text-sm md:text-base truncate mb-1 ${
                            !conversation.is_read ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'
                          }`}>
                            {conversation.subject}
                          </p>
                          <p className="text-sm text-slate-500 truncate">
                            {conversation.summary}
                          </p>
                        </div>

                        {/* Right column */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                            {conversation.time}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-md">
                              {conversation.messages_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          cycleConversationImportance(conversation.id); 
                        }}
                        className={`p-2 rounded-lg transition-all ${getStarClasses(conversation.important)}`}
                        title="Toggle importance"
                      >
                        <Star className={`w-4 h-4 ${conversation.important === 'high' ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteConversation(conversation.id); }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
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
                        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/50"
                        : "text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm hover:shadow-md"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="px-3 py-2 text-sm font-semibold text-slate-400">...</span>
              )}
              {totalPages > 5 && (
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                    currentPage === totalPages
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/50"
                      : "text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm hover:shadow-md"
                  }`}
                >
                  {totalPages}
                </button>
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Empty State */}
        {conversations.length === 0 && !loading && (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center">
              {channelFilter === "all" ? (
                <MessageCircle className="w-10 h-10 text-slate-400" />
              ) : (
                <div className={`w-12 h-12 bg-gradient-to-br ${channelConfig[channelFilter as keyof typeof channelConfig]?.gradient} rounded-2xl flex items-center justify-center`}>
                  {getChannelDisplayIcon(channelFilter)}
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              {getEmptyStateMessage()}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {getEmptyStateSubMessage()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}