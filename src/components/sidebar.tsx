"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  BarChart3,
  Sparkles,
  Inbox,
  Bell,
  CheckSquare,
  FileText,
  MessageCircle,
  User,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  mobileOpen: boolean;
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

  // Auto-close mobile menu on route change
  useEffect(() => {
    if (isMobile && mobileOpen) {
      closeMobile?.();
    }
  }, [pathname, isMobile, mobileOpen, closeMobile]);

  const navItems = [
    { name: "Overview", icon: BarChart3, href: "/dashboard/overview" },
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
    if (isMobile && mobileOpen) {
      closeMobile?.();
    }
  };

  const isCollapsed = !isMobile && !isOpen;
  const showLabels = !isCollapsed || isMobile;

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex flex-col
        bg-white/80 backdrop-blur-xl border-r border-gray-200/50
        shadow-2xl transition-all duration-300 ease-out
        ${isMobile ? (mobileOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
        ${isCollapsed ? "w-20" : "w-72"}
        lg:relative lg:z-auto
      `}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
        <div className={`flex items-center gap-4 transition-all duration-300 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="p-2.5 bg-emerald-100 rounded-2xl shadow-lg">
            <MessageCircle className="w-8 h-8 text-emerald-600" />
          </div>
          {showLabels && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Whisone</h1>
              <p className="text-xs text-emerald-600 font-medium">Your AI Second Brain</p>
            </div>
          )}
        </div>

        {/* Collapse button (desktop) + Close (mobile) */}
        {!isMobile ? (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-gray-100 transition-all hover:scale-110"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? <ChevronLeft className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />}
          </button>
        ) : (
          mobileOpen && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl hover:bg-gray-100 lg:hidden"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          )
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
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
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                }
                ${isCollapsed ? "justify-center px-3" : ""}
              `}
            >
              {/* Active indicator bar */}
              {isActive && !isCollapsed && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full" />
              )}

              <div className={`transition-all duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-500 group-hover:text-emerald-600"}`} />
              </div>

              {showLabels && (
                <span className={`font-medium ${isActive ? "text-white" : ""}`}>
                  {item.name}
                </span>
              )}

              {/* Tooltip when collapsed (desktop only) */}
              {isCollapsed && !isMobile && (
                <div className="absolute left-full ml-3 px-4 py-2 bg-gray-900 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-2xl transition-opacity">
                  {item.name}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-0 h-0 border-8 border-transparent border-r-gray-900" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout / Footer */}
      <div className="p-5 border-t border-gray-100">
        <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all group">
          <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
          {showLabels && <span>Log Out</span>}
        </button>

        <p className={`mt-6 text-center text-xs text-gray-500 transition-all duration-300 ${isCollapsed ? "opacity-0" : "opacity-100"}`}>
          © 2025 Whisone <span className="text-emerald-600 mx-1">♥</span> Built for you
        </p>
      </div>
    </aside>
  );
}