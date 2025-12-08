// app/auth/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  MessageCircle,
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function RegisterPage() {
  const { register, actionLoading } = useAuth(); // Use actionLoading from context!
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    whatsapp: "",
    password: "",
    passwordConfirm: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { firstName, email, password, passwordConfirm, whatsapp } = formData;

    if (!firstName.trim()) return "First name is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== passwordConfirm) return "Passwords do not match.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Please enter a valid email address.";
    if (!/^[\+]?[1-9]\d{1,14}$/.test(whatsapp.replace(/\s/g, "")))
      return "Enter a valid WhatsApp number (e.g. +1234567890)";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await register({
        email: formData.email.trim(),
        password: formData.password,
        password_confirm: formData.passwordConfirm,
        whatsapp: formData.whatsapp.replace(/\s/g, ""),
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
      });
      // Success → redirect handled by context
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-12 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-teal-50/30 pointer-events-none" />

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-3xl mb-6 shadow-lg">
                <MessageCircle className="w-11 h-11 text-emerald-600" />
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                Join Whisone
              </h1>
              <p className="mt-3 text-lg text-gray-600 font-light">
                Start your second brain on WhatsApp — it takes 30 seconds
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
            <form onSubmit={handleSubmit} className="space-y-6 relative">
              {/* Loading Overlay */}
              {actionLoading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl z-20 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">Creating your second brain...</p>
                  </div>
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-5">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="John"
                      className="w-full pl-12 pr-5 py-4 bg-gray-50/70 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder-gray-400 group-hover:border-gray-300 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className="w-full pl-12 pr-5 py-4 bg-gray-50/70 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder-gray-400 group-hover:border-gray-300 disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full pl-12 pr-5 py-4 bg-gray-50/70 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder-gray-400 group-hover:border-gray-300"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    required
                    placeholder="+1234567890"
                    className="w-full pl-12 pr-5 py-4 bg-gray-50/70 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder-gray-400 group-hover:border-gray-300"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  We’ll send your AI agent here — make sure it’s active!
                </p>
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-gray-50/70 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                  <input
                    type={showPasswordConfirm ? "text" : "password"}
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-gray-50/70 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  >
                    {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
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
                      Creating your account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-white/20" />
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-10 text-center">
              <p className="text-gray-600 text-sm">
                Already have early access?{" "}
                <a
                  href="/auth/login"
                  className="font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-4 hover:underline-offset-2 transition-all"
                >
                  Sign in here
                </a>
              </p>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <p className="text-center text-xs text-gray-500 leading-relaxed">
                By registering, you agree to our{" "}
                <a href="#" className="underline hover:text-gray-700 transition">Terms</a> and{" "}
                <a href="#" className="underline hover:text-gray-700 transition">Privacy Policy</a>.
                Your data is encrypted and never shared.
              </p>
            </div>
          </div>
        </div>

        {/* Brand */}
        <div className="text-center mt-10">
          <p className="text-sm text-gray-500 font-medium">
            Powered by <span className="font-bold text-emerald-600">Whisone</span> — Your AI Agent on WhatsApp
          </p>
        </div>
      </div>
    </div>
  );
}