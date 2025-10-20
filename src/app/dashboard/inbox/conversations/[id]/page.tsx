"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowLeft, 
  Mail, 
  User, 
  Loader2, 
  Star, 
  Tag,
  CheckCircle,
  Brain,
  Calendar,
  MessageSquare,
  Users,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Send,
  Clock,
  Zap,
  FileText,
  Download,
  Link2,
  ChevronRight,
  MapPin,
  Building2,
  Phone,
  UserPlus,
  MoreVertical,
  X
} from "lucide-react";

interface Attachment {
  name: string;
  url: string;
  type: string;
  size?: string;
}

interface Message {
  id: string;
  sender: string;
  sender_name?: string;
  sent_at: string;
  content?: string;
  recipients?: string;
  attachments?: Attachment[];
  channel?: string;
  external_id?: string;
  metadata?: any;
  importance?: string;
  importance_score?: number;
  is_read?: boolean;
  is_starred?: boolean;
  is_incoming?: boolean;
  subject?: string;
  html_body?: string;
}

interface Conversation {
  id: number;
  title: string;
  summary?: string;
  messages_count?: number;
  next_step_suggestion?: string;
  actionable_data?: any;
  people_and_orgs?: Array<{ name: string; role: string }>;
  channel?: string;
  last_message_at?: string;
  last_sender?: string;
  messages: Message[];
  is_starred?: boolean;
}

