"use client"
import { Mail, Search, Send, FileText, Calendar, CheckCircle, Users, Quote, Zap, Bell, MessageCircle, ArrowRight, Check } from "lucide-react";

export default function WhisoneLandingPage() {
  const handleGetEarlyAccess = () => {
    window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSe0yuPAgMhQaF9tEVrgfGq2hhZmmCazCbfR_5_uni52llufIQ/viewform?usp=publish-editor";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold text-gray-900">Whisone</div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
            </nav>
            <button
              onClick={handleGetEarlyAccess}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Early Access
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                <Bell className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Smart Email Assistant</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
                Reclaim 5+ Hours Weekly—from Email Chaos
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Whisone&apos;s natural AI chat spots urgent alerts, searches instantly, drafts smart replies, and pulls tasks automatically. Nothing slips through.
              </p>
              <p className="text-xl text-gray-600 leading-relaxed">
                And the best part—you can access everything right from WhatsApp.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetEarlyAccess}
                  className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all text-center"
                >
                  Reserve Your Spot →
                </button>
                <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all">
                  See How It Works
                </button>
              </div>
            </div>

            {/* Demo Mockup */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 font-mono">Summarize client emails this week</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-gray-800">
                      <strong className="text-blue-700">Whisone:</strong> 3 clients replied—Sarah confirmed the project scope, Mark requested timeline changes (needs response by Friday), and Lisa sent contract revisions.
                    </p>
                    <div className="p-3 bg-white rounded-lg border-l-4 border-blue-500">
                      <p className="text-xs text-gray-500 mb-2">Suggested reply to Mark:</p>
                      <p className="text-sm text-gray-700">Got it—reviewing the timeline now. I&apos;ll send updated dates by Thursday EOD.</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How Whisone Works—In 3 Simple Steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect once, chat forever. No apps, no hassle—just your inbox tamed via WhatsApp.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex w-16 h-16 mx-auto bg-blue-50 rounded-full items-center justify-center">
                <Check className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Connect Your Inbox</h3>
              <p className="text-gray-600">Link Gmail or Outlook in seconds. Whisone scans securely—no data leaves your control.</p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex w-16 h-16 mx-auto bg-indigo-50 rounded-full items-center justify-center">
                <MessageCircle className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Chat on WhatsApp</h3>
              <p className="text-gray-600">Text Whisone like a friend: "Summarize my unread emails" or "Draft reply to boss." Instant magic.</p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex w-16 h-16 mx-auto bg-green-50 rounded-full items-center justify-center">
                <ArrowRight className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Act and Move On</h3>
              <p className="text-gray-600">Get alerts, summaries, drafts, and tasks right in chat. Reply, archive, or schedule—with one tap.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            You&apos;re Drowning in Email. Whisone Pulls You Out.
          </h2>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
            Buried alerts. Endless threads. Forgotten follow-ups. You lose hours—and opportunities. Whisone stops it cold.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-xl bg-white">
              <Mail className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Buried Priorities</h3>
              <p className="text-gray-600">Key emails vanish in the flood. You miss deadlines and deals.</p>
            </div>
            <div className="p-6 rounded-xl bg-white">
              <Zap className="w-10 h-10 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Wasted Hours</h3>
              <p className="text-gray-600">You hunt threads, rewrite replies, switch tabs nonstop.</p>
            </div>
            <div className="p-6 rounded-xl bg-white">
              <CheckCircle className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Dropped Balls</h3>
              <p className="text-gray-600">Tasks hide in inboxes. Nothing tracks. Deals stall.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Chat Like You Talk—Whisone Listens and Acts
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Skip commands. Just describe what you need in plain English. Whisone delivers—in seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Alerts</h3>
                  <p className="text-gray-600">Say &quot;flag urgent client updates&quot;—get instant pings delivered to your WhatsApp. No more buried crises.</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <Search className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Search</h3>
                  <p className="text-gray-600">Ask &quot;find that Q3 budget thread&quot;—results pop up fast in WhatsApp. Slash hunt time to zero.</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Send className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Replies</h3>
                  <p className="text-gray-600">Tell it &quot;draft a polite follow-up to Lisa&quot;—get your voice, ready to tweak and send from WhatsApp.</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Thread Summaries</h3>
                  <p className="text-gray-600">Query &quot;summarize vendor negotiations&quot;—cut hours of reading to bullet-point clarity, straight to your WhatsApp.</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Task & Meeting Extraction</h3>
                  <p className="text-gray-600">Say &quot;pull action items from team emails&quot;—auto-tasks, reminders, and calendar slots via WhatsApp. Stay ahead, effortlessly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Mini Subsection */}
      <section className="py-12 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full mb-6">
            <MessageCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">WhatsApp-Powered</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Seamless Control from WhatsApp</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chat with Whisone on the go—get alerts, summaries, and actions delivered instantly. No apps to switch, just your favorite messenger.
          </p>
        </div>
      </section>

      {/* Target Audience */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
            For Pros Who Can&apos;t Miss a Beat
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Clients, teams, deadlines—Whisone keeps you sharp, no matter the chaos.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-blue-50 rounded-xl">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Busy Pros</h3>
              <p className="text-gray-600">Slice inbox noise. Focus only on what drives your day forward.</p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-indigo-50 rounded-xl">
                <Zap className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Founders & Freelancers</h3>
              <p className="text-gray-600">Nail leads and follow-ups. Turn emails into revenue, fast.</p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-green-50 rounded-xl">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Teams & Leaders</h3>
              <p className="text-gray-600">Sync escalations and commitments. Lead without the lag.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-200">
            <Quote className="w-10 h-10 text-gray-300 mb-6" />
            <blockquote className="text-xl sm:text-2xl text-gray-700 mb-6 leading-relaxed">
              Whisone slashed my email stress in half—reclaimed a full day weekly. Haven&apos;t missed a key message since.
            </blockquote>
            <cite className="text-gray-600 font-semibold not-italic">— Alex Rivera, Serial Founder & Beta User</cite>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-gray-600 leading-relaxed">
                Beta users save <strong className="text-gray-900">5–7 hours weekly</strong>. <strong className="text-gray-900">95% zero missed priorities</strong>. Join the shift from chaos to control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="signup" className="py-20 bg-white">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Grab Whisone Early—Before Slots Vanish
            </h2>
            <p className="text-lg text-gray-600">
              Lock in access. Let AI handle alerts, summaries, and drafts. Reclaim your inbox—today.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGetEarlyAccess}
              className="w-full px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
            >
              Reserve Your Spot →
            </button>
            <p className="text-sm text-gray-500 text-center">
              Limited: 500 MVP spots. Join 200+ on the list—in 30 seconds.
            </p>
            <p className="text-xs text-gray-500 text-center">
              🔒 Whisone never shares your WhatsApp or email data. Everything stays secure and private.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2025 Whisone. Built for pros who can&apos;t afford to miss.</p>
        </div>
      </footer>
    </div>
  );
}