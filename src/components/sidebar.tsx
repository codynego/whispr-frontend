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
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  mobileOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ mobileOpen, isMobile, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();

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

  const toggleIcon = isMobile ? <X size={24} /> : <Menu size={24} />;

  const sidebarClass = `
    fixed inset-y-0 left-0 z-50 flex flex-col w-64
    bg-slate-900
    text-gray-100 shadow-2xl border-r border-slate-700
    transition-all duration-300 ease-in-out
    ${isMobile ? (mobileOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
  `;

  const handleNavClick = () => {
    if (isMobile) toggleSidebar();
  };

  return (
    <aside className={sidebarClass}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
            <Sparkles size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Whisone
          </h1>
        </div>

        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200"
            aria-label="Close menu"
          >
            {toggleIcon}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
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
                hover:bg-slate-800 hover:translate-x-1
                text-gray-300 hover:text-white font-medium text-sm
                ${isActive ? "bg-blue-600 text-white shadow-lg" : ""}
              `}
            >
              <div className="transition-all duration-200">
                {item.icon}
              </div>

              <span className="tracking-wide whitespace-nowrap">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-5 border-t border-slate-700/50 text-center">
        <p className="text-xs text-slate-400 tracking-wider">
          © {new Date().getFullYear()} Whisone • Built with <span className="text-blue-400">♥</span> for you
        </p>
      </div>
    </aside>
  );
}