"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  MessageCircle,
  Inbox,
  CheckSquare,
  Settings,
  FileText,
  Bell,
  User,
  BarChart2,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  mobileOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ mobileOpen, isMobile, toggleSidebar }: SidebarProps) {
  // Persist sidebar state in localStorage (only on desktop)
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("sidebar-open");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const pathname = usePathname();
  const showFull = isMobile ? mobileOpen : isOpen;

  // Save preference whenever it changes
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("sidebar-open", JSON.stringify(isOpen));
    }
  }, [isOpen, isMobile]);

  // Optional: Close mobile sidebar automatically on route change
  useEffect(() => {
    if (isMobile && mobileOpen) {
      toggleSidebar();
    }
  }, [pathname, isMobile, mobileOpen, toggleSidebar]);

  const navItems = [
    { name: "Overview", icon: <BarChart2 size={20} />, href: "/dashboard/overview" },
    { name: "Assistant", icon: <Sparkles size={20} />, href: "/dashboard/assistant" },
    { name: "Inbox", icon: <Inbox size={20} />, href: "/dashboard/inbox" },
    { name: "Reminders", icon: <Bell size={20} />, href: "/dashboard/reminders" },
    { name: "Todos", icon: <CheckSquare size={20} />, href: "/dashboard/todos" },
    { name: "Notes", icon: <FileText size={20} />, href: "/dashboard/notes" },
    { name: "Integrations", icon: <MessageCircle size={20} />, href: "/dashboard/settings/integrations" },
    { name: "Profile", icon: <User size={20} />, href: "/dashboard/profile" },
    { name: "Settings", icon: <Settings size={20} />, href: "/dashboard/settings" },
  ];

  const toggleIcon = isMobile ? (
    <X size={24} />
  ) : isOpen ? (
    <ChevronRight className="rotate-180" size={24} />
  ) : (
    <Menu size={24} />
  );

  const sidebarClass = `
    fixed inset-y-0 left-0 z-50 flex flex-col
    bg-gradient-to-b from-slate-950 via-slate-900 to-black
    text-gray-100 shadow-2xl border-r border-slate-800
    transition-all duration-500 ease-out
    ${isMobile
      ? `w-full ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`
      : isOpen ? "w-64" : "w-20"
    }
  `;

  const handleNavClick = () => {
    if (isMobile) toggleSidebar();
  };

  const handleToggle = () => {
    if (!isMobile) {
      setIsOpen(prev => !prev);
    } else {
      toggleSidebar();
    }
  };

  return (
    <aside className={sidebarClass}>
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-5 border-b border-slate-800/50">
        <div
          className={`flex items-center gap-3 transition-all duration-300 ${
            !showFull ? "opacity-0 scale-0 w-0" : "opacity-100 scale-100"
          }`}
        >
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <Sparkles size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Whisone
          </h1>
        </div>

        <button
          onClick={handleToggle}
          className="p-3 rounded-xl hover:bg-white/10 transition-all duration-300 group relative"
          aria-label={isMobile ? "Close menu" : isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {toggleIcon}
          {!showFull && !isMobile && (
            <span className="absolute left-full ml-3 px-3 py-2 bg-slate-800/95 backdrop-blur-xl text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-2xl border border-slate-700">
              {isOpen ? "Collapse" : "Expand"} menu
            </span>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={handleNavClick}
            className={`
              group relative flex items-center gap-4
              px-4 py-3.5 rounded-2xl
              transition-all duration-300
              hover:bg-white/10 hover:translate-x-1
              text-gray-300 hover:text-white font-medium text-sm
              ${pathname === item.href ? "bg-white/10 text-white shadow-lg" : ""}
            `}
          >
            <div className="relative p-2.5 rounded-xl bg-slate-800/50 backdrop-blur border border-slate-700/50 group-hover:bg-gradient-to-br group-hover:from-indigo-500/20 group-hover:to-purple-500/20 transition-all duration-300">
              {item.icon}
            </div>

            {showFull && <span className="tracking-wide">{item.name}</span>}

            {!showFull && (
              <span className="absolute left-full ml-4 px-3 py-2 bg-slate-800/95 backdrop-blur-xl text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-2xl border border-slate-700">
                {item.name}
              </span>
            )}

            {showFull && (
              <ChevronRight className="ml-auto w-4 h-4 text-slate-500 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="relative z-10 p-5 border-t border-slate-800/50 text-center">
        {showFull ? (
          <p className="text-xs text-slate-500 tracking-wider">
            © {new Date().getFullYear()} Whisone • Built with <span className="text-pink-400">♥</span> for you
          </p>
        ) : (
          <div className="w-10 h-10 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-30" />
        )}
      </div>
    </aside>
  );
}