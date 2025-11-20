"use client"
import { MessageCircle, Brain, Zap, Search, BellRing, Calendar, CheckSquare, Sparkles, ArrowRight, Quote, Shield, Globe } from "lucide-react";

export default function WhisoneLandingPage() {
  const handleGetEarlyAccess = () => {
    window.open("https://docs.google.com/forms/d/e/1FAIpQLSe0yuPAgMhQaF9tEVrgfGq2hhZmmCazCbfR_5_uni52llufIQ/viewform", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Whisone
          </div>
          <button
            onClick={handleGetEarlyAccess}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-xl transition-all"
          >
            Get Early Access →
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 font-medium text-sm">
              <Sparkles className="w-5 h-5" />
              The only AI agent that lives completely inside WhatsApp
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Your Second Brain<br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Inside WhatsApp
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Store anything. Recall anything. Automate everything — emails, tasks, reminders, notes, calendar — 
              all with simple messages. No new apps. No dashboards. Just chat.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <button
                onClick={handleGetEarlyAccess}
                className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center gap-3"
              >
                Start Free on WhatsApp <ArrowRight className="w-5 h-5" />
              </button>
              <div className="text-sm text-gray-500">
                30-second setup • 500 spots left
              </div>
            </div>
          </div>

          {/* Hero Chat Mockup */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="space-y-5 font-sans">
                <div className="bg-gray-100 rounded-2xl p-4 max-w-xs ml-auto">
                  <p className="text-sm">Summarize my inbox + pull tasks from today</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl p-5 rounded-tl-none">
                    <p className="font-semibold mb-3">🔥 Today’s Summary (Nov 20)</p>
                    <ul className="text-sm space-y-2">
                      <li>• Client X confirmed $12k deal (reply needed)</li>
                      <li>• Meeting with Sarah moved to 4pm tomorrow</li>
                      <li>• Invoice #442 overdue — reminder sent</li>
                    </ul>
                    <div className="mt-4 p-4 bg-white/20 rounded-xl">
                      <p className="text-xs opacity-90">Action items created → 3 new tasks + 2 reminders set</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars – 3 Big Boxes */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">One Agent. Three Superpowers.</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="group relative bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-10 border border-indigo-100 hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Remember Everything</h3>
              <p className="text-gray-600 mb-6">Notes, emails, ideas, meetings, files — Whisone stores it all with perfect memory.</p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-3"><CheckSquare className="w-5 h-5 text-indigo-600" /> Semantic search across your life</li>
                <li className="flex items-center gap-3"><CheckSquare className="w-5 h-5 text-indigo-600" /> “What did I promise Sarah last month?”</li>
                <li className="flex items-center gap-3"><CheckSquare className="w-5 h-5 text-indigo-600" /> Daily auto-summaries</li>
              </ul>
            </div>

            <div className="group relative bg-gradient-to-br from-purple-50 to-white rounded-3xl p-10 border border-purple-100 hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Act For You</h3>
              <p className="text-gray-600 mb-6">Whisone doesn’t just remember — it reminds, drafts, schedules, and executes.</p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-3"><CheckSquare className="w-5 h-5 text-purple-600" /> Auto-reminders & follow-ups</li>
                <li className="flex items-center gap-3"><CheckSquare className="w-5 h-5 text-purple-600" /> Draft replies in your tone</li>
                <li className="flex items-center gap-3"><CheckSquare className="w-5 h-5 text-purple-600" /> Background automation engine</li>
              </ul>
            </div>

            <div className="group relative bg-gradient-to-br from-green-50 to-white rounded-3xl p-10 border border-green-100 hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6">
                <MessageCircle className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Chat With Your Life</h3>
              <p className="text-gray-600 mb-6">Everything happens in WhatsApp — create, update, ask, automate — naturally.</p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-3"><CheckSquare className="w-5 h-5 text-green-600" /> No new apps or dashboards</li>
                <li className="flex items-center gap-3"><CheckSquare className="w-5 h-5 text-green-600" /> Works while you sleep</li>
                <li className="flex items-center gap-3"><CheckSquare className="w-5 h-5 text-green-600" /> Mobile-first forever</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Who Is It For? – Personas */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-16">Who Is Whisone For?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { title: "Busy Professionals", desc: "Managers & consultants who juggle 200+ emails daily", emoji: "👔" },
              { title: "Founders & Freelancers", desc: "Never miss a lead or invoice again", emoji: "🚀" },
              { title: "Students & Learners", desc: "Notes, deadlines, and study reminders in one chat", emoji: "🎓" },
              { title: "Productivity Lovers", desc: "Replace Notion, Todoist, Gmail, Calendar — with one AI", emoji: "⚡" },
              { title: "Digital Nomads", desc: "Time-zone-proof life, anywhere in the world", emoji: "🌍" },
              { title: "Everyday Organizers", desc: "Groceries, bills, birthdays — never forget again", emoji: "❤️" }
            ].map((persona) => (
              <div key={persona.title} className="bg-white/70 backdrop-blur rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all">
                <div className="text-5xl mb-4">{persona.emoji}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{persona.title}</h3>
                <p className="text-gray-600">{persona.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Examples */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Real Things You’ll Say to Whisone</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              "Summarize my inbox and pull action items",
              "Find that budget email from Anthony last quarter",
              "Draft a polite follow-up to Sarah about the contract",
              "What meetings do I have tomorrow?",
              "Remind me to pay rent every 1st of the month",
              "Show me notes from my Portugal trip",
              "What did I accomplish this week?",
              "Flag any high-value leads in unread emails"
            ].map((example) => (
              <div key={example} className="flex gap-4 items-start bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
                <MessageCircle className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
                <p className="text-lg text-gray-800 font-medium">“{example}”</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Quote className="w-16 h-16 text-indigo-300 mx-auto mb-8" />
          <p className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
            “I closed my biggest deal ever because Whisone found a buried email in 3 seconds.”
          </p>
          <p className="text-xl text-gray-600">— Alex R., Serial Founder (Beta User)</p>
          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-600">5–9 hrs</div>
              <div className="text-gray-600">saved weekly</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">95%</div>
              <div className="text-gray-600">fewer missed priorities</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">1 app</div>
              <div className="text-gray-600">replaces 7 tools</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl lg:text-6xl font-bold mb-8">
            Turn WhatsApp Into Your Second Brain — Today
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Limited to 500 early users. Join the waitlist in 30 seconds.
          </p>
          <button
            onClick={handleGetEarlyAccess}
            className="px-12 py-6 bg-white text-indigo-600 text-xl font-bold rounded-full shadow-2xl hover:shadow-white/50 transition-all inline-flex items-center gap-4"
          >
            Claim Your Spot Now <ArrowRight className="w-6 h-6" />
          </button>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm opacity-80">
            <Shield className="w-5 h-5" />
            <span>Your data never leaves WhatsApp • End-to-end encrypted • Zero spam</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">© 2025 Whisone • Your AI Agent Inside WhatsApp</p>
        </div>
      </footer>
    </div>
  );
}