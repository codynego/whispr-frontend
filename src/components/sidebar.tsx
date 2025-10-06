"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  MessageCircle,
  Inbox,
  CheckSquare,
  Settings,
  MessageSquareText,
  User,
  BarChart2,
  ChevronRight
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { name: "Overview", icon: <BarChart2 size={18} />, href: "/dashboard/overview" },
    { name: "Assistance", icon: <MessageCircle size={18} />, href: "/dashboard/assistant" },
    { name: "Inbox", icon: <Inbox size={18} />, href: "/dashboard/inbox" },
    { name: "Tasks", icon: <CheckSquare size={18} />, href: "/dashboard/tasks" },
    { name: "WhatsApp", icon: <MessageSquareText size={18} />, href: "/dashboard/whatsapp" },
    { name: "Profile", icon: <User size={18} />, href: "/dashboard/profile" },
    { name: "Settings", icon: <Settings size={18} />, href: "/dashboard/settings" },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-gray-200 h-screen flex flex-col transition-all duration-500 ease-in-out shadow-2xl overflow-hidden relative`}
      >
        {/* Backdrop blur overlay for modern glass effect */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

        {/* Logo and toggle */}
        <div className="relative flex items-center justify-between p-4 border-b border-slate-700/50 z-10">
          <h1 className={`text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent ${!isOpen && "hidden"}`}>
            Whispr
          </h1>
          <button
            onClick={toggleSidebar}
            className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
            {!isOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Menu
              </div>
            )}
          </button>
        </div>

        {/* Nav links */}
        <nav className="relative flex-1 p-3 space-y-2 z-10 mt-2">
          {navItems.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className="group relative flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/50 transition-all duration-200 hover:pl-3 text-gray-300 hover:text-white"
            >
              <div className="relative flex-shrink-0 p-2 bg-slate-800/30 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                {item.icon}
              </div>
              {isOpen && <span className="font-medium text-sm">{item.name}</span>}
              {!isOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.name}
                </div>
              )}
              {isOpen ? (
                <ChevronRight className="ml-auto w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100" />
              ) : null}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="relative p-4 border-t border-slate-700/50 text-xs text-slate-500 z-10">
          {isOpen && <p className="font-light">© {new Date().getFullYear()} Whispr. All rights reserved.</p>}
        </div>
      </aside>
    </div>
  );
}