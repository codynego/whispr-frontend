"use client";

import { Quote, Zap, MessageCircle, ArrowRight, Check, Brain, Sparkles, BookOpen, Briefcase, Heart } from "lucide-react";

export default function WhisoneLandingPage() {
  const handleGetEarlyAccess = () => {
    window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSe0yuPAgMhQaF9tEVrgfGq2hhZmmCazCbfR_5_uni52llufIQ/viewform?usp=publish-editor";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-emerald-600" />
              <div className="text-2xl font-bold text-gray-900">Whisone</div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#avatars" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Avatars</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">How It Works</a>
            </nav>
            <button
              onClick={handleGetEarlyAccess}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-md"
            >
              Get Started
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
                <span className="text-sm font-semibold text-emerald-700">Specialized AI Memory on WhatsApp</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight">
                Your Brain Moves Fast. Now, Your Digital Memory Can Too.
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Stop losing those brilliant ideas and crucial details. Whisone transforms WhatsApp into a personal, context-aware AI that organizes your life as you live it.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetEarlyAccess}
                  className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all text-center flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  Start Free on WhatsApp
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-md">
                  See How It Works
                </button>
              </div>
            </div>

            {/* Demo Mockup - Conversation remains clear and illustrative */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-700">Save to Study Partner: Mitochondria is the powerhouse of the cell</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <p className="text-sm text-gray-800">
                      <strong className="text-emerald-700">Study Partner:</strong> ✅ Saved to Biology notes. Want me to quiz you on cellular biology later?
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-700">What did I learn about cells?</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <p className="text-sm text-gray-800">
                      <strong className="text-emerald-700">Study Partner:</strong> You noted that mitochondria is the powerhouse of the cell (saved today). You also have 3 other cellular biology notes from this week.
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

      {/* The Problem */}
      <section className="py-16 bg-gradient-to-r from-slate-100 to-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center">
            Why You're Still Losing Thoughts (Even with all your apps)
          </h2>
          <div className="space-y-4 text-lg text-gray-700 max-w-3xl mx-auto">
            <p className="text-center">
              That brilliant thought in the car, the critical work decision, or the quiet intention you set—they get swallowed by the digital static. We’re constantly context-switching between notes, tasks, and chat apps, wasting time and mental energy.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8 pt-4">
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
                <p className="text-gray-800 font-medium">😤 App Fatigue: Too many apps, zero connection between them.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
                <p className="text-gray-800 font-medium">⏱️ Context Loss: Notes are filed by *keywords*, not by *meaning*.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
                <p className="text-gray-800 font-medium">🤔 Friction: Recording a thought takes 4 steps; it should take 1.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              The Seamless Solution: Specialization is Memory.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We eliminate friction by turning the world's most familiar chat app (WhatsApp) into a high-powered memory stream. You talk, we organize, and we *understand* the context perfectly.
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-6">
              This is not just storage. This is proactive, contextual intelligence.
            </p>
          </div>
        </div>
      </section>

      {/* Specialized Avatars */}
      <section id="avatars" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Your Avatars: Dedicated Memory Specialists
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stop throwing every thought into one messy inbox. Each Whisone Avatar is a specialist, trained to process the specific data in its domain, making retrieval instant and accurate.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Study Partner */}
            <div className="relative p-8 bg-white rounded-2xl border-2 border-purple-200 hover:shadow-xl transition-all shadow-md">
              <div className="inline-flex p-3 bg-purple-100 rounded-xl mb-4">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">The Study Buddy</h3>
              <p className="text-sm text-purple-600 font-semibold mb-3">Academic rigor meets conversational ease.</p>
              <p className="text-gray-700 mb-4">Turns lectures, articles, and scribbles into personalized quizzes and structured review materials. Master any subject, hands-free.</p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Converts voice notes into study cards</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Tracks assignments and reading lists</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Quizzes you on demand based on your notes</span>
                </li>
              </ul>
              <div className="mt-6 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-xs text-gray-700">
                  <span className="font-semibold">Query:</span> "Quiz me on last week's biology notes about cells"
                </p>
              </div>
            </div>

            {/* Project Manager */}
            <div className="relative p-8 bg-white rounded-2xl border-2 border-emerald-200 hover:shadow-xl transition-all shadow-md">
              <div className="inline-flex p-3 bg-emerald-100 rounded-xl mb-4">
                <Briefcase className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">The Action Tracker</h3>
              <p className="text-sm text-emerald-600 font-semibold mb-3">The proactive forward planner.</p>
              <p className="text-gray-700 mb-4">It catches tasks buried in team chats, predicts delays, and proactively reminds you what to do next, not just what you wrote down.</p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Converts loose team texts into tasks and deadlines</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Anticipates dependency and deadline conflicts</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Tracks who is waiting on what for project milestones</span>
                </li>
              </ul>
              <div className="mt-6 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-xs text-gray-700">
                  <span className="font-semibold">Query:</span> "What's blocking the website launch?"
                </p>
              </div>
            </div>

            {/* Reflection Keeper */}
            <div className="relative p-8 bg-white rounded-2xl border-2 border-pink-200 hover:shadow-xl transition-all shadow-md">
              <div className="inline-flex p-3 bg-pink-100 rounded-xl mb-4">
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">The Personal Journal</h3>
              <p className="text-sm text-pink-600 font-semibold mb-3">Your secure, emotional memory vault.</p>
              <p className="text-gray-700 mb-4">A private, secure space for your deepest thoughts and personal goals. Search by emotion, event, or theme, without ever needing a keyword.</p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Stores highly private and sensitive notes securely</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Retrieves memories based on conversational context</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>No keywords needed—just tell it what you need</span>
                </li>
              </ul>
              <div className="mt-6 p-3 bg-pink-50 rounded-lg border border-pink-200">
                <p className="text-xs text-gray-700">
                  <span className="font-semibold">Query:</span> "Show me my most grateful moments from last quarter"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Magic */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The Core Magic: Capture Without Friction.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our system is built on two simple promises: making capture invisible, and making retrieval smarter than any search bar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Instant Capture */}
            <div className="space-y-6">
              <div className="inline-flex p-4 bg-emerald-100 rounded-xl">
                <Zap className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">1. Instant Capture</h3>
              <p className="text-lg text-gray-600 font-medium">Talk, Text, Forward. Done.</p>
              <p className="text-gray-700">
                Just send a voice note, text, or forward a message to your dedicated avatar. The AI handles the entire process—transcription, parsing, tagging, and filing—in less than a second. No app switching required.
              </p>
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-gray-700 mb-2">💬 <strong>Voice note:</strong> "Project Manager, I need to ship the design assets by Friday."</p>
                <p className="text-sm text-emerald-700">✅ Instantly saved as a High-Priority Task for the 'Design' project with a Friday deadline.</p>
              </div>
            </div>

            {/* Smart Search */}
            <div className="space-y-6">
              <div className="inline-flex p-4 bg-blue-100 rounded-xl">
                <Brain className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">2. Contextual Recall</h3>
              <p className="text-lg text-gray-600 font-medium">Ask Naturally. Retrieve Perfectly.</p>
              <p className="text-gray-700">
                You don't need keywords; you need meaning. Ask your avatar a question in plain English (or a voice note) and it uses time, relationship, and subject context to find exactly what you need.
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">"What did I tell Jane about the budget when we were discussing the Q3 goals?"</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">"Retrieve the recipe I saved last time I was feeling stressed about work."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              It’s So Simple, It Just Works.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three steps to a frictionless, organized life—all inside WhatsApp.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex w-16 h-16 mx-auto bg-emerald-100 rounded-full items-center justify-center text-2xl font-extrabold text-emerald-600 border-4 border-emerald-300 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Start a Chat</h3>
              <p className="text-gray-600">Open WhatsApp and select the dedicated avatar (e.g., Study Buddy, Action Tracker) for the context you need.</p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex w-16 h-16 mx-auto bg-blue-100 rounded-full items-center justify-center text-2xl font-extrabold text-blue-600 border-4 border-blue-300 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Capture the Thought</h3>
              <p className="text-gray-600">Send a voice note, text, or image. The AI instantly processes, organizes, and files the memory.</p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex w-16 h-16 mx-auto bg-purple-100 rounded-full items-center justify-center text-2xl font-extrabold text-purple-600 border-4 border-purple-300 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Ask & Recall</h3>
              <p className="text-gray-600">Ask naturally when you need it. Get the answer, the task, or the context instantly—no digging required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-8 sm:p-12 shadow-xl border border-emerald-200">
            <Quote className="w-10 h-10 text-emerald-600 mb-6" />
            <blockquote className="text-xl sm:text-2xl text-gray-700 mb-6 leading-relaxed italic">
              "The Action Tracker is the only productivity tool that keeps up with the chaos of my small business. I don't have time to open Trello; I just forward a WhatsApp message and the task is filed, prioritized, and scheduled. It's actually life-changing."
            </blockquote>
            <cite className="text-gray-600 font-bold not-italic">— Michael V., Startup Founder & Beta User</cite>
          </div>
        </div>
      </section>

      {/* Real Example */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              A Glimpse of True Organization
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real conversations with your Action Tracker avatar
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex justify-end">
                <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs shadow-md">
                  <p className="text-sm">Forwarding Jane's message: "Client meeting with TechCorp next Tuesday at 2pm. Discuss pricing and timeline."</p>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs border border-gray-200 shadow-md">
                  <p className="text-sm text-gray-700"><strong className="text-emerald-600">Action Tracker:</strong> ✅ Meeting saved in CRM. I'll remind you Monday at 5pm to prepare the pricing deck. Anything else?</p>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs shadow-md">
                  <p className="text-sm">What do I need to finish *today*?</p>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-md border border-gray-200 shadow-md">
                  <p className="text-sm text-gray-700 mb-2"><strong className="text-emerald-600">Action Tracker:</strong> You have 3 pending items for today:</p>
                  <ul className="text-sm text-gray-700 space-y-1 ml-2">
                    <li>• <strong>Urgent:</strong> Finalize TechCorp pricing deck (Due today)</li>
                    <li>• <strong>Follow-up:</strong> Check in with Tom regarding his website review (3 days overdue)</li>
                    <li>• <strong>Personal:</strong> Send birthday card to Dad (Flagged this morning)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-700 to-blue-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            Close the Gap Between Thinking and Doing.
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Stop spending mental energy managing tools and focus on your work, your studies, or your peace. Join the early access program and experience unmatched simplicity and powerful specialization.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleGetEarlyAccess}
              className="px-10 py-5 bg-white text-emerald-700 font-bold text-lg rounded-xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all transform"
            >
              Try Seamless Conversational Memory Today →
            </button>
            <p className="text-sm text-emerald-200 font-medium">
              ⚡ Get Started Via WhatsApp • No credit card required
            </p>
            <p className="text-xs text-emerald-300 max-w-md mx-auto opacity-75">
              🔒 Your data stays private. Enterprise-grade security. We never share or sell your information.
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
              Specialized AI memory streams on WhatsApp. Capture at the speed of thought. Recall instantly.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm">© 2025 Whisone. Built for people who think fast and live fully.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}