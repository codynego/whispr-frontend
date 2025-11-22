// app/dashboard/settings/layout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, 
  Bell, 
  Brain, 
  Settings, 
  Link2, 
  ChevronDown,
  Sparkles
} from "lucide-react";

const navItems = [
  { name: "Account", href: "/dashboard/settings/account", icon: User },
  { name: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
  { name: "Assistant Personality", href: "/dashboard/settings/personality", icon: Brain },
  { name: "Rules & Automations", href: "/dashboard/settings/rules", icon: Settings },
  { name: "Integrations", href: "/dashboard/settings/integrations", icon: Link2 },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = navItems.find(item => pathname === item.href) || navItems[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Row */}
          <div className="flex items-center gap-4 py-6">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500">Customize your second brain</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 -mb-px">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    relative flex items-center gap-2 px-4 py-3 text-sm font-medium
                    transition-all duration-200 border-b-2
                    ${isActive
                      ? "border-emerald-600 text-emerald-700"
                      : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : ""}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Dropdown */}
          <div className="md:hidden pb-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl text-left"
            >
              <div className="flex items-center gap-3">
                <activeItem.icon className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-gray-900">{activeItem.name}</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
            </button>

            {mobileOpen && (
              <div className="absolute left-4 right-4 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`
                        flex items-center gap-3 px-5 py-4 text-sm font-medium
                        transition-colors border-b border-gray-50 last:border-0
                        ${isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-gray-600 hover:bg-gray-50"
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
                      <span>{item.name}</span>
                      {isActive && <div className="ml-auto w-2 h-2 bg-emerald-600 rounded-full" />}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto lg:px-8 lg:py-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 lg:p-12">
          {children}
        </div>

        {/* Help Card */}
        <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
          <p className="text-sm font-semibold text-emerald-900 mb-1">Need help?</p>
          <p className="text-xs text-emerald-700">
            We&apos;re here 24/7. Just say &quot;help&quot; to your assistant.
          </p>
        </div>
      </main>
    </div>
  );
}