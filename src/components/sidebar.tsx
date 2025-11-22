"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  BarChart2,
  Sparkles,
  Inbox,
  Bell,
  CheckSquare,
  FileText,
  User,
  Settings,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;        // Desktop: collapsed or expanded
  mobileOpen: boolean;     // Mobile: overlay open or closed
  isMobile: boolean;
  toggleSidebar: () => void;
  closeMobile?: () => void;
}

export default function Sidebar({
  isOpen = true,
  mobileOpen,
  isMobile,
  toggleSidebar,
  closeMobile,
}: SidebarProps) {
  const pathname = usePathname();

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    if (isMobile && mobileOpen) {
      closeMobile?.() || toggleSidebar();
    }
  }, [pathname, isMobile, mobileOpen, closeMobile, toggleSidebar]);

  const navItems = [
    { name: "Overview", icon: BarChart2, href: "/dashboard/overview" },
    { name: "Assistant", icon: Sparkles, href: "/dashboard/assistant" },
    { name: "Inbox", icon: Inbox, href: "/dashboard/inbox" },
    { name: "Reminders", icon: Bell, href: "/dashboard/reminders" },
    { name: "Todos", icon: CheckSquare, href: "/dashboard/todos" },
    { name: "Notes", icon: FileText, href: "/dashboard/notes" },
    { name: "Profile", icon: User, href: "/dashboard/profile" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  // Close mobile menu on nav click
  const handleNavClick = () => {
    if (isMobile && mobileOpen) {
      closeMobile?.() || toggleSidebar();
    }
  };

  const width = !isMobile && !isOpen ? "w-20" : "w-72";
  const hideLabels = !isMobile && !isOpen;

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex flex-col
        bg-slate-900 text-gray-100
        border-r border-slate-800
        transition-all duration-300 ease-out
        ${isMobile 
          ? mobileOpen ? "translate-x-0" : "-translate-x-full" 
          : "translate-x-0"
        }
        ${width}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <div className={`flex items-center gap-4 transition-all duration-300 ${hideLabels ? "justify-center" : ""}`}>
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg ring-4 ring-blue-600/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          {!hideLabels && (
            <h1 className="text-2xl font-bold text-white">Whisone</h1>
          )}
        </div>

        {/* Close button (mobile only) */}
        {isMobile && mobileOpen && (
          <button
            onClick={toggleSidebar}
            className="p-2.5 rounded-xl hover:bg-white/10 transition lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation — No scrollbar, perfect fit */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-hidden">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={`
                  group relative flex items-center gap-4
                  px-4 py-3.5 rounded-2xl text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30"
                    : "text-gray-400 hover:bg-slate-800 hover:text-white"
                  }
                  ${hideLabels ? "justify-center px-3" : ""}
                `}
              >
                {/* Active bar */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-r-full" />
                )}

                <div className={`transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "group-hover:text-white"}`} />
                </div>

                {!hideLabels && (
                  <span className="tracking-wide">{item.name}</span>
                )}

                {/* Tooltip when collapsed (desktop only) */}
                {hideLabels && !isMobile && (
                  <div className="absolute left-full ml-4 px-4 py-2 bg-slate-800 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-slate-700 transition-opacity">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer — always visible */}
      <div className="p-6 border-t border-slate-800">
        <p className={`text-xs text-center text-slate-500 transition-all duration-300 ${hideLabels ? "opacity-0" : "opacity-100"}`}>
          © 2025 Whisone
          <span className="text-blue-500 mx-1">♥</span>
          Made for you
        </p>
      </div>
    </aside>
  );
}