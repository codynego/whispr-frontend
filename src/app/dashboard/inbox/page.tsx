"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Mail, Star, Trash2, Clock, Tag, Archive, Search, Filter, 
  ChevronLeft, ChevronRight, MessageCircle, Send, Linkedin, 
  Instagram, Slack, Facebook, Sparkles, TrendingUp
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
    gradient: 'from-blue-500 to-blue-600'
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
    gradient: 'from-red-500 to-red-600'
  },
  facebook: { 
    icon: Facebook, 
    label: 'Facebook',
    gradient: 'from-blue-600 to-blue-700'
  },
  internal: { 
    icon: MessageCircle, 
    label: 'Internal',
    gradient: 'from-blue-500 to-blue-600'
  }
};

const getStarClasses = (importance: string) => {
  switch (importance) {
    case 'low':
      return 'text-gray-400 bg-gray-50 hover:bg-gray-100';
    case 'medium':
      return 'text-amber-500 bg-amber-50 hover:bg-amber-100';
    case 'high':
      return 'text-red-500 bg-red-50 hover:bg-red-100';
    default:
      return 'text-blue-500 bg-blue-50 hover:bg-blue-100';
  }
};

const getImportanceBadgeClasses = (importance: string) => {
  switch (importance) {
    case 'low':
      return 'bg-yellow-100 text-yellow-700';
    case 'medium':
      return 'bg-orange-100 text-orange-700';
    case 'high':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-600';
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
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    return <IconComponent className="w-3.5 h-3.5" />;
  };

  const getChannelDisplayIcon = (channel: string) => {
    const config = channelConfig[channel as keyof typeof channelConfig] || channelConfig.internal;
    const IconComponent = config.icon;
    return <IconComponent className="w-4 h-4" />;
  };

  const getEmptyStateMessage = () => {
    if (searchQuery.trim()) {
      return `No conversations found for "${searchQuery}"${channelFilter !== "all" ? ` in ${channelConfig[channelFilter as keyof typeof channelConfig]?.label}` : ''}`;
    }
    
    if (importanceFilter) {
      return `No ${importanceFilter} importance conversations${channelFilter !== "all" ? ` in ${channelConfig[channelFilter as keyof typeof channelConfig]?.label}` : ''}`;
    }
    
    if (activeTab === "important") {
      return `No important conversations${channelFilter !== "all" ? ` in ${channelConfig[channelFilter as keyof typeof channelConfig]?.label}` : ''}`;
    }
    
    if (activeTab === "unread") {
      return `No unread conversations${channelFilter !== "all" ? ` in ${channelConfig[channelFilter as keyof typeof channelConfig]?.label}` : ''}`;
    }
    
    if (channelFilter !== "all") {
      return `No conversations in ${channelConfig[channelFilter as keyof typeof channelConfig]?.label}`;
    }
    
    return "No conversations at the moment. Enjoy the peace!";
  };

  const getEmptyStateSubMessage = () => {
    if (searchQuery.trim()) {
      return "Try adjusting your search terms or filters";
    }
    
    if (importanceFilter) {
      return "Conversations of this importance level will appear here when started";
    }
    
    if (channelFilter !== "all") {
      return "Conversations from this channel will appear here when started";
    }
    
    return "All your conversations from connected channels will appear here";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 border-4 border-blue-100 rounded-2xl animate-pulse"></div>
            <div className="absolute inset-0 w-14 h-14 border-4 border-transparent border-t-blue-600 rounded-2xl animate-spin"></div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">Loading conversations</p>
            <p className="text-xs text-gray-500 mt-1">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  const tabLabel = activeTab === "important" ? "Important conversations" : 
                   activeTab === "unread" ? "Unread conversations" : "All conversations";

  const channelLabel = channelFilter === "all" ? "all channels" : channelConfig[channelFilter as keyof typeof channelConfig]?.label.toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between gap-6 mb-8">
            <div className="flex items-start gap-5">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200/50 ring-4 ring-blue-50">
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
                    <span className="font-semibold text-blue-600">{conversations.length}</span> of {totalConversations} {tabLabel.toLowerCase()}
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
                  <span className="font-semibold text-gray-900">{conversations.filter(c => !c.is_read).length}</span>
                  <span className="text-gray-500">unread</span>
                </div>
              </div>
              <div className="px-4 py-2.5 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-900">{conversations.filter(c => c.important === 'high').length}</span>
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
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              All Conversations
              {activeTab === "all" && (
                <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
              )}
            </button>
            <button
              onClick={() => handleTabClick("important")}
              className={`relative px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                activeTab === "important"
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/50"
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
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Unread
              {conversations.filter(c => !c.is_read).length > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full ${
                  activeTab === "unread" 
                    ? "bg-white/20 text-white" 
                    : "bg-blue-100 text-blue-600"
                }`}>
                  {conversations.filter(c => !c.is_read).length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Modern Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm hover:shadow-md"
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
              className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-md"
            >
              <option value="all">All Channels</option>
              {Object.entries(channelConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
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
              className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-md"
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

          {/* Importance Filter */}
          <div className="relative">
            <Star className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
            <select
              value={importanceFilter || "all"}
              onChange={(e) => setImportanceFilter(e.target.value === "all" ? null : e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-md"
            >
              <option value="all">All Importance</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Conversation List - Compact Modern Cards */}
        <div className="space-y-1.5">
          {conversations.map((conversation: UnifiedConversation) => {
            const config = channelConfig[conversation.channel] || channelConfig.internal;
            return (
              <article
                key={conversation.id}
                className={`group bg-white rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer hover:shadow-lg ${
                  !conversation.is_read 
                    ? 'border-blue-200 bg-blue-50/30 hover:border-blue-300 hover:shadow-blue-100/50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${conversation.is_archived ? 'opacity-60' : ''}`}
                onClick={() => handleConversationClick(conversation.id)}
              >
                <div className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    {/* Unread Indicator */}
                    {!conversation.is_read && !conversation.is_archived && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></div>
                    )}

                    {/* Avatar with Channel Indicator */}
                    <div className="flex-shrink-0 relative">
                      <div className={`w-9 h-9 bg-gradient-to-br ${config.gradient} rounded-lg flex items-center justify-center text-white font-semibold text-xs shadow-sm`}>
                        {conversation.avatar}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-md flex items-center justify-center border border-gray-200">
                        {getChannelIcon(conversation.channel)}
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 grid grid-cols-12 gap-3 items-center">
                      {/* Sender - 2 columns */}
                      <div className="col-span-12 sm:col-span-2 min-w-0">
                        <h3 className={`text-sm truncate ${
                          !conversation.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'
                        }`}>
                          {conversation.sender}
                        </h3>
                      </div>

                      {/* Subject & Preview - 6 columns */}
                      <div className="col-span-12 sm:col-span-6 min-w-0 flex items-center gap-2">
                        <span className={`text-sm truncate ${!conversation.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>
                          {conversation.subject}
                        </span>
                        <span className="hidden lg:inline text-sm truncate text-gray-500">
                          — {conversation.summary}
                        </span>
                      </div>

                      {/* Metadata - 4 columns */}
                      <div className="col-span-12 sm:col-span-4 flex items-center justify-end gap-2">
                        {/* Messages Count */}
                        <span className="hidden md:inline text-xs font-medium text-gray-500 whitespace-nowrap">
                          {conversation.messages_count} msgs
                        </span>

                        {/* Importance Badge */}
                        <span className={`hidden xl:inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${getImportanceBadgeClasses(conversation.important)}`}>
                          {conversation.important.charAt(0).toUpperCase() + conversation.important.slice(1)}
                        </span>

                        {/* Time */}
                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                          {conversation.time.split(',')[0]}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); cycleConversationImportance(conversation.id); }}
                            className={`p-1.5 rounded-md transition-all ${getStarClasses(conversation.important)}`}
                            aria-label="Cycle importance"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${conversation.important === 'high' ? 'fill-current' : ''}`}
                            />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                            aria-label="Archive"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteConversation(conversation.id); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/50"
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
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/50"
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
        {conversations.length === 0 && !loading && (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-100/50">
              {channelFilter === "all" ? (
                <MessageCircle className="w-10 h-10 text-blue-400" strokeWidth={2} />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
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