"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  BarChart2,
  Sparkles,
  Inbox,
  Bell,
  CheckSquare,
  FileText,
  MessageCircle,
  User,
  Settings,
  ChevronLeft,
} from "lucide-react";

interface SidebarProps {
  mobileOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ mobileOpen, isMobile, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  // Persisted sidebar state (only for desktop)
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("whisone-sidebar-open");
    return saved ? JSON.parse(saved) === "true" : true;
  });

  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("whisone-sidebar-open", String(isOpen));
    }
  }, [isOpen, isMobile]);

  // Auto-close mobile menu on navigation
  useEffect(() => {
    if (isMobile && mobileOpen) {
      toggleSidebar();
    }
  }, [pathname, isMobile, mobileOpen, toggleSidebar]);

  const showFull = isMobile ? mobileOpen : isOpen;

  const navItems = [
    { name: "Overview", icon: <BarChart2 size={21} />, href: "/dashboard/overview" },
    { name: "Assistant", icon: <Sparkles size={21} />, href: "/dashboard/assistant" },
    { name: "Inbox", icon: <Inbox size={21} />, href: "/dashboard/inbox" },
    { name: "Reminders", icon: <Bell size={21} />, href: "/dashboard/reminders" },
    { name: "Todos", icon: <CheckSquare size={21} />, href: "/dashboard/todos" },
    { name: "Notes", icon: <FileText size={21} />, href: "/dashboard/notes" },
    { name: "Integrations", icon: <MessageCircle size={21} />, href: "/dashboard/settings/integrations" },
    { name: "Profile", icon: <User size={21} />, href: "/dashboard/profile" },
    { name: "Settings", icon: <Settings size={21} />, href: "/dashboard/settings" },
  ];

  const handleToggle = () => {
    if (isMobile) {
      toggleSidebar();
    } else {
      setIsOpen(prev => !prev);
    }
  };

  const sidebarWidth = isMobile
    ? "w-full"
    : isOpen
    ? "w-72"
    : "w-20";

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex flex-col
        bg-gradient-to-b from-gray-900 via-gray-950 to-black
        text-gray-100 border-r border-gray-800
        shadow-2xl transition-all duration-500 ease-out
        ${sidebarWidth} ${mobileOpen ? "translate-x-0" : isMobile ? "-translate-x-full" : ""}
      `}
    >
      {/* Subtle glass effect
      <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6 border-b border-gray-800">
        <div
          className={`flex items-center gap-4 transition-all duration-500 ${
            showFull ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8 pointer-events-none"
          }`}
        >
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl">
            <Sparkles size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Whisone</h1>
            <p className="text-xs text-gray-400">Your AI Life OS</p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          className="p-3 rounded-xl hover:bg-white/10 transition-all group relative"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isMobile ? <X size={26} /> : isOpen ? <ChevronLeft size={26} /> : <Menu size={26} />}
          
          {!showFull && !isMobile && (
            <div className="absolute left-full ml-3 px-4 py-2 bg-gray-800 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-2xl border border-gray-700">
              {isOpen ? "Collapse" : "Expand"} menu
            </div>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => isMobile && toggleSidebar()}
              className={`
                group relative flex items-center gap-4
                px-5 py-4 rounded-2xl transition-all duration-300
                ${isActive 
                  ? "bg-emerald-500/20 text-emerald-400 shadow-lg border border-emerald-500/30" 
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
                }
                hover:translate-x-1
              `}
            >
              <div className={`
                p-3 rounded-xl transition-all duration-300
                ${isActive 
                  ? "bg-emerald-500/20 text-emerald-400" 
                  : "bg-gray-800/50 text-gray-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-400"
                }
              `}>
                {item.icon}
              </div>

              {showFull && (
                <>
                  <span className="font-medium text-base tracking-wide">{item.name}</span>
                  {isActive && <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />}
                </>
              )}

              {/* Tooltip when collapsed */}
              {!showFull && (
                <div className="absolute left-full ml-4 px-4 py-2 bg-gray-800 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-2xl border border-gray-700">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative z-10 p-6 border-t border-gray-800 text-center">
        {showFull ? (
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} <span className="text-emerald-400 font-medium">Whisone</span>
            <br />
            <span className="text-gray-600">Made with <span className="text-red-500">♥</span> for productivity</span>
          </p>
        ) : (
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl opacity-20" />
        )}
      </div>
    </aside>
  );
}