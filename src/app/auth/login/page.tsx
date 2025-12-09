// app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MessageCircle, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { login, actionLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card with Glass Effect */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(16,185,129,0.15)] border border-white/30 overflow-hidden">
          {/* Header Section with Gradient */}
          <div className="relative px-8 pt-10 pb-8 bg-gradient-to-br from-emerald-50/80 via-white/50 to-teal-50/60">
            <div className="text-center">
              {/* Logo with Subtle Animation */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-5 shadow-lg shadow-emerald-500/25 transform hover:scale-105 transition-transform duration-300">
                <MessageCircle className="w-9 h-9 text-white" strokeWidth={2.5} />
              </div>
              
              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                Welcome back
              </h1>
              <p className="text-base text-gray-600">
                Sign in to continue to Whisone AI
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-8 pb-8 pt-6 relative">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">!</span>
                </div>
                <span className="flex-1 leading-relaxed">{error}</span>
              </div>
            )}

            {/* Form Container */}
            <div className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 pl-1">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-200" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={actionLoading}
                    required
                    autoFocus
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 pl-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-200" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={actionLoading}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmit(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={actionLoading}
                className="relative w-full mt-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-base rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a
                  href="/auth/register"
                  className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors underline decoration-emerald-600/30 underline-offset-4 hover:decoration-emerald-600/60"
                >
                  Get early access
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 pt-4 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500 leading-relaxed">
              By signing in, you agree to our{" "}
              <a href="#" className="text-gray-700 underline hover:text-gray-900 transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-gray-700 underline hover:text-gray-900 transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Powered by{" "}
            <span className="font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Whisone
            </span>
            {" "}— Your AI Agent on WhatsApp
          </p>
        </div>
      </div>
    </div>
  );
}