export default function ConversationDetailPanel({ onClose }: { onClose?: () => void }) {
  const { id } = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [expandedMessages, setExpandedMessages] = useState(new Set<string>());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [tone, setTone] = useState<"formal" | "friendly" | "concise">("friendly");
  const [showSmartReplies, setShowSmartReplies] = useState(true);
  const [showActions, setShowActions] = useState(false);

  const getChannelSource = (channel?: string) => {
    const channelMap: Record<string, { icon: string; label: string; color: string }> = {
      email: { icon: "📧", label: "Email", color: "bg-red-50 text-red-700 border-red-200" },
      gmail: { icon: "📧", label: "Gmail", color: "bg-red-50 text-red-700 border-red-200" },
      whatsapp: { icon: "💬", label: "WhatsApp", color: "bg-green-50 text-green-700 border-green-200" },
      slack: { icon: "🏢", label: "Slack", color: "bg-purple-50 text-purple-700 border-purple-200" }
    };
    return channelMap[channel || 'email'] || channelMap.email;
  };

  const truncateContent = (html: string, maxLen: number = 150): string => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      if (diffInHours < 24) {
        if (diffInHours < 1) {
          const mins = Math.floor(diffInMs / (1000 * 60));
          return mins < 1 ? "Just now" : `${mins} min${mins !== 1 ? 's' : ''} ago`;
        }
        const hours = Math.floor(diffInHours);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      }

      if (diffInDays < 7) {
        return date.toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true 
        });
      }

      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return dateString;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleExpand = (msgId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(msgId)) {
        newSet.delete(msgId);
      } else {
        newSet.add(msgId);
      }
      return newSet;
    });
  };

  const smartReplies = [
    "Sure, I'll get back to you by tomorrow.",
    "Yes, that works perfectly.",
    "Thanks for the update—let me review and respond soon."
  ];

  useEffect(() => {
    if (!accessToken || !id) return;

    const fetchConversation = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/unified/conversations/${id}/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch conversation: ${res.statusText}`);
        const data = await res.json();
        const sortedMessages = (data.messages || []).sort((a: Message, b: Message) => 
          new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
        );
        setConversation({ ...data, messages: sortedMessages });
        setIsStarred(data.is_starred || false);
      } catch (error) {
        console.error("Error fetching conversation:", error);
        setError(error instanceof Error ? error.message : "Failed to load conversation");
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [id, accessToken]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-white p-4 sm:p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Conversation not found</h2>
          <p className="text-slate-600">
            {error || "The conversation you're looking for doesn't exist or has been removed."}
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Go back
            </button>
          )}
        </div>
      </div>
    );
  }

  const sourceBadge = getChannelSource(conversation.channel);
  const subject = conversation.title || "(No subject)";

  const getParticipants = () => {
    const senders = [...new Set(conversation.messages.map(m => m.sender_name || m.sender))];
    return senders.join(', ');
  };

  const messageCount = conversation.messages_count || conversation.messages.length;

  return (
    <div className="flex h-full bg-slate-50 relative">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {/* 1️⃣ Header Bar */}
        <div className="border-b border-slate-200 bg-white flex-shrink-0">
          <div className="px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm font-semibold text-blue-700">
                      {getInitials(conversation.last_sender || getParticipants())}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm sm:text-base truncate">{conversation.last_sender || getParticipants()}</p>
                    <div className="group relative inline-block">
                      <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-full border text-xs font-medium ${sourceBadge.color}`}>
                        <span>{sourceBadge.icon}</span>
                        <span className="hidden sm:inline">{sourceBadge.label}</span>
                      </span>
                      <span className="absolute left-0 top-full mt-1 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        via {sourceBadge.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions - Desktop */}
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={() => setIsStarred(!isStarred)}
                  className={`p-2 rounded-lg transition-colors ${
                    isStarred 
                      ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Star"
                >
                  <Star className={`w-5 h-5 ${isStarred ? 'fill-current' : ''}`} />
                </button>
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Add label">
                  <Tag className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Mark done">
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Summarize">
                  <Brain className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Add to task">
                  <Calendar className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Actions Menu */}
              <div className="lg:hidden relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {showActions && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowActions(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30">
                      <button
                        onClick={() => {
                          setIsStarred(!isStarred);
                          setShowActions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Star className="w-4 h-4" />
                        {isStarred ? 'Unstar' : 'Star'}
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Add label
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Mark done
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Summarize
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Add to task
                      </button>
                      <button
                        onClick={() => {
                          setInsightsOpen(true);
                          setShowActions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 lg:hidden"
                      >
                        <Zap className="w-4 h-4" />
                        AI Insights
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Subject */}
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3 break-words">
              {subject}
            </h1>

            {/* Conversation info with collapsible details */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
                <span className="text-slate-600 truncate">
                  {messageCount} messages in thread
                </span>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="ml-1 p-1 text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0"
                >
                  {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 flex-shrink-0">
                {formatDate(conversation.last_message_at || conversation.messages[conversation.messages.length - 1]?.sent_at || "")}
              </p>
            </div>

            {/* Expanded details */}
            {showDetails && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg space-y-2 text-xs sm:text-sm border border-slate-200">
                <div className="grid grid-cols-[60px_1fr] sm:grid-cols-[80px_1fr] gap-2">
                  <span className="text-slate-600 font-medium">Participants:</span>
                  <span className="text-slate-900 break-all">{getParticipants()}</span>
                </div>
                <div className="grid grid-cols-[60px_1fr] sm:grid-cols-[80px_1fr] gap-2">
                  <span className="text-slate-600 font-medium">Channel:</span>
                  <span className="text-slate-900">{sourceBadge.label}</span>
                </div>
                <div className="grid grid-cols-[60px_1fr] sm:grid-cols-[80px_1fr] gap-2">
                  <span className="text-slate-600 font-medium">Last Message:</span>
                  <span className="text-slate-900">
                    {new Date(conversation.last_message_at || conversation.messages[conversation.messages.length - 1]?.sent_at || "").toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2️⃣ Conversation Thread */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-3 sm:px-6 py-4 sm:py-6">
            <div className="space-y-6">
              {conversation.messages.map((msg) => {
                const isIncoming = msg.is_incoming !== false;
                const isExpanded = expandedMessages.has(msg.id);
                const isEmail = msg.channel === 'email' || msg.channel === 'gmail';
                const fullContent = isEmail ? (msg.html_body || msg.metadata?.html_body || msg.content || "") : (msg.content || "");
                const previewText = truncateContent(fullContent, 150);
                const hasAttachments = msg.attachments && msg.attachments.length > 0;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isIncoming ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2 duration-200 cursor-pointer hover:bg-slate-50/50 rounded-lg p-2`}
                    onClick={() => router.push(`/dashboard/inbox/messages/${msg.id}`)}
                  >
                    <div className={`max-w-md flex flex-col ${isIncoming ? 'items-start' : 'items-end'} space-y-2`}>
                      <div className={`px-4 py-3 rounded-2xl ${isIncoming ? 'bg-slate-100' : 'bg-blue-600 text-white'} relative w-full`}>
                        <div className={`prose prose-sm max-w-none break-words ${isIncoming ? 'prose-slate' : 'prose-invert'} prose-p:leading-relaxed prose-headings:font-semibold prose-a:no-underline hover:prose-a:underline`}>
                          {isExpanded ? (
                            isEmail ? (
                              <div dangerouslySetInnerHTML={{ __html: fullContent }} />
                            ) : (
                              <div className="whitespace-pre-wrap">{fullContent}</div>
                            )
                          ) : (
                            <p>{previewText}</p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(msg.id);
                          }}
                          className={`absolute top-2 ${isIncoming ? 'right-2' : 'left-2'} p-1 rounded-full ${isIncoming ? 'bg-slate-200 hover:bg-slate-300' : 'bg-blue-500 hover:bg-blue-400'} text-white`}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                      {hasAttachments && (
                        <div className={`flex gap-2 ${isIncoming ? 'justify-start pl-4' : 'justify-end pr-4'}`}>
                          {msg.attachments!.slice(0, 2).map((att, idx) => (
                            <div key={idx} className="flex items-center gap-1 p-1.5 bg-slate-50 rounded text-xs border">
                              <FileText className="w-3 h-3 text-slate-500" />
                              <span className="truncate max-w-32">{att.name}</span>
                              <a
                                href={att.url}
                                download
                                onClick={(e) => e.stopPropagation()}
                                className="ml-auto p-0.5 text-blue-600 hover:text-blue-700"
                              >
                                <Download className="w-3 h-3" />
                              </a>
                            </div>
                          ))}
                          {msg.attachments!.length > 2 && (
                            <div className="p-1.5 bg-slate-50 rounded text-xs border flex items-center gap-1">
                              <Paperclip className="w-3 h-3 text-slate-500" />
                              +{msg.attachments!.length - 2}
                            </div>
                          )}
                        </div>
                      )}
                      <div className={`text-xs ${isIncoming ? 'text-left' : 'text-right'} text-slate-500 self-${isIncoming ? 'start' : 'end'}`}>
                        <span>{getInitials(msg.sender_name || msg.sender)}</span>
                        <span className="ml-1">•</span>
                        <span>{formatDate(msg.sent_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4️⃣ Reply Composer */}
        <div className="border-t border-slate-200 bg-white flex-shrink-0">
          <div className="px-3 sm:px-6 py-3 sm:py-4 space-y-3">
            {/* Smart Replies */}
            {showSmartReplies && (
              <div className="flex flex-wrap gap-2 overflow-x-auto">
                {smartReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setReplyText(reply);
                      setShowSmartReplies(false);
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm rounded-full font-medium transition-colors border border-blue-200 whitespace-nowrap flex-shrink-0"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            <div className="space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={() => setShowSmartReplies(false)}
                placeholder="Type your reply..."
                className="w-full min-h-[60px] sm:min-h-[80px] max-h-32 sm:max-h-48 resize-none bg-slate-50 border border-slate-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Attach file">
                    <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Schedule send">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Polish with AI">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="formal">Formal</option>
                    <option value="friendly">Friendly</option>
                    <option value="concise">Concise</option>
                  </select>
                </div>
                <button className="px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium text-sm flex-shrink-0">
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3️⃣ AI Insights Panel - Desktop Sidebar */}
      <div className={`hidden lg:block border-l border-slate-200 bg-white transition-all duration-300 ${insightsOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
        {insightsOpen && (
          <div className="h-full flex flex-col w-80">
            <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                AI Insights
              </h3>
              <button onClick={() => setInsightsOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Summary */}
              <div className="space-y-2">
                <h4 className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Summary
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {conversation.summary || "This thread is about rescheduling a shoot for next week."}
                </p>
              </div>

              {/* Next Step */}
              <div className="space-y-2">
                <h4 className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-blue-600" />
                  Next Step Suggestion
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {conversation.next_step_suggestion || "You might want to confirm new date availability."}
                </p>
              </div>

              {/* Actionable Data */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Actionable Data
                </h4>
                <div className="space-y-2">
                  {conversation.actionable_data ? (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900">{conversation.actionable_data.date || "Oct 25, 2 PM"}</p>
                          <p className="text-blue-700">{conversation.actionable_data.location || "Studio A"}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* People & Organizations */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  People & Organizations
                </h4>
                <div className="space-y-2">
                  {conversation.people_and_orgs && conversation.people_and_orgs.length > 0 ? (
                    conversation.people_and_orgs.map((person, idx) => (
                      <button key={idx} className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors text-left">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{person.name}</p>
                            <p className="text-xs text-slate-500">{person.role}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <button className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Jane Doe</p>
                          <p className="text-xs text-slate-500">Client</p>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Related Threads */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                  <Link2 className="w-4 h-4 text-blue-600" />
                  Related Threads
                </h4>
                <p className="text-sm text-slate-500 italic">
                  No related conversations found.
                </p>
              </div>

              {/* CRM Toggle */}
              <div className="pt-4 border-t border-slate-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                  <span className="text-sm text-slate-700">Auto-sync with CRM</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Insights Toggle Button - Desktop (when closed) */}
      {!insightsOpen && (
        <button
          onClick={() => setInsightsOpen(true)}
          className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-l-lg shadow-lg transition-colors z-10"
          title="Open AI Insights"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
      )}

      {/* 3️⃣ AI Insights Panel - Mobile Modal */}
      {insightsOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setInsightsOpen(false)} />
          <div className="relative bg-white w-full sm:max-w-lg sm:mx-4 rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col">
            <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                AI Insights
              </h3>
              <button onClick={() => setInsightsOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Summary */}
              <div className="space-y-2">
                <h4 className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Summary
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {conversation.summary || "This thread is about rescheduling a shoot for next week."}
                </p>
              </div>

              {/* Next Step */}
              <div className="space-y-2">
                <h4 className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-blue-600" />
                  Next Step Suggestion
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {conversation.next_step_suggestion || "You might want to confirm new date availability."}
                </p>
              </div>

              {/* Actionable Data */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Actionable Data
                </h4>
                <div className="space-y-2">
                  {conversation.actionable_data ? (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900">{conversation.actionable_data.date || "Oct 25, 2 PM"}</p>
                          <p className="text-blue-700">{conversation.actionable_data.location || "Studio A"}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* People & Organizations */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  People & Organizations
                </h4>
                <div className="space-y-2">
                  {conversation.people_and_orgs && conversation.people_and_orgs.length > 0 ? (
                    conversation.people_and_orgs.map((person, idx) => (
                      <button key={idx} className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors text-left">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{person.name}</p>
                            <p className="text-xs text-slate-500">{person.role}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <button className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Jane Doe</p>
                          <p className="text-xs text-slate-500">Client</p>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Related Threads */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                  <Link2 className="w-4 h-4 text-blue-600" />
                  Related Threads
                </h4>
                <p className="text-sm text-slate-500 italic">
                  No related conversations found.
                </p>
              </div>

              {/* CRM Toggle */}
              <div className="pt-4 border-t border-slate-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                  <span className="text-sm text-slate-700">Auto-sync with CRM</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}