// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";
// import { 
//   ArrowLeft, 
//   Mail, 
//   User, 
//   Loader2, 
//   Star, 
//   Tag,
//   CheckCircle,
//   Brain,
//   Calendar,
//   ChevronDown,
//   ChevronUp,
//   Paperclip,
//   Clock,
//   FileText,
//   Download,
//   Link2,
//   Building2,
//   UserPlus,
//   MoreVertical,
//   X,
//   Sparkles,
//   TrendingUp,
//   MessageCircle
// } from "lucide-react";

// interface Attachment {
//   name: string;
//   url: string;
//   type: string;
//   size?: string;
// }

// interface Message {
//   id: string;
//   sender: string;
//   sender_name?: string;
//   sent_at: string;
//   content?: string;
//   recipients?: string | string[];
//   attachments?: Attachment[];
//   channel?: string;
//   conversation?: number;
//   external_id?: string;
//   metadata?: any;
//   importance?: string;
//   importance_score?: number;
//   ai_next_step?: string;
//   ai_summary?: string;
//   is_read?: boolean;
//   is_starred?: boolean;
//   is_incoming?: boolean;
//   subject?: string;
//   ai_people?: string[];
//   ai_organizations?: string[];
//   ai_related?: string[];
// }

// export default function MessageDetailPanel({ onClose }: { onClose?: () => void }) {
//   const { id } = useParams();
//   const { accessToken } = useAuth();
//   const [message, setMessage] = useState<Message | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showDetails, setShowDetails] = useState(false);
//   const [isStarred, setIsStarred] = useState(false);
//   const [insightsOpen, setInsightsOpen] = useState(false);
//   const [replyText, setReplyText] = useState("");
//   const [tone, setTone] = useState<"formal" | "friendly" | "concise">("friendly");
//   const [showActions, setShowActions] = useState(false);
//   const [sending, setSending] = useState(false);

//   const getChannelSource = (channel?: string) => {
//     const channelMap: Record<string, { icon: string; label: string; color: string; gradient: string }> = {
//       email: { icon: "📧", label: "Email", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", gradient: "from-blue-500/10 to-blue-600/5" },
//       gmail: { icon: "📧", label: "Gmail", color: "bg-red-500/10 text-red-600 border-red-500/20", gradient: "from-red-500/10 to-red-600/5" },
//       whatsapp: { icon: "💬", label: "WhatsApp", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", gradient: "from-emerald-500/10 to-emerald-600/5" },
//       slack: { icon: "🏢", label: "Slack", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", gradient: "from-purple-500/10 to-purple-600/5" }
//     };
//     return channelMap[channel || 'email'] || channelMap.email;
//   };

//   const formatDate = (dateString: string) => {
//     if (!dateString) return "Unknown date";
    
//     try {
//       const date = new Date(dateString);
//       const now = new Date();
//       const diffInMs = now.getTime() - date.getTime();
//       const diffInHours = diffInMs / (1000 * 60 * 60);
//       const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

//       if (diffInHours < 24) {
//         if (diffInHours < 1) {
//           const mins = Math.floor(diffInMs / (1000 * 60));
//           return mins < 1 ? "Just now" : `${mins}m ago`;
//         }
//         const hours = Math.floor(diffInHours);
//         return `${hours}h ago`;
//       }

//       if (diffInDays < 7) {
//         return date.toLocaleDateString('en-US', { 
//           weekday: 'short',
//           hour: 'numeric',
//           minute: '2-digit',
//           hour12: true 
//         });
//       }

//       return date.toLocaleDateString('en-US', { 
//         month: 'short',
//         day: 'numeric',
//         year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
//       });
//     } catch (error) {
//       return dateString;
//     }
//   };

//   const getInitials = (name: string) => {
//     return name
//       .split(' ')
//       .map(n => n[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   const getInitialColor = (name: string) => {
//     const colors = [
//       'from-blue-500 to-blue-600',
//       'from-purple-500 to-purple-600',
//       'from-pink-500 to-pink-600',
//       'from-indigo-500 to-indigo-600',
//       'from-cyan-500 to-cyan-600',
//       'from-teal-500 to-teal-600',
//     ];
//     const index = name.charCodeAt(0) % colors.length;
//     return colors[index];
//   };

//   const handleSend = async () => {
//     if (!replyText.trim() || !accessToken || !message) return;

//     setSending(true);
//     setError(null);

//     try {
//       const subject = message.subject || (message.metadata?.subject as string) || "(No subject)";
//       const bodyHtml = replyText.replace(/\n/g, '<br>');

//       const payload = {
//         message_id: message.id,
//         to: message.sender,
//         subject: `Re: ${subject}`,
//         body: replyText,
//         body_html: bodyHtml,
//         attachments: [],
//       };

//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/unified/send/`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${accessToken}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });
//       console.log("body", payload)

//       if (!res.ok) {
//         const errorData = await res.json().catch(() => ({}));
//         throw new Error(errorData.detail || `Failed to send message: ${res.statusText}`);
//       }

//       setReplyText('');
//       // Optionally, you can add a success toast or update the message state here
//       console.log('Message sent successfully');
//     } catch (err) {
//       console.error('Error sending message:', err);
//       setError(err instanceof Error ? err.message : 'Failed to send message');
//     } finally {
//       setSending(false);
//     }
//   };

//   useEffect(() => {
//     if (!accessToken || !id) return;

//     const fetchMessage = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/unified/messages/${id}/`, {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         });

//         if (!res.ok) throw new Error(`Failed to fetch message: ${res.statusText}`);
//         const data = await res.json();
//         setMessage(data);
//         setIsStarred(data.is_starred || false);
//       } catch (error) {
//         console.error("Error fetching message:", error);
//         setError(error instanceof Error ? error.message : "Failed to load message");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMessage();
//   }, [id, accessToken]);

//   if (loading) {
//     return (
//       <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
//         <div className="flex flex-col items-center gap-4">
//           <div className="relative">
//             <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
//             <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
//           </div>
//           <p className="text-sm font-medium text-slate-600">Loading message...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !message) {
//     return (
//       <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-8">
//         <div className="text-center space-y-6 max-w-md">
//           <div className="w-20 h-20 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-lg">
//             <Mail className="w-10 h-10 text-slate-400" />
//           </div>
//           <div className="space-y-2">
//             <h2 className="text-2xl font-bold text-slate-900">Message not found</h2>
//             <p className="text-slate-600">
//               {error || "The message you're looking for doesn't exist or has been removed."}
//             </p>
//           </div>
//           {onClose && (
//             <button
//               onClick={onClose}
//               className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
//             >
//               Go back
//             </button>
//           )}
//         </div>
//       </div>
//     );
//   }

//   const sourceBadge = getChannelSource(message.channel);
//   const subject = message.subject || (message.metadata?.subject as string) || "(No subject)";
//   const bodyContent = message.channel === 'email' 
//     ? (message.metadata?.html_body || message.content || "<p class='text-slate-400 italic'>This message has no content</p>") 
//     : (message.content || "<p class='text-slate-400 italic'>This message has no content</p>");
//   const recipientsStr = Array.isArray(message.recipients) ? message.recipients.join(', ') : message.recipients || '';
//   const recipientsArray = recipientsStr.split(',').map(r => r.trim()).filter(r => r);

//   return (
//     <div className="flex h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 relative">
//       {/* Main Content Area */}
//       <div className="flex-1 flex flex-col bg-white min-w-0">
//         {/* Header */}
//         <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl flex-shrink-0">
//           <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
//             {/* Top Bar */}
//             <div className="flex items-center justify-between gap-3 mb-5">
//               <div className="flex items-center gap-3 flex-1 min-w-0">
//                 {onClose && (
//                   <button
//                     onClick={onClose}
//                     className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
//                   >
//                     <ArrowLeft className="w-5 h-5" />
//                   </button>
//                 )}
//                 <div className={`w-11 h-11 bg-gradient-to-br ${getInitialColor(message.sender_name || message.sender)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
//                   <span className="text-base font-bold text-white">
//                     {getInitials(message.sender_name || message.sender)}
//                   </span>
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="font-bold text-slate-900 text-base truncate">
//                     {message.sender_name || message.sender}
//                   </p>
//                   <div className="flex items-center gap-2 mt-0.5">
//                     <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${sourceBadge.color}`}>
//                       <span>{sourceBadge.icon}</span>
//                       <span>{sourceBadge.label}</span>
//                     </span>
//                     <span className="text-xs text-slate-500 font-medium">{formatDate(message.sent_at)}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Desktop Actions */}
//               <div className="hidden lg:flex items-center gap-1">
//                 <button
//                   onClick={() => setIsStarred(!isStarred)}
//                   className={`p-2 rounded-lg transition-all ${
//                     isStarred 
//                       ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
//                       : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
//                   }`}
//                 >
//                   <Star className={`w-4.5 h-4.5 ${isStarred ? 'fill-current' : ''}`} />
//                 </button>
//                 <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
//                   <Tag className="w-4.5 h-4.5" />
//                 </button>
//                 <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
//                   <CheckCircle className="w-4.5 h-4.5" />
//                 </button>
//                 <button className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
//                   <Brain className="w-4.5 h-4.5" />
//                 </button>
//                 <button
//                   onClick={() => setInsightsOpen(!insightsOpen)}
//                   className={`p-2 rounded-lg transition-all ${
//                     insightsOpen 
//                       ? 'text-blue-600 bg-blue-50' 
//                       : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
//                   }`}
//                 >
//                   <Sparkles className="w-4.5 h-4.5" />
//                 </button>
//               </div>

//               {/* Mobile Actions */}
//               <div className="lg:hidden relative">
//                 <button
//                   onClick={() => setShowActions(!showActions)}
//                   className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
//                 >
//                   <MoreVertical className="w-5 h-5" />
//                 </button>
//                 {showActions && (
//                   <>
//                     <div className="fixed inset-0 z-20" onClick={() => setShowActions(false)} />
//                     <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200/60 py-1 z-30">
//                       <button
//                         onClick={() => {
//                           setIsStarred(!isStarred);
//                           setShowActions(false);
//                         }}
//                         className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
//                       >
//                         <Star className="w-4 h-4" />
//                         {isStarred ? 'Unstar' : 'Star'}
//                       </button>
//                       <button className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
//                         <Tag className="w-4 h-4" />
//                         Add label
//                       </button>
//                       <button className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
//                         <CheckCircle className="w-4 h-4" />
//                         Mark done
//                       </button>
//                       <button
//                         onClick={() => {
//                           setInsightsOpen(true);
//                           setShowActions(false);
//                         }}
//                         className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
//                       >
//                         <Sparkles className="w-4 h-4" />
//                         AI Insights
//                       </button>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>

//             {/* Subject */}
//             <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 leading-tight break-words">
//               {subject}
//             </h1>

//             {/* Recipients Bar */}
//             <div className="flex items-center justify-between gap-3">
//               <div className="flex items-center gap-2 text-sm min-w-0">
//                 <span className="text-slate-500">to</span>
//                 <span className="text-slate-900 font-medium truncate">
//                   {recipientsArray[0] || 'me'}
//                 </span>
//                 {recipientsArray.length > 1 && (
//                   <span className="text-slate-400 text-xs bg-slate-100 px-2 py-0.5 rounded-full">
//                     +{recipientsArray.length - 1}
//                   </span>
//                 )}
//                 <button
//                   onClick={() => setShowDetails(!showDetails)}
//                   className="p-1 text-slate-400 hover:text-slate-600 transition-all rounded-md hover:bg-slate-100"
//                 >
//                   {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//                 </button>
//               </div>
//             </div>

//             {/* Expanded Details */}
//             {showDetails && (
//               <div className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl space-y-2.5 text-sm border border-slate-200/60">
//                 <div className="flex gap-3">
//                   <span className="text-slate-500 font-medium w-16 flex-shrink-0">From:</span>
//                   <span className="text-slate-900 break-all">{message.sender}</span>
//                 </div>
//                 {recipientsStr && (
//                   <div className="flex gap-3">
//                     <span className="text-slate-500 font-medium w-16 flex-shrink-0">To:</span>
//                     <span className="text-slate-900 break-all">{recipientsStr}</span>
//                   </div>
//                 )}
//                 <div className="flex gap-3">
//                   <span className="text-slate-500 font-medium w-16 flex-shrink-0">Date:</span>
//                   <span className="text-slate-900">
//                     {new Date(message.sent_at).toLocaleString('en-US', {
//                       weekday: 'long',
//                       year: 'numeric',
//                       month: 'long',
//                       day: 'numeric',
//                       hour: 'numeric',
//                       minute: '2-digit',
//                       hour12: true
//                     })}
//                   </span>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Message Body */}
//         <div className="flex-1 overflow-y-auto min-h-0">
//           <div className="px-4 sm:px-6 lg:px-8 py-6">
//             <div
//               className="prose prose-sm sm:prose-base prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline break-words"
//               dangerouslySetInnerHTML={{ __html: bodyContent }}
//             />

//             {/* Attachments */}
//             {message.attachments && message.attachments.length > 0 && (
//               <div className="mt-8 pt-6 border-t border-slate-200/60">
//                 <div className="flex items-center gap-2 mb-4">
//                   <Paperclip className="w-4 h-4 text-slate-400" />
//                   <h3 className="text-sm font-bold text-slate-900">
//                     {message.attachments.length} {message.attachments.length === 1 ? 'Attachment' : 'Attachments'}
//                   </h3>
//                 </div>
//                 <div className="grid gap-2">
//                   {message.attachments.map((att, idx) => (
//                     <div
//                       key={idx}
//                       className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/60 transition-all group"
//                     >
//                       <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200">
//                         <FileText className="w-5 h-5 text-blue-600" />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-semibold text-slate-900 truncate">{att.name}</p>
//                         <p className="text-xs text-slate-500">{att.type}{att.size && ` • ${att.size}`}</p>
//                       </div>
//                       <a
//                         href={att.url}
//                         download
//                         className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-all hover:bg-blue-50"
//                       >
//                         <Download className="w-4 h-4" />
//                       </a>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Reply Composer */}
//         <div className="border-t border-slate-200/60 bg-white/80 backdrop-blur-xl flex-shrink-0">
//           <div className="px-4 sm:px-6 lg:px-8 py-4">
//             {error && (
//               <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
//                 {error}
//               </div>
//             )}
//             <div className="space-y-3">
//               <textarea
//                 value={replyText}
//                 onChange={(e) => setReplyText(e.target.value)}
//                 placeholder="Type your reply..."
//                 className="w-full min-h-[80px] max-h-40 resize-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                 rows={3}
//                 disabled={sending}
//               />
//               <div className="flex items-center justify-between gap-3">
//                 <div className="flex items-center gap-2">
//                   <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all" disabled={sending}>
//                     <Paperclip className="w-4.5 h-4.5" />
//                   </button>
//                   <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" disabled={sending}>
//                     <Clock className="w-4.5 h-4.5" />
//                   </button>
//                   <button className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all" disabled={sending}>
//                     <Brain className="w-4.5 h-4.5" />
//                   </button>
//                   <select
//                     value={tone}
//                     onChange={(e) => setTone(e.target.value as any)}
//                     className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 font-medium"
//                     disabled={sending}
//                   >
//                     <option value="formal">Formal</option>
//                     <option value="friendly">Friendly</option>
//                     <option value="concise">Concise</option>
//                   </select>
//                 </div>
//                 <button 
//                   onClick={handleSend}
//                   disabled={sending || !replyText.trim()}
//                   className={`px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 font-semibold text-sm shadow-lg ${
//                     sending || !replyText.trim()
//                       ? 'bg-gray-400 cursor-not-allowed text-gray-500 shadow-none'
//                       : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-xl'
//                   }`}
//                 >
//                   <Loader2 className={`w-4 h-4 ${sending ? 'animate-spin' : ''}`} />
//                   {sending ? 'Sending...' : 'Send'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* AI Insights Sidebar - Desktop */}
//       <div className={`hidden lg:block border-l border-slate-200/60 bg-white transition-all duration-300 ${insightsOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
//         {insightsOpen && (
//           <div className="h-full flex flex-col w-80">
//             <div className="px-5 py-4 border-b border-slate-200/60 flex items-center justify-between flex-shrink-0 bg-gradient-to-br from-blue-50/50 to-transparent">
//               <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
//                 <Sparkles className="w-5 h-5 text-blue-600" />
//                 AI Insights
//               </h3>
//               <button onClick={() => setInsightsOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 transition-all rounded-lg hover:bg-slate-100">
//                 <X className="w-4.5 h-4.5" />
//               </button>
//             </div>

//             <div className="flex-1 overflow-y-auto p-5 space-y-5">
//               {/* Summary */}
//               {message.ai_summary && (
//                 <div className="space-y-2">
//                   <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
//                     <MessageCircle className="w-4 h-4 text-blue-600" />
//                     Summary
//                   </h4>
//                   <p className="text-sm text-slate-600 leading-relaxed bg-gradient-to-br from-blue-50/50 to-transparent p-3 rounded-lg border border-blue-100/50">
//                     {message.ai_summary}
//                   </p>
//                 </div>
//               )}

//               {/* Next Step */}
//               {message.ai_next_step && (
//                 <div className="space-y-2">
//                   <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
//                     <TrendingUp className="w-4 h-4 text-blue-600" />
//                     Suggested Action
//                   </h4>
//                   <p className="text-sm text-slate-600 leading-relaxed bg-gradient-to-br from-emerald-50/50 to-transparent p-3 rounded-lg border border-emerald-100/50">
//                     {message.ai_next_step}
//                   </p>
//                 </div>
//               )}

//               {/* Actionable Data */}
//               {message.metadata?.actionable_data && (
//                 <div className="space-y-2">
//                   <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
//                     <Calendar className="w-4 h-4 text-blue-600" />
//                     Key Details
//                   </h4>
//                   <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-lg p-3 border border-blue-200/50">
//                     <div className="flex items-start gap-2">
//                       <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
//                       <div className="text-sm">
//                         <p className="font-semibold text-blue-900">{message.metadata.actionable_data.date}</p>
//                         {message.metadata.actionable_data.location && (
//                           <p className="text-blue-700 mt-0.5">{message.metadata.actionable_data.location}</p>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* People & Organizations */}
//               {((message.ai_people && message.ai_people.length > 0) || (message.ai_organizations && message.ai_organizations.length > 0)) && (
//                 <div className="space-y-3">
//                   <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
//                     <UserPlus className="w-4 h-4 text-blue-600" />
//                     People & Organizations
//                   </h4>
//                   <div className="space-y-2">
//                     {message.ai_people && message.ai_people.length > 0 && (
//                       <div className="space-y-1.5">
//                         {message.ai_people.map((person, idx) => (
//                           <div key={`person-${idx}`} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/60 transition-all">
//                             <div className="flex items-center gap-2">
//                               <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                                 <User className="w-3.5 h-3.5 text-blue-600" />
//                               </div>
//                               <div>
//                                 <p className="text-sm font-semibold text-slate-900">{person}</p>
//                                 <p className="text-xs text-slate-500">Person</p>
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                     {message.ai_organizations && message.ai_organizations.length > 0 && (
//                       <div className="space-y-1.5">
//                         {message.ai_organizations.map((org, idx) => (
//                           <div key={`org-${idx}`} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/60 transition-all">
//                             <div className="flex items-center gap-2">
//                               <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                                 <Building2 className="w-3.5 h-3.5 text-emerald-600" />
//                               </div>
//                               <div>
//                                 <p className="text-sm font-semibold text-slate-900">{org}</p>
//                                 <p className="text-xs text-slate-500">Organization</p>
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Related Topics */}
//               {message.ai_related && message.ai_related.length > 0 && (
//                 <div className="space-y-2">
//                   <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
//                     <Link2 className="w-4 h-4 text-blue-600" />
//                     Related Topics
//                   </h4>
//                   <div className="flex flex-wrap gap-1.5">
//                     {message.ai_related.map((topic, idx) => (
//                       <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-200/50">
//                         {topic}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* AI Insights Modal - Mobile */}
//       {insightsOpen && (
//         <div className="lg:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center">
//           <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setInsightsOpen(false)} />
//           <div className="relative bg-white w-full sm:max-w-lg sm:mx-4 rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl">
//             <div className="px-5 py-4 border-b border-slate-200/60 flex items-center justify-between flex-shrink-0 bg-gradient-to-br from-blue-50/50 to-transparent">
//               <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
//                 <Sparkles className="w-5 h-5 text-blue-600" />
//                 AI Insights
//               </h3>
//               <button onClick={() => setInsightsOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 transition-all rounded-lg hover:bg-slate-100">
//                 <X className="w-4.5 h-4.5" />
//               </button>
//             </div>

//             <div className="flex-1 overflow-y-auto p-5 space-y-5">
//               {/* Summary */}
//               {message.ai_summary && (
//                 <div className="space-y-2">
//                   <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
//                     <MessageCircle className="w-4 h-4 text-blue-600" />
//                     Summary
//                   </h4>
//                   <p className="text-sm text-slate-600 leading-relaxed bg-gradient-to-br from-blue-50/50 to-transparent p-3 rounded-lg border border-blue-100/50">
//                     {message.ai_summary}
//                   </p>
//                 </div>
//               )}

//               {/* Next Step */}
//               {message.ai_next_step && (
//                 <div className="space-y-2">
//                   <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
//                     <TrendingUp className="w-4 h-4 text-blue-600" />
//                     Suggested Action
//                   </h4>
//                   <p className="text-sm text-slate-600 leading-relaxed bg-gradient-to-br from-emerald-50/50 to-transparent p-3 rounded-lg border border-emerald-100/50">
//                     {message.ai_next_step}
//                   </p>
//                 </div>
//               )}

//               {/* Actionable Data */}
//               {message.metadata?.actionable_data && (
//                 <div className="space-y-2">
//                   <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
//                     <Calendar className="w-4 h-4 text-blue-600" />
//                     Key Details
//                   </h4>
//                   <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-lg p-3 border border-blue-200/50">
//                     <div className="flex items-start gap-2">
//                       <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
//                       <div className="text-sm">
//                         <p className="font-semibold text-blue-900">{message.metadata.actionable_data.date}</p>
//                         {message.metadata.actionable_data.location && (
//                           <p className="text-blue-700 mt-0.5">{message.metadata.actionable_data.location}</p>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* People & Organizations */}
//               {((message.ai_people && message.ai_people.length > 0) || (message.ai_organizations && message.ai_organizations.length > 0)) && (
//                 <div className="space-y-3">
//                   <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
//                     <UserPlus className="w-4 h-4 text-blue-600" />
//                     People & Organizations
//                   </h4>
//                   <div className="space-y-2">
//                     {message.ai_people && message.ai_people.length > 0 && (
//                       <div className="space-y-1.5">
//                         {message.ai_people.map((person, idx) => (
//                           <div key={`person-${idx}`} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/60 transition-all">
//                             <div className="flex items-center gap-2">
//                               <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                                 <User className="w-3.5 h-3.5 text-blue-600" />
//                               </div>
//                               <div>
//                                 <p className="text-sm font-semibold text-slate-900">{person}</p>
//                                 <p className="text-xs text-slate-500">Person</p>
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                     {message.ai_organizations && message.ai_organizations.length > 0 && (
//                       <div className="space-y-1.5">
//                         {message.ai_organizations.map((org, idx) => (
//                           <div key={`org-${idx}`} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/60 transition-all">
//                             <div className="flex items-center gap-2">
//                               <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                                 <Building2 className="w-3.5 h-3.5 text-emerald-600" />
//                               </div>
//                               <div>
//                                 <p className="text-sm font-semibold text-slate-900">{org}</p>
//                                 <p className="text-xs text-slate-500">Organization</p>
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Related Topics */}
//               {message.ai_related && message.ai_related.length > 0 && (
//                 <div className="space-y-2">
//                   <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
//                     <Link2 className="w-4 h-4 text-blue-600" />
//                     Related Topics
//                   </h4>
//                   <div className="flex flex-wrap gap-1.5">
//                     {message.ai_related.map((topic, idx) => (
//                       <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-200/50">
//                         {topic}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }