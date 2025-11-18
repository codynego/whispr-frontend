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

  // Close mobile sidebar automatically on route change
  useEffect(() => {
    if (isMobile && mobileOpen) {
      toggleSidebar();
    }
  }, [pathname]);

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
    <ChevronRight className="rotate-180 transition-transform" size={24} />
  ) : (
    <Menu size={24} />
  );

  const sidebarClass = `
    fixed inset-y-0 left-0 z-50 flex flex-col
    bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
    text-gray-100 shadow-2xl border-r border-slate-700
    transition-all duration-300 ease-in-out
    ${isMobile
      ? `${mobileOpen ? "translate-x-0" : "-translate-x-full"}`
      : isOpen ? "" : ""
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
    <aside 
      className={sidebarClass}
      style={{
        width: isMobile ? (mobileOpen ? '100%' : '0') : (isOpen ? '16rem' : '5rem')
      }}
    >
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-5 border-b border-slate-700/50 min-h-[4.5rem]">
        {showFull && (
          <div className="flex items-center gap-3 transition-opacity duration-300">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <Sparkles size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
              Whisone
            </h1>
          </div>
        )}

        <button
          onClick={handleToggle}
          className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 group relative ml-auto"
          aria-label={isMobile ? "Close menu" : isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {toggleIcon}
          {!showFull && !isMobile && (
            <span className="absolute left-full ml-3 px-3 py-2 bg-slate-800/95 backdrop-blur-xl text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-2xl border border-slate-600">
              Expand menu
            </span>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavClick}
              className={`
                group relative flex items-center gap-4
                px-4 py-3.5 rounded-xl
                transition-all duration-200
                hover:bg-white/10 hover:translate-x-1
                text-gray-300 hover:text-white font-medium text-sm
                ${isActive ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-white shadow-lg border border-emerald-500/30" : ""}
              `}
            >
              <div className={`
                relative p-2.5 rounded-lg transition-all duration-200
                ${isActive 
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg" 
                  : "bg-slate-700/50 group-hover:bg-slate-600/50"
                }
              `}>
                {item.icon}
              </div>

              {showFull && <span className="tracking-wide whitespace-nowrap">{item.name}</span>}

              {!showFull && (
                <span className="absolute left-full ml-4 px-3 py-2 bg-slate-800/95 backdrop-blur-xl text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none shadow-2xl border border-slate-600 z-50">
                  {item.name}
                </span>
              )}

              {showFull && (
                <ChevronRight className={`ml-auto w-4 h-4 transition-all ${isActive ? "text-emerald-400" : "text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-emerald-400"}`} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative z-10 p-5 border-t border-slate-700/50 text-center min-h-[4rem]">
        {showFull ? (
          <p className="text-xs text-slate-400 tracking-wider">
            © {new Date().getFullYear()} Whisone • Built with <span className="text-emerald-400">♥</span> for you
          </p>
        ) : (
          <div className="w-10 h-10 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full opacity-40" />
        )}
      </div>
    </aside>
  );
}