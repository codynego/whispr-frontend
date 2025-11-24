// app/dashboard/settings/notifications/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Bell, MessageCircle, Mail, Smartphone, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Preferences {
  whatsapp_notifications: boolean;
  daily_summary: boolean;
}

export default function NotificationSettings() {
  const { accessToken } = useAuth();
  const [prefs, setPrefs] = useState<Preferences>({
    whatsapp_notifications: true,
    daily_summary: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/preferences/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setPrefs({
            whatsapp_notifications: data.whatsapp_notifications ?? true,
            daily_summary: data.daily_summary ?? true,
          });
        }
      });
  }, [accessToken]);

  const toggle = async (key: keyof Preferences) => {
    const newValue = !prefs[key];
    setSaving(true);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/preferences/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ [key]: newValue }),
      });

      setPrefs(prev => ({ ...prev, [key]: newValue }));
      toast.success("Updated");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const channels = [
    {
      name: "WhatsApp Alerts",
      desc: "Reminders in your chat",
      icon: MessageCircle,
      active: true,
      enabled: prefs.whatsapp_notifications,
      onToggle: () => toggle("whatsapp_notifications"),
    },
    {
      name: "Daily Morning Brief",
      desc: "Your AI summary every morning",
      icon: Sparkles,
      active: true,
      enabled: prefs.daily_summary,
      onToggle: () => toggle("daily_summary"),
    },
    {
      name: "Email Notifications",
      desc: "Coming soon",
      icon: Mail,
      active: false,
    },
    {
      name: "Push Notifications",
      desc: "Coming soon",
      icon: Smartphone,
      active: false,
    },
    {
      name: "SMS Alerts",
      desc: "Coming soon",
      icon: Bell,
      active: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-10">
      <div className="max-w-3xl mx-auto">+
        {/* Compact Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Bell className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">How your second brain reaches you</p>
        </div>

        {/* Compact Cards */}
        <div className="space-y-4">
          {channels.map((c) => (
            <div
              key={c.name}
              className={`bg-white rounded-2xl p-6 shadow-sm border ${
                c.active ? "border-gray-100" : "border-gray-200 opacity-70"
              } flex items-center justify-between transition hover:shadow-md`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  c.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                }`}>
                  <c.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    {c.name}
                    {!c.active && (
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        Soon
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{c.desc}</p>
                </div>
              </div>

              {c.active ? (
                <button
                  onClick={c.onToggle}
                  disabled={saving}
                  className={`relative w-12 h-7 rounded-full transition ${
                    c.enabled ? "bg-emerald-600" : "bg-gray-300"
                  } ${saving ? "opacity-70" : ""}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      c.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              ) : (
                <div className="w-12 h-7 bg-gray-200 rounded-full" />
              )}
            </div>
          ))}
        </div>

        {/* Subtle Footer */}
        <p className="text-center text-xs text-gray-500 mt-10">
          We only send what matters • Never spam
        </p>
      </div>
    </div>
  );
}