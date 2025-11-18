"use client";

import Link from "next/link";
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
  isOpen: boolean;
  mobileOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, mobileOpen, isMobile, toggleSidebar }: SidebarProps) {
  if (isMobile && !mobileOpen) return null;

  const showFull = isMobile || isOpen;

  const navItems = [
    { name: "Overview", icon: <BarChart2 size={20} />, href: "/dashboard/overview" },
    { name: "Assistant", icon: <Sparkles size={20} />, href: "/dashboard/assistant" },
    { name: "Inbox", icon: <Inbox size={20} />, href: "/dashboard/inbox" },
    { name: "Reminders", icon: <Bell size={20} />, href: "/dashboard/reminders", badge: false },
    { name: "Todos", icon: <CheckSquare size={20} />, href: "/dashboard/todos" },
    { name: "Notes", icon: <FileText size={20} />, href: "/dashboard/notes" },
    { name: "Integrations", icon: <MessageCircle size={20} />, href: "/dashboard/settings/integrations" },
    { name: "Profile", icon: <User size={20} />, href: "/dashboard/profile" },
    { name: "Settings", icon: <Settings size={20} />, href: "/dashboard/settings" },
  ];

  const toggleIcon = isMobile ? <X size={22} /> : isOpen ? <ChevronRight className="rotate-180" size={22} /> : <Menu size={22} />;

  const sidebarClass = `
    fixed inset-y-0 left-0 z-50 flex flex-col
    bg-gradient-to-b from-slate-950 via-slate-900 to-black
    text-gray-100 shadow-2xl border-r border-slate-800
    transition-all duration-500 ease-out
    ${isMobile
      ? `w-full ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`
      : `${isOpen ? "w-64" : "w-20"}`
    }
  `;

  const handleNavClick = () => {
    if (isMobile) toggleSidebar();
  };

  return (
    <aside className={sidebarClass}>
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-xl pointer-events-none" />

      {/* Header: Logo + Toggle */}
      <div className="relative z-10 flex items-center justify-between p-5 border-b border-slate-800/50">
        <div className={`flex items-center gap-3 transition-all ${!showFull && "opacity-0 scale-0"}`}>
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Whisone
          </h1>
        </div>

        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 group relative"
          aria-label="Toggle sidebar"
        >
          {toggleIcon}
          {!showFull && (
            <span className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-slate-700">
              {isOpen ? "Collapse" : "Expand"} Menu
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
            className="
              group relative flex items-center gap-4
              px-4 py-3.5 rounded-2xl
              transition-all duration-300
              hover:bg-white/10 hover:translate-x-1
              text-gray-300 hover:text-white
              font-medium text-sm
            "
          >
            {/* Icon with subtle glow on hover */}
            <div className="
              relative p-2.5 rounded-xl
              bg-slate-800/50 backdrop-blur
              group-hover:bg-gradient-to-br group-hover:from-indigo-500/20 group-hover:to-purple-500/20
              transition-all duration-300
              border border-slate-700/50
            ">
              {item.icon}
            </div>

            {/* Label */}
            {showFull && <span className="tracking-wide">{item.name}</span>}

            {/* Tooltip when collapsed */}
            {!showFull && (
              <span className="
                absolute left-full ml-4 px-3 py-2
                bg-slate-800/95 backdrop-blur-xl text-xs rounded-lg
                opacity-0 group-hover:opacity-100
                transition-all duration-300
                whitespace-nowrap pointer-events-none
                shadow-2xl border border-slate-700
              ">
                {item.name}
              </span>
            )}

            {/* Right chevron when expanded */}
            {showFull && (
              <ChevronRight className="ml-auto w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-all opacity-0 group-hover:opacity-100" />
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
          <div className="w-10 h-10 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-20" />
        )}
      </div>
    </aside>
  );
}