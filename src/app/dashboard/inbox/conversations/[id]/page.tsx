"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowLeft, 
  Mail, 
  Loader2, 
  Star, 
  Tag,
  CheckCircle,
  Calendar,
  Paperclip,
  Send,
  Clock,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Sparkles,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [tone, setTone] = useState<"formal" | "friendly" | "concise">("friendly");
  const [showSmartReplies, setShowSmartReplies] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [generatingReplies, setGeneratingReplies] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);

  const getChannelSource = (channel?: string) => {
    const channelMap: Record<string, { icon: string; label: string; color: string }> = {
      email: { icon: "📧", label: "Email", color: "bg-blue-50 text-blue-700 border-blue-200" },
      gmail: { icon: "📧", label: "Gmail", color: "bg-blue-50 text-blue-700 border-blue-200" },
      whatsapp: { icon: "💬", label: "WhatsApp", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      slack: { icon: "🏢", label: "Slack", color: "bg-violet-50 text-violet-700 border-violet-200" }
    };
    return channelMap[channel || 'email'] || channelMap.email;
  };

  const truncateContent = (html: string, maxLen: number = 200): string => {
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
          return mins < 1 ? "Just now" : `${mins}m ago`;
        }
        const hours = Math.floor(diffInHours);
        return `${hours}h ago`;
      }

      if (diffInDays < 7) {
        return date.toLocaleDateString('en-US', { 
          weekday: 'short',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true 
        });
      }

      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric',
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

  const generateSmartReplies = async () => {
    if (!conversation || generatingReplies) return;
    
    setGeneratingReplies(true);
    try {
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      const context = lastMessage?.content || lastMessage?.html_body || "";
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/unified/smart-replies/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: id,
          context: context.substring(0, 500),
          tone: tone
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSmartReplies(data.replies || []);
      }
    } catch (error) {
      console.error("Error generating smart replies:", error);
    } finally {
      setGeneratingReplies(false);
    }
  };

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
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="text-sm font-medium text-slate-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center shadow-lg">
            <Mail className="w-10 h-10 text-blue-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Conversation not found</h2>
            <p className="text-slate-600 leading-relaxed">
              {error || "The conversation you're looking for doesn't exist or has been removed."}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
  const recentMessages = conversation.messages.slice(-5);

  return (
    <div className="flex h-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 relative">
      <div className="flex-1 flex flex-col bg-white min-w-0 shadow-xl rounded-lg overflow-hidden m-2 md:m-4">
        {/* Header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-white to-blue-50/30 flex-shrink-0">
          <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6">
            {/* Top bar with back button and actions */}
            <div className="flex items-center justify-between gap-3 mb-4 md:mb-6">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all flex-shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-base md:text-lg font-bold text-white">
                        {getInitials(conversation.last_sender || getParticipants())}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 text-base md:text-lg truncate mb-1">
                      {conversation.last_sender || getParticipants()}
                    </p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${sourceBadge.color}`}>
                      <span>{sourceBadge.icon}</span>
                      <span>{sourceBadge.label}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden lg:flex items-center gap-1.5">
                <button
                  onClick={() => setIsStarred(!isStarred)}
                  className={`p-2.5 rounded-xl transition-all ${
                    isStarred 
                      ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Star className={`w-5 h-5 ${isStarred ? 'fill-current' : ''}`} />
                </button>
                <button className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                  <Tag className="w-5 h-5" />
                </button>
                <button className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button className="p-2.5 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
                  <Calendar className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Actions */}
              <div className="lg:hidden relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {showActions && (
                  <>
                    <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setShowActions(false)} />
                    <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 overflow-hidden">
                      <button
                        onClick={() => {
                          setIsStarred(!isStarred);
                          setShowActions(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                      >
                        <Star className={`w-4 h-4 ${isStarred ? 'fill-current text-amber-500' : ''}`} />
                        {isStarred ? 'Unstar' : 'Star'}
                      </button>
                      <button className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                        <Tag className="w-4 h-4" />
                        Add label
                      </button>
                      <button className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                        Mark done
                      </button>
                      <button className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                        <Calendar className="w-4 h-4" />
                        Add to task
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Subject */}
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-4 break-words leading-tight">
              {subject}
            </h1>

            {/* Info bar */}
            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-700">{messageCount}</span>
                  <span className="hidden sm:inline">messages</span>
                </div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                >
                  {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-slate-500 font-medium">
                {formatDate(conversation.last_message_at || conversation.messages[conversation.messages.length - 1]?.sent_at || "")}
              </p>
            </div>

            {/* Expanded details */}
            {showDetails && (
              <div className="mt-4 p-4 md:p-5 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl space-y-3 text-sm border border-slate-200">
                <div className="flex gap-3">
                  <span className="text-slate-600 font-semibold min-w-[100px]">Participants:</span>
                  <span className="text-slate-900 break-all flex-1">{getParticipants()}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-slate-600 font-semibold min-w-[100px]">Channel:</span>
                  <span className="text-slate-900">{sourceBadge.label}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-slate-600 font-semibold min-w-[100px]">Last Message:</span>
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
            <div className="space-y-4 md:space-y-6">
              {recentMessages.map((msg, idx) => {
                const isIncoming = msg.is_incoming !== false;
                const isEmail = msg.channel === 'email' || msg.channel === 'gmail';
                const fullContent = isEmail ? (msg.html_body || msg.metadata?.html_body || msg.content || "") : (msg.content || "");
                const previewText = truncateContent(fullContent, 200);
                const hasAttachments = msg.attachments && msg.attachments.length > 0;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isIncoming ? 'justify-start' : 'justify-end'} group`}
                    onClick={() => router.push(`/dashboard/inbox/messages/${msg.id}`)}
                  >
                    <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isIncoming ? 'items-start' : 'items-end'} space-y-2 cursor-pointer`}>
                      <div className={`px-4 md:px-5 py-3 md:py-4 rounded-2xl ${
                        isIncoming 
                          ? 'bg-white border border-slate-200 text-slate-900 shadow-sm group-hover:shadow-md' 
                          : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md group-hover:shadow-lg'
                      } transition-all w-full`}>
                        <p className="text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap">
                          {previewText}
                        </p>
                      </div>
                      
                      {hasAttachments && (
                        <div className={`flex flex-wrap gap-2 ${isIncoming ? 'justify-start' : 'justify-end'} w-full`}>
                          {msg.attachments!.slice(0, 2).map((att, attIdx) => (
                            <div key={attIdx} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs shadow-sm hover:shadow-md transition-all">
                              <FileText className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                              <span className="truncate max-w-[120px] font-medium text-slate-700">{att.name}</span>
                              <a
                                href={att.url}
                                download
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-all"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ))}
                          {msg.attachments!.length > 2 && (
                            <div className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-medium text-slate-700 border border-slate-200">
                              +{msg.attachments!.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className={`flex items-center gap-2 text-xs font-medium ${isIncoming ? 'text-slate-500' : 'text-blue-200'}`}>
                        <span className="font-semibold">{msg.sender_name || getInitials(msg.sender)}</span>
                        <span>•</span>
                        <span>{formatDate(msg.sent_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {conversation.messages.length > 5 && (
                <div className="text-center py-6">
                  <button
                    onClick={() => router.push(`/dashboard/inbox/conversations/${id}/full`)}
                    className="px-6 md:px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    View all {conversation.messages.length} messages
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reply Composer */}
        <div className="border-t border-slate-200 bg-white flex-shrink-0 shadow-2xl">
          <div className="px-4 md:px-6 lg:px-8 py-4 md:py-5 space-y-3">
            {/* Smart Replies */}
            {showSmartReplies && smartReplies.length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-blue-50 to-violet-50 rounded-xl border border-blue-200">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-900 mb-2">AI-Suggested Replies</p>
                  <div className="flex flex-wrap gap-2">
                    {smartReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setReplyText(reply);
                          setShowSmartReplies(false);
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 text-xs rounded-lg font-medium transition-all border border-blue-200 shadow-sm hover:shadow whitespace-nowrap"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setShowSmartReplies(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded transition-all flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Composer */}
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="w-full min-h-[80px] md:min-h-[100px] max-h-48 resize-none bg-slate-50 border-2 border-slate-200 focus:border-blue-500 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm md:text-base focus:outline-none transition-all placeholder:text-slate-400"
                  rows={3}
                />
                {!showSmartReplies && smartReplies.length === 0 && (
                  <button
                    onClick={generateSmartReplies}
                    disabled={generatingReplies}
                    className="absolute top-3 right-3 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
                    title="Generate AI replies"
                  >
                    {generatingReplies ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all" title="Attach file">
                    <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Schedule">
                    <Clock className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="px-3 md:px-4 py-2 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 rounded-xl text-xs md:text-sm font-medium focus:outline-none transition-all"
                  >
                    <option value="formal">Formal</option>
                    <option value="friendly">Friendly</option>
                    <option value="concise">Concise</option>
                  </select>
                </div>
                <button className="px-5 md:px-7 py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all flex items-center gap-2 font-semibold text-sm md:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex-shrink-0">
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}