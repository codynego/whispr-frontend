// app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MessageCircle, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { login, actionLoading } = useAuth();

  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      await login(email.trim(), password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-12 overflow-hidden relative">
          {/* Optional subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-teal-50/30 pointer-events-none" />

          <div className="relative z-10">
            {/* Logo & Heading */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-3xl mb-6 shadow-lg">
                <MessageCircle className="w-11 h-11 text-emerald-600" />
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                Welcome back
              </h1>
              <p className="mt-3 text-lg text-gray-600 font-light">
                Sign in to your Whisone AI second brain
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-8 p-4 bg-red-50/80 backdrop-blur border border-red-200 text-red-700 rounded-2xl text-sm flex items-center gap-3 animate-in slide-in-from-top-2">
                <div className="w-5 h-5 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">!</span>
                </div>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-7 relative">
              {/* Overlay when loading */}
              {actionLoading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-600">Signing you in...</p>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="relative group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={actionLoading}
                    required
                    autoFocus
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-5 py-4 bg-gray-50/70 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 disabled:opacity-60 disabled:cursor-not-allowed group-hover:border-gray-300"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="relative group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={actionLoading}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-12 pr-5 py-4 bg-gray-50/70 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 disabled:opacity-60 disabled:cursor-not-allowed group-hover:border-gray-300"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full mt-10 py-5 bg-emerald-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </>
                  )}
                </span>
                {/* Shine effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-white/20" />
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-10 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <a
                  href="/auth/register"
                  className="font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-4 hover:underline-offset-2 transition-all"
                >
                  Get early access
                </a>
              </p>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <p className="text-center text-xs text-gray-500 leading-relaxed">
                By signing in, you agree to our{" "}
                <a href="#" className="underline hover:text-gray-700 transition">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="underline hover:text-gray-700 transition">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="text-center mt-10">
          <p className="text-sm text-gray-500 font-medium">
            Powered by{" "}
            <span className="font-bold text-emerald-600">Whisone</span> — Your AI Agent on WhatsApp
          </p>
        </div>
      </div>
    </div>
  );
}