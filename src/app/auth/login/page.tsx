"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MessageCircle, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading: authLoading } = useAuth();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-700 p-12 flex-col justify-between">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Whisone</span>
          </div>
          
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            Your AI Second Brain
          </h2>
          <p className="text-emerald-50 text-lg leading-relaxed max-w-md">
            Access your personalized AI assistant directly through WhatsApp. 
            Remember everything, accomplish more.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span>Always Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Whisone</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Welcome back
            </h1>
            <p className="text-gray-600 text-base mb-8">
              Sign in to continue to your account
            </p>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Authentication Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={authLoading}
                    required
                    autoFocus
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label 
                    htmlFor="password" 
                    className="block text-sm font-semibold text-gray-900"
                  >
                    Password
                  </label>
                  <a 
                    href="/auth/forgot-password" 
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Forgot?
                  </a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={authLoading}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full mt-6 py-3.5 bg-emerald-600 text-white font-semibold text-base rounded-xl shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
              >
                {authLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    New to Whisone?
                  </span>
                </div>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <a
                href="/auth/register"
                className="inline-flex items-center justify-center w-full py-3.5 px-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Create an account
              </a>
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-gray-500">
              By continuing, you agree to Whisone's{" "}
              <a href="#" className="text-emerald-600 hover:text-emerald-700 underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-emerald-600 hover:text-emerald-700 underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}