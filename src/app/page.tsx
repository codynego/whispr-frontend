"use client"
import { Mail, Search, Send, FileText, Calendar, CheckCircle, Users, Quote, Zap, Bell, MessageCircle, ArrowRight, Check, Brain, Sparkles, Clock } from "lucide-react";

export default function WhisoneLandingPage() {
  const handleGetEarlyAccess = () => {
    window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSe0yuPAgMhQaF9tEVrgfGq2hhZmmCazCbfR_5_uni52llufIQ/viewform?usp=publish-editor";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-emerald-600" />
              <div className="text-2xl font-bold text-gray-900">Whisone</div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#use-cases" className="text-gray-600 hover:text-gray-900 transition-colors">Use Cases</a>
            </nav>
            <button
              onClick={handleGetEarlyAccess}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Get Early Access
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-blue-600/5" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">Your AI Agent on WhatsApp</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
                Your Second Brain Lives in WhatsApp
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Store anything. Recall anything. Automate anything—all through simple WhatsApp messages. No apps. No switching. Just chat.
              </p>

              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-gray-700">Smart Notes & Memory</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-gray-700">Email Intelligence</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-gray-700">Auto Reminders</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetEarlyAccess}
                  className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all text-center flex items-center justify-center gap-2"
                >
                  Start Free on WhatsApp <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all">
                  See How It Works
                </button>
              </div>
            </div>

            {/* Demo Mockup */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-700">Remember: I paid $1,200 rent to John today</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <p className="text-sm text-gray-800">
                      <strong className="text-emerald-700">Whisone:</strong> ✅ Saved: Rent payment of $1,200 to John on Nov 20, 2025
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-700">When did I last pay rent?</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <p className="text-sm text-gray-800">
                      <strong className="text-emerald-700">Whisone:</strong> You paid $1,200 rent to John today (Nov 20). Last payment before that was Oct 20 ($1,200).
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* USP Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            The AI Agent That Lives Where You Already Are
          </h2>
          <p className="text-xl text-emerald-50 max-w-3xl mx-auto leading-relaxed">
            No new apps. No dashboards. No complicated setups. Just message Whisone on WhatsApp like you text a friend—and watch it remember everything, automate your life, and keep you effortlessly organized.
          </p>
        </div>
      </section>

      {/* Core Value Pillars */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Three Powers. One WhatsApp Chat.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whisone combines memory, intelligence, and automation into the simplest interface on Earth: conversation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Memory Layer */}
            <div className="relative p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200 hover:shadow-xl transition-all">
              <div className="inline-flex p-3 bg-purple-100 rounded-xl mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Remember Everything</h3>
              <p className="text-gray-700 mb-6">Your personal memory bank that never forgets.</p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Store notes, ideas, and insights instantly</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Ask natural questions: &quo;What did I buy last month?&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Semantic search finds exactly what you need</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Track payments, events, conversations</span>
                </li>
              </ul>
            </div>

            {/* Intelligence Layer */}
            <div className="relative p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 hover:shadow-xl transition-all">
              <div className="inline-flex p-3 bg-emerald-100 rounded-xl mb-4">
                <Sparkles className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Understand You</h3>
              <p className="text-gray-700 mb-6">AI that gets context and helps you work smarter.</p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Summarize emails in seconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Draft replies in your tone</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Extract action items from messages</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Spot urgent priorities automatically</span>
                </li>
              </ul>
            </div>

            {/* Automation Layer */}
            <div className="relative p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200 hover:shadow-xl transition-all">
              <div className="inline-flex p-3 bg-orange-100 rounded-xl mb-4">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Act For You</h3>
              <p className="text-gray-700 mb-6">Set it once, let Whisone handle the rest.</p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Send reminders when they&lsquo;re due</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Alert you to important emails</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Track overdue tasks</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Run background updates while you sleep</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Who Is Whisone For?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Different people, same problem: too much to track, not enough time. Whisone adapts to your life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Busy Professional */}
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="inline-flex p-3 bg-blue-50 rounded-lg mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Busy Professionals</h3>
              <p className="text-sm text-gray-500 mb-4">Office workers, managers, consultants</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Daily email summaries</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Meeting follow-up tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Never miss urgent requests</span>
                </li>
              </ul>
            </div>

            {/* Entrepreneurs */}
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="inline-flex p-3 bg-emerald-50 rounded-lg mb-4">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Entrepreneurs</h3>
              <p className="text-sm text-gray-500 mb-4">Founders, freelancers, side-hustlers</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Capture ideas instantly</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Track client conversations</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Spot high-value opportunities</span>
                </li>
              </ul>
            </div>

            {/* Students */}
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="inline-flex p-3 bg-purple-50 rounded-lg mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Students & Learners</h3>
              <p className="text-sm text-gray-500 mb-4">University students, exam prep</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Save class notes instantly</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Assignment deadline tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Ask: &quot;What&apos;s due this week?&quot;</span>
                </li>
              </ul>
            </div>

            {/* Productivity Lovers */}
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="inline-flex p-3 bg-orange-50 rounded-lg mb-4">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Productivity Enthusiasts</h3>
              <p className="text-sm text-gray-500 mb-4">GTD people, Notion lovers, planners</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>One unified system in WhatsApp</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Natural language control</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Ask: &quot;What did I accomplish?&quot;</span>
                </li>
              </ul>
            </div>

            {/* Life Organizers */}
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="inline-flex p-3 bg-pink-50 rounded-lg mb-4">
                <Calendar className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Life Organizers</h3>
              <p className="text-sm text-gray-500 mb-4">Parents, busy people, forgetters</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Shopping lists & errands</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Birthday & event reminders</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Track bills & payments</span>
                </li>
              </ul>
            </div>

            {/* Remote Workers */}
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="inline-flex p-3 bg-teal-50 rounded-lg mb-4">
                <MessageCircle className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Digital Nomads</h3>
              <p className="text-sm text-gray-500 mb-4">Remote workers, travelers, global teams</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>Timezone-aware reminders</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>Synced notes across devices</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>Ask: &quot;What did I miss today?&quot;</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              So Simple, It Feels Like Magic
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three steps. Zero friction. Total control.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center space-y-4">
              <div className="inline-flex w-16 h-16 mx-auto bg-emerald-100 rounded-full items-center justify-center text-2xl font-bold text-emerald-600">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Connect Your Accounts</h3>
              <p className="text-gray-600">Link Gmail, Outlook, or just start fresh. Takes 30 seconds.</p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex w-16 h-16 mx-auto bg-blue-100 rounded-full items-center justify-center text-2xl font-bold text-blue-600">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Message Whisone</h3>
              <p className="text-gray-600">Talk naturally. &quot;Remind me to call mom tomorrow at 3pm.&quot;</p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex w-16 h-16 mx-auto bg-purple-100 rounded-full items-center justify-center text-2xl font-bold text-purple-600">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Live Organized</h3>
              <p className="text-gray-600">Whisone remembers, reminds, and acts. You stay focused.</p>
            </div>
          </div>

          {/* Feature Examples */}
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 rounded-lg flex-shrink-0">
                  <Brain className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Memory Search</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="bg-white/60 rounded-lg p-3 border border-emerald-200">
                      <span className="font-mono">&quot;What restaurant did Sarah recommend?&quot;</span>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 border border-emerald-200">
                      <strong>Whisone:</strong> Sarah recommended "Tasty Bites" on Nov 15. You saved: great pasta, book ahead.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Intelligence</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
                      <span className="font-mono">&quot;Summarize urgent emails from this week&quot;</span>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
                      <strong>Whisone:</strong> 2 urgent: Client needs proposal by Friday (mark@tech.co). Invoice overdue from supplier (alert sent 3 days ago).
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-lg flex-shrink-0">
                  <Bell className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Background Automation</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="bg-white/60 rounded-lg p-3 border border-orange-200">
                      <span className="font-mono">&quot;Remind me every Monday at 9am to review tasks&quot;</span>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 border border-orange-200">
                      <strong>Whisone:</strong> ✅ Set. I'll ping you every Monday 9am. (Next: Nov 25)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-xl border border-gray-200">
            <Quote className="w-10 h-10 text-gray-300 mb-6" />
            <blockquote className="text-xl sm:text-2xl text-gray-700 mb-6 leading-relaxed">
              I used to juggle 5 apps for notes, reminders, and email. Now it&apos;s just WhatsApp and Whisone. I&apos;m actually organized for the first time in years.
            </blockquote>
            <cite className="text-gray-600 font-semibold not-italic">— Alex Rivera, Product Manager & Beta User</cite>
            
            <div className="mt-8 pt-8 border-t border-gray-200 grid sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-1">5-7h</div>
                <div className="text-sm text-gray-600">Saved weekly</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-1">95%</div>
                <div className="text-sm text-gray-600">Zero missed tasks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-1">200+</div>
                <div className="text-sm text-gray-600">Early users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Example */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              See Whisone in Action
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real conversations. Real results. No complexity.
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl p-8 border border-gray-200">
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex justify-end">
                <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs">
                  <p className="text-sm">Remember: Client meeting with TechCorp next Tuesday at 2pm. Discuss pricing and timeline.</p>
                </div>
              </div>
              
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs border border-gray-200">
                  <p className="text-sm text-gray-700"><strong className="text-emerald-600">Whisone:</strong> ✅ Saved. I&apos;ll remind you Monday 5pm to prep.</p>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs">
                  <p className="text-sm">What meetings do I have next week?</p>
                </div>
              </div>
              
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-md border border-gray-200">
                  <p className="text-sm text-gray-700"><strong className="text-emerald-600">Whisone:</strong> 3 meetings scheduled:</p>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1 ml-2">
                    <li>• Mon 10am - Team standup</li>
                    <li>• Tue 2pm - TechCorp client (pricing/timeline)</li>
                    <li>• Thu 3pm - Budget review with Sarah</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs">
                  <p className="text-sm">Draft a follow-up to TechCorp confirming our meeting</p>
                </div>
              </div>
              
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-md border border-gray-200">
                  <p className="text-sm text-gray-700 mb-2"><strong className="text-emerald-600">Whisone:</strong> Here&apos;s your draft:</p>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border border-gray-200">
                    Hi TechCorp team,<br/><br/>
                    Looking forward to our meeting Tuesday at 2pm. We&apos;ll cover pricing options and project timeline as discussed.<br/><br/>
                    See you then!
                  </div>
                  <button className="mt-3 text-xs text-emerald-600 font-semibold hover:text-emerald-700">
                    → Send this email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why WhatsApp */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200 mb-6">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-700">Powered by WhatsApp</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why WhatsApp? Because You&apos;re Already There.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              2 billion people use WhatsApp daily. No new app to learn. No dashboard to check. Just message Whisone like you message anyone else.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-xl border border-gray-200">
              <Clock className="w-8 h-8 text-emerald-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Zero Learning Curve</h3>
              <p className="text-gray-600">If you can text, you can use Whisone. No tutorials needed.</p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-gray-200">
              <MessageCircle className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Always With You</h3>
              <p className="text-gray-600">Your phone, your watch, your computer. Whisone works everywhere WhatsApp does.</p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-gray-200">
              <Bell className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Notifications</h3>
              <p className="text-gray-600">Get alerts where you actually see them—not buried in another app.</p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-gray-200">
              <CheckCircle className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No App Switching</h3>
              <p className="text-gray-600">Chat with Whisone between messages to friends. Seamless.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="signup" className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Your Second Brain Awaits
          </h2>
          <p className="text-xl text-emerald-50 mb-8 max-w-2xl mx-auto">
            Join 200+ early users who never forget, never miss, and never feel overwhelmed. Start free on WhatsApp today.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleGetEarlyAccess}
              className="px-10 py-5 bg-white text-emerald-600 font-bold text-lg rounded-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
            >
              Get Early Access Now →
            </button>
            <p className="text-sm text-emerald-100">
              ⚡ Limited to 500 MVP users • No credit card required
            </p>
            <p className="text-xs text-emerald-200 max-w-md mx-auto">
              🔒 Your data stays private. We never share or sell your information. Enterprise-grade security.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-emerald-400" />
              <span className="text-xl font-bold">Whisone</span>
            </div>
            <p className="text-gray-400 text-center md:text-left">
              Your AI agent on WhatsApp. Remember everything. Automate anything.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm">© 2025 Whisone. Built for people who can&apos;t afford to forget.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}