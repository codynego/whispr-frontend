// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  BarChart3,
  Sparkles,
  Bell,
  CheckSquare,
  FileText,
  User,
  Settings,
  X,
  Brain,
} from "lucide-react";

interface SidebarProps {
  mobileOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  closeMobile?: () => void;
}

export default function Sidebar({
  mobileOpen,
  isMobile,
  toggleSidebar,
  closeMobile,
}: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (isMobile && mobileOpen) {
      closeMobile?.() || toggleSidebar();
    }
  }, [pathname, isMobile, mobileOpen, closeMobile, toggleSidebar]);

  const navItems = [
    { name: "Overview", icon: BarChart3, href: "/dashboard/overview" },
    { name: "Brain", icon: Sparkles, href: "/dashboard/assistant" },
    { name: "Vault", icon: Brain, href: "/dashboard/vault" },
    { name: "Reminders", icon: Bell, href: "/dashboard/reminders" },
    { name: "Todos", icon: CheckSquare, href: "/dashboard/todos" },
    { name: "Notes", icon: FileText, href: "/dashboard/notes" },
    { name: "Profile", icon: User, href: "/dashboard/profile" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  const handleClick = () => {
    if (isMobile && mobileOpen) {
      toggleSidebar();
    }
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex flex-col
        bg-white border-r border-gray-200
        transition-all duration-300 ease-out
        ${isMobile 
          ? mobileOpen ? "translate-x-0" : "-translate-x-full" 
          : "translate-x-0"
        }
        w-72
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Whisone</h1>
        </div>

        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-2.5 rounded-xl hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleClick}
              className={`
                group relative flex items-center gap-4
                px-4 py-3.5 rounded-2xl text-sm font-medium
                transition-all duration-200
                ${isActive
                  ? "bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-600/10"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 rounded-r-full" />
              )}

              <div className={`transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                <Icon className={`w-5 h-5 ${isActive ? "text-emerald-700" : "text-gray-500 group-hover:text-gray-700"}`} />
              </div>

              <span className="tracking-wide">{item.name}</span>

              {/* Subtle glow on hover */}
              <div className="absolute inset-0 bg-emerald-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-gray-100">
        <p className="text-xs text-center text-gray-500">
          © 2025 Whisone 
          <span className="text-emerald-600 mx-1">♥</span>
          Your second brain
        </p>
      </div>
    </aside>
  );
}