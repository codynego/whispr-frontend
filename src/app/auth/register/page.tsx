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
  Check,
} from "lucide-react";

export default function RegisterPage() {
  const { register, actionLoading } = useAuth();
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
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (pwd.length === 0) return { strength: 0, label: "" };
    if (pwd.length < 8) return { strength: 1, label: "Weak", color: "bg-red-500" };
    if (pwd.length < 12) return { strength: 2, label: "Fair", color: "bg-yellow-500" };
    if (pwd.length >= 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd))
      return { strength: 3, label: "Strong", color: "bg-emerald-500" };
    return { strength: 2, label: "Fair", color: "bg-yellow-500" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Main Card with Glass Effect */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(16,185,129,0.15)] border border-white/30 overflow-hidden">
          {/* Header Section with Gradient */}
          <div className="relative px-8 pt-10 pb-8 bg-gradient-to-br from-emerald-50/80 via-white/50 to-teal-50/60">
            <div className="text-center">
              {/* Logo */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-5 shadow-lg shadow-emerald-500/25 transform hover:scale-105 transition-transform duration-300">
                <MessageCircle className="w-9 h-9 text-white" strokeWidth={2.5} />
              </div>
              
              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                Join Whisone
              </h1>
              <p className="text-base text-gray-600">
                Start your AI second brain on WhatsApp
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
            <div className="space-y-5 relative">
              {/* Loading Overlay */}
              {actionLoading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl z-20 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">Creating your account...</p>
                  </div>
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 pl-1">
                    First Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-200" />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={actionLoading}
                      required
                      placeholder="John"
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 pl-1">
                    Last Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-200" />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={actionLoading}
                      placeholder="Doe"
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 pl-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-200" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={actionLoading}
                    required
                    placeholder="john@example.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 pl-1">
                  WhatsApp Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-200" />
                  </div>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    disabled={actionLoading}
                    required
                    placeholder="+1234567890"
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                  />
                </div>
                <p className="text-xs text-gray-500 pl-1">
                  Your AI agent will be sent here — ensure it's active
                </p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 pl-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-200" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={actionLoading}
                    required
                    placeholder="Create a strong password"
                    className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength.strength
                              ? passwordStrength.color
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    {passwordStrength.label && (
                      <p className="text-xs text-gray-600 pl-1">
                        Password strength: <span className="font-medium">{passwordStrength.label}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 pl-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-200" />
                  </div>
                  <input
                    type={showPasswordConfirm ? "text" : "password"}
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    disabled={actionLoading}
                    required
                    placeholder="Confirm your password"
                    className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.passwordConfirm && formData.password === formData.passwordConfirm && (
                  <div className="flex items-center gap-1.5 text-emerald-600 pl-1">
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-medium">Passwords match</span>
                  </div>
                )}
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
                      <span>Creating your account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a
                  href="/auth/login"
                  className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors underline decoration-emerald-600/30 underline-offset-4 hover:decoration-emerald-600/60"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 pt-4 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500 leading-relaxed">
              By registering, you agree to our{" "}
              <a href="#" className="text-gray-700 underline hover:text-gray-900 transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-gray-700 underline hover:text-gray-900 transition-colors">
                Privacy Policy
              </a>
              . Your data is encrypted and never shared.
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