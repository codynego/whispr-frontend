// components/Header.jsx
"use client"
import { useState } from "react";
import { Mail, Search, Send, FileText, Calendar, CheckCircle, Users, Quote, Zap, Bell, MessageCircle, ArrowRight, Check } from "lucide-react"; // Import if needed elsewhere, but minimal for header

export default function Header({ showNav = true, ctaText = "Get Early Access", ctaHref = "/signup" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // For potential mobile menu, but keeping simple

  const handleGetEarlyAccess = () => {
    window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSe0yuPAgMhQaF9tEVrgfGq2hhZmmCazCbfR_5_uni52llufIQ/viewform?usp=publish-editor";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="text-2xl font-bold text-gray-900">Whisone</div>
          {showNav && (
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
            </nav>
          )}
          <a
            href={ctaHref}
            onClick={ctaHref === "/signup" ? undefined : handleGetEarlyAccess}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {ctaText}
          </a>
        </div>
      </div>
    </header>
  );
}