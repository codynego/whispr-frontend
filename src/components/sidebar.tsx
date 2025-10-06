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
  BarChart2
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
      <div
        className={`${
          isOpen ? "w-64" : "w-16"
        } bg-[#0f172a] text-gray-200 h-screen flex flex-col transition-all duration-300 shadow-lg`}
      >
        {/* Logo and toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className={`text-lg font-bold tracking-wide ${!isOpen && "hidden"}`}>Whispr</h1>
          <button onClick={toggleSidebar} className="text-gray-400 hover:text-white">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              {item.icon}
              {isOpen && <span className="font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-700 text-xs text-gray-400">
          {isOpen && <p>© {new Date().getFullYear()} Whispr</p>}
        </div>
      </div>
    </div>
  );
}
