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
      toast.success("Notification settings updated");
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const channels = [
    {
      name: "WhatsApp Alerts",
      description: "Get reminders and updates directly in your chat",
      icon: MessageCircle,
      active: true,
      enabled: prefs.whatsapp_notifications,
      onToggle: () => toggle("whatsapp_notifications"),
    },
    {
      name: "Daily Morning Brief",
      description: "Your personalized AI summary every morning",
      icon: Sparkles,
      active: true,
      enabled: prefs.daily_summary,
      onToggle: () => toggle("daily_summary"),
    },
    {
      name: "Email Notifications",
      description: "Important updates delivered to your inbox",
      icon: Mail,
      active: false,
    },
    {
      name: "Push Notifications",
      description: "Instant alerts on your phone",
      icon: Smartphone,
      active: false,
    },
    {
      name: "SMS Alerts",
      description: "Critical reminders via text message",
      icon: Bell,
      active: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-3xl shadow-2xl mb-6">
            <Bell className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Notification Preferences</h1>
          <p className="text-lg text-gray-600 mt-3">
            Choose how your second brain stays in touch
          </p>
        </div>

        <div className="space-y-6">
          {channels.map((channel) => (
            <div
              key={channel.name}
              className={`bg-white rounded-3xl shadow-xl border ${
                channel.active ? "border-gray-100" : "border-gray-200 opacity-75"
              } p-8 transition-all hover:shadow-2xl`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg ${
                    channel.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    <channel.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      {channel.name}
                      {!channel.active && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-600 mt-1">{channel.description}</p>
                  </div>
                </div>

                {channel.active ? (
                  <button
                    onClick={channel.onToggle}
                    disabled={saving}
                    className={`relative w-14 h-8 rounded-full transition-all ${
                      channel.enabled
                        ? "bg-emerald-600"
                        : "bg-gray-300"
                    } ${saving ? "opacity-70" : ""}`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        channel.enabled ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                ) : (
                  <div className="w-14 h-8 bg-gray-200 rounded-full" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Hint */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            You’re always in control. We’ll never spam you — only the good stuff
          </p>
        </div>
      </div>
    </div>
  );
}