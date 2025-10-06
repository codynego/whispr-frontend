"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Account", href: "/dashboard/settings/account" },
  { name: "Notifications", href: "/dashboard/settings/notifications" },
  { name: "Personality", href: "/dashboard/settings/personality" },
  { name: "Integrations", href: "/dashboard/settings/integrations" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex w-full h-full">
      <aside className="w-56 border-r bg-white p-4">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100",
                pathname === tab.href && "bg-gray-200 text-black"
              )}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">{children}</main>
    </div>
  );
}
