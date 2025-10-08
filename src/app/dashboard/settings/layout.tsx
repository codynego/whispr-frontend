"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Bell, Brain, Link2, X, Menu } from "lucide-react";

const tabs = [
  { name: "Account", href: "/dashboard/settings/account", icon: User },
  { name: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
  { name: "Personality", href: "/dashboard/settings/personality", icon: Brain },
  { name: "Rules", href: "/dashboard/settings/rules", icon: Menu },
  { name: "Integrations", href: "/dashboard/settings/integrations", icon: Link2 },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 overflow-hidden">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static top-0 left-0 h-full w-80 max-w-[85%] sm:max-w-sm lg:w-72
        border-r border-gray-200 bg-white shadow-2xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full overflow-y-auto p-4 sm:p-6 flex flex-col">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Settings</h2>
              </div>
              <button
                onClick={closeSidebar}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-600 ml-1">Customize your Whispr experience</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              const Icon = tab.icon;
              
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  onClick={closeSidebar}
                  className={`
                    group relative flex items-center gap-3 p-3 sm:p-3.5 rounded-xl text-sm font-medium 
                    transition-all duration-200
                    ${isActive 
                      ? "bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200 shadow-sm" 
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-lg transition-colors flex-shrink-0
                    ${isActive 
                      ? "bg-indigo-100 text-indigo-600" 
                      : "bg-gray-100 text-gray-600 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                    }
                  `}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="flex-1">{tab.name}</span>
                  {isActive && (
                    <div className="absolute right-3 w-1 h-8 bg-indigo-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
              <p className="text-xs font-semibold text-indigo-900 mb-1">Need Help?</p>
              <p className="text-xs text-indigo-700">
                Visit our documentation or contact support for assistance.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
          {/* Mobile Header with Menu Button */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all hover:shadow-lg"
              aria-label="Open settings menu"
            >
              <Menu className="w-5 h-5" />
              <span className="text-sm font-medium">Settings Menu</span>
            </button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}