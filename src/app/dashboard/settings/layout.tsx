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
  Menu, 
  X,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar — Fixed & Always Visible on Desktop */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-80
          bg-white border-r border-gray-100 shadow-2xl lg:shadow-none
          transition-transform duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-sm text-gray-600">Customize your second brain</p>
                  </div>
                </div>
                {mobileOpen && (
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden p-3 rounded-xl hover:bg-gray-100 transition"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 py-8 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      group relative flex items-center gap-5 px-6 py-4 rounded-2xl text-base font-medium
                      transition-all duration-200
                      ${isActive
                        ? "bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-600/10"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-600 rounded-r-full" />
                    )}
                    <div className={`
                      p-3 rounded-2xl transition-all
                      ${isActive 
                        ? "bg-emerald-100 text-emerald-700 shadow-sm" 
                        : "bg-gray-100 text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-600"
                      }
                    `}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="tracking-wide">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-8 border-t border-gray-100">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                <p className="text-sm font-semibold text-emerald-900 mb-1">Need help?</p>
                <p className="text-xs text-emerald-700">
                  We’re here 24/7. Just say “help” to your assistant.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          {/* Mobile Header */}
          <div className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-gray-100">
            <div className="flex items-center justify-between px-6 py-5">
              <h2 className="text-xl font-bold text-gray-900">Settings</h2>
              <button
                onClick={() => setMobileOpen(true)}
                className="p-3 rounded-xl hover:bg-gray-100 transition"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Page Content */}
          <div className="max-w-4xl mx-auto px-6 py-10 lg:py-16">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-12">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}