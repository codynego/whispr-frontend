// components/Header.jsx
"use client"
import { useState } from "react";
import { Menu, X} from "lucide-react";

export default function Header({ showNav = true, ctaText = "Get Early Access", ctaHref = "/signup" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleGetEarlyAccess = () => {
    window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSe0yuPAgMhQaF9tEVrgfGq2hhZmmCazCbfR_5_uni52llufIQ/viewform?usp=publish-editor";
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "#features", label: "Features" },
    { href: "#about", label: "About" },
    { href: "/pricing", label: "Pricing" }, // New: Pricing
    { href: "/blog", label: "Blog" }, // New: Blog
    { href: "/privacy", label: "Privacy" }, // New: Privacy Policy
    { href: "/terms", label: "Terms" }, // New: Terms of Service
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="text-2xl font-bold text-gray-900">Whisone</div>

          {/* Desktop Nav */}
          {showNav && (
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          {/* Desktop CTA */}
          <a
            href={ctaHref}
            onClick={ctaHref === "/signup" ? undefined : handleGetEarlyAccess}
            className="hidden md:block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {ctaText}
          </a>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="px-4 py-4 space-y-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block py-2 text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href={ctaHref}
              onClick={(e) => {
                handleGetEarlyAccess();
                setIsMenuOpen(false);
              }}
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors mt-4"
            >
              {ctaText}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}