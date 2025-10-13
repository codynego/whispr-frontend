"use client";

import { useState } from "react";
import { Mail, MessageCircle, Zap, CheckCircle, Users, Quote } from "lucide-react";

export default function WhisprLandingPage() {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission
    console.log("Early access signup:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full shadow-lg">
                  <MessageCircle className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">AI Communication Assistant</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Stop Drowning in Emails —
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Let Whispr Handle the Chaos.
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Your personal AI that reads, replies, summarizes, and syncs across Gmail and WhatsApp.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Whispr turns your cluttered inbox into a smart assistant. It understands what matters, summarizes long threads, replies for you, and helps you manage conversations — all in one place.
              </p>
              <div className="flex gap-4">
                <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                  Join Early Access
                </button>
                <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300">
                  Watch Demo
                </button>
              </div>
            </div>
            {/* Right: Mockup Visual */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-200">
                <div className="bg-gray-100 rounded-2xl p-4 mb-4">
                  <p className="text-sm text-gray-600 font-mono">User: @summarize the emails from my manager last week</p>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-4 mb-4">
                  <p className="text-sm text-indigo-800"><strong>Whispr:</strong> Here's a quick summary: Your manager sent 3 updates on Q4 goals, 1 feedback on your report (positive overall), and 1 meeting invite for Oct 15. Key action: Review attached deck by EOD Friday.</p>
                  <div className="mt-3 p-3 bg-white rounded-lg border-l-4 border-indigo-500">
                    <p className="text-xs text-gray-600 mb-2">Suggested Reply:</p>
                    <p className="text-sm font-medium">"Thanks for the updates—I'll review the deck today and confirm the meeting."</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-indigo-600 text-white text-xs rounded-lg">Send Reply</button>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-20 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Managing Emails and Messages is a Daily Struggle</h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Professionals waste hours switching between apps, scanning long threads, and replying manually. Whispr solves this by letting you <em>talk to your inbox</em> — just like messaging a friend.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Mail className="w-12 h-12 text-indigo-600 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">App Overload</h3>
              <p className="text-gray-600">Jumping between Gmail, WhatsApp, and Slack kills focus.</p>
            </div>
            <div className="space-y-4">
              <Zap className="w-12 h-12 text-purple-600 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">Time Drain</h3>
              <p className="text-gray-600">Hours lost reading endless threads and drafting replies.</p>
            </div>
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">Missed Actions</h3>
              <p className="text-gray-600">Important tasks buried in noise — leading to missed deadlines.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How Whispr Solves It</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">@find</h3>
                <p className="text-gray-600">“@find emails from John last week” → Finds specific threads instantly.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">@send / @reply</h3>
                <p className="text-gray-600">“@reply John thanks for the update.” → Whispr crafts and sends your reply.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">@summarize</h3>
                <p className="text-gray-600">“@summarize last conversation with HR” → Gives you a clear summary.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">@task / @meeting</h3>
                <p className="text-gray-600">Turns messages into to-dos or meeting notes.</p>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-8 text-lg italic">
            No learning curve. Just type naturally — Whispr handles the logic.
          </p>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Built for Busy Communicators</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <Users className="w-12 h-12 text-indigo-600 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">Busy Professionals</h3>
              <p className="text-gray-600">Drowning in communication across multiple channels.</p>
            </div>
            <div className="text-center space-y-4">
              <Users className="w-12 h-12 text-purple-600 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">Founders & Freelancers</h3>
              <p className="text-gray-600">Managing client emails, DMs, and tasks solo.</p>
            </div>
            <div className="text-center space-y-4">
              <Users className="w-12 h-12 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">Productive Teams</h3>
              <p className="text-gray-600">Want smart tools without the complexity of enterprise software.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Quote className="w-12 h-12 text-gray-400 mx-auto mb-6" />
          <blockquote className="text-xl text-gray-700 italic mb-6">
            “It’s like having ChatGPT inside Gmail — but smarter.”
          </blockquote>
          <cite className="text-gray-500 font-semibold">— Beta Tester, ALX Founder Cohort</cite>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join the Early Access List</h2>
          <p className="text-lg text-gray-600 mb-8">
            Get early access to Whispr’s MVP before public launch.
          </p>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <button
                type="submit"
                className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Join Early Access
              </button>
            </form>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-green-800">Thanks for joining!</p>
              <p className="text-gray-600 mt-2">We'll notify you when early access opens.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Whispr. Built with ❤️ for ALX Founder Academy.</p>
        </div>
      </footer>
    </div>
  );
}