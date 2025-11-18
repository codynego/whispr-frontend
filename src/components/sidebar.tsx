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
  MessageCircle,
  User,
  Settings,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;        // For desktop collapsed state
  mobileOpen: boolean;     // For mobile overlay
  isMobile: boolean;
  toggleSidebar: () => void;
  closeMobile?: () => void; // Optional: more explicit close
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
    { name: "Integrations", icon: MessageCircle, href: "/dashboard/settings/integrations" },
    { name: "Profile", icon: User, href: "/dashboard/profile" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  const handleNavClick = () => {
    if (isMobile) {
      closeMobile?.() || toggleSidebar();
    }
  };

  // Dynamic classes based on state
  const sidebarWidth = !isMobile && !isOpen ? "w-20" : "w-64";
  const showLabels = !isMobile && !isOpen ? "max-md:hidden" : "";

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 flex flex-col
    bg-gradient-to-b from-slate-900 via-slate-900 to-black
    text-gray-100 shadow-2xl border-r border-slate-800
    transition-all duration-300 ease-out
    ${isMobile
      ? mobileOpen ? "translate-x-0" : "-translate-x-full"
      : "translate-x-0"
    }
    ${sidebarWidth}
  `;

  return (
    <aside className={sidebarClasses}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <div className={`flex items-center gap-3 transition-all duration-300 ${!isOpen && !isMobile ? "justify-center" : ""}`}>
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg ring-2 ring-blue-500/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className={`text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent transition-opacity duration-300 ${showLabels}`}>
            Whisone
          </h1>
        </div>

        {/* Close button - only on mobile */}
        {isMobile && mobileOpen && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-white/10 transition-all backdrop-blur-sm"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-600">
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
                px-4 py-3.5 rounded-xl text-sm font-medium
                transition-all duration-200
                ${isActive
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl ring-2 ring-blue-500/30"
                  : "text-gray-400 hover:bg-slate-800/70 hover:text-white"
                }
                ${!isOpen && !isMobile ? "justify-center" : ""}
              `}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full" />
              )}

              <div className={`relative transition-all duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                <Icon className="w-5 h-5" />
              </div>

              <span className={`tracking-wide transition-all duration-300 ${showLabels}`}>
                {item.name}
              </span>

              {/* Tooltip when collapsed (desktop only) */}
              {!isOpen && !isMobile && (
                <span className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-5 border-t border-slate-800">
        <p className={`text-xs text-center text-slate-500 tracking-wider transition-all duration-300 ${showLabels}`}>
          © 2025 Whisone
          <span className="text-purple-400 mx-1">♥</span>
          Made for you
        </p>
      </div>
    </aside>
  );
}