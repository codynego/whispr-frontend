"use client"
import { useState } from "react";
import { Mail, Search, Send, FileText, Calendar, CheckCircle, Users, Quote, Zap, Bell } from "lucide-react";

interface FormData {
  name: string;
  email: string;
}

export default function WhisprLandingPage() {
  const [formData, setFormData] = useState<FormData>({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Early access signup:", formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: "", email: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold text-gray-900">Whispr</div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
            </nav>
            <a
              href="#signup"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Early Access
            </a>
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
                The AI That Catches What You'd Miss
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Context-aware alerts, instant search, AI replies, and automatic task extraction—so important emails never slip by.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#signup" className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all text-center">
                  Reserve Your Spot →
                </a>
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
                    <p className="text-sm text-gray-700 font-mono">@summarize client emails this week</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-gray-800">
                      <strong className="text-blue-700">Whispr:</strong> 3 clients replied—Sarah confirmed the project scope, Mark requested timeline changes (needs response by Friday), and Lisa sent contract revisions.
                    </p>
                    <div className="p-3 bg-white rounded-lg border-l-4 border-blue-500">
                      <p className="text-xs text-gray-500 mb-2">Suggested reply to Mark:</p>
                      <p className="text-sm text-gray-700">"Got it—reviewing the timeline now. I'll send updated dates by Thursday EOD."</p>
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

      {/* Problem Statement */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            You're Drowning in Email—And Missing What Matters
          </h2>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
            Critical messages get buried. Long threads eat hours. Follow-ups fall through cracks. Whispr fixes all three.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-xl bg-gray-50">
              <Mail className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Buried Priorities</h3>
              <p className="text-gray-600">Important emails lost in noise—you miss deadlines and opportunities.</p>
            </div>
            <div className="p-6 rounded-xl bg-gray-50">
              <Zap className="w-10 h-10 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Time Waste</h3>
              <p className="text-gray-600">Hours reading threads, drafting replies, and switching contexts.</p>
            </div>
            <div className="p-6 rounded-xl bg-gray-50">
              <CheckCircle className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Dropped Tasks</h3>
              <p className="text-gray-600">Action items buried in messages—nothing gets tracked or done.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Chat Naturally—Whispr Does the Rest
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No complicated setup. Just type what you need, and Whispr handles the heavy lifting.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Alerts</h3>
                  <p className="text-gray-600">Context-aware notifications surface urgent emails the moment they arrive—critical messages never get buried.</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <Search className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">@find</h3>
                  <p className="text-gray-600">Lightning-fast search pinpoints any email or thread in seconds—no more inbox archaeology.</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Send className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">@reply / @send</h3>
                  <p className="text-gray-600">AI-drafted responses in your voice—review, refine, and send to keep conversations moving.</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">@summarize</h3>
                  <p className="text-gray-600">Instant digests of long threads—turn hours of back-and-forth into clear, actionable insights.</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">@task / @meeting</h3>
                  <p className="text-gray-600">One-tap action extraction—convert emails into tasks, reminders, or calendar events automatically.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
            Built for People Who Can't Afford to Miss Anything
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Whether you're managing clients, leading teams, or juggling projects—Whispr keeps you in control.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-blue-50 rounded-xl">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Busy Professionals</h3>
              <p className="text-gray-600">Cut through inbox noise with surgical precision—see only what demands your attention, nothing more.</p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-indigo-50 rounded-xl">
                <Zap className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Founders & Freelancers</h3>
              <p className="text-gray-600">Never drop a client ball again—get alerted to hot leads, send polished follow-ups, and turn emails into completed tasks.</p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-green-50 rounded-xl">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Teams & Leaders</h3>
              <p className="text-gray-600">Elevate team coordination with shared intelligence—catch urgent escalations, track commitments, and sync schedules effortlessly.</p>
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
              Whispr cut my email stress in half and gave me back a full day every week. I haven't missed a single important message since switching.
            </blockquote>
            <cite className="text-gray-600 font-semibold not-italic">— Alex Rivera, Serial Founder & Beta User</cite>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-gray-600 leading-relaxed">
                Early users reclaim <strong className="text-gray-900">5–7 hours weekly</strong>, and <strong className="text-gray-900">95%</strong> report zero missed priorities—join those turning inbox chaos into calm control.
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
              Get Whispr Before Spots Run Out
            </h2>
            <p className="text-lg text-gray-600">
              Secure early access and let Whispr handle your inbox: alerting you to what matters, summarizing endless threads, and drafting replies—all automatically.
            </p>
          </div>

          {!submitted ? (
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSubmit}
                className="w-full px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
              >
                Reserve Your Spot →
              </button>
              <p className="text-sm text-gray-500 text-center">
                Only 500 MVP slots available. Sign up in 30 seconds.
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <p className="text-xl font-semibold text-green-800 mb-2">You're on the list!</p>
              <p className="text-gray-600">We'll email you when early access opens.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2025 Whispr. Built for people who can't afford to miss anything.</p>
        </div>
      </footer>
    </div>
  );
}