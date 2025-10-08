"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

interface NotificationPreference {
  id: number;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  daily_summary: boolean;
  created_at: string;
  updated_at: string;
}

export default function NotificationsTab() {
  const { accessToken } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreference>({
    id: 0,
    email_notifications: true,
    push_notifications: false,
    sms_notifications: false,
    whatsapp_notifications: false,
    daily_summary: true,
    created_at: "",
    updated_at: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchPreferences = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/preferences/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.status === 401) {
          console.error("Unauthorized");
          return;
        }

        const data = await res.json();
        setPreferences(data);
      } catch (err) {
        console.error("Failed to fetch preferences", err);
        toast.error("Failed to load preferences");
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [accessToken]);

  const handleToggle = async (key: keyof NotificationPreference) => {
    if (!accessToken) return;

    setSaving(true);
    const updatedValue = !preferences[key as keyof NotificationPreference];
    const updatedPreferences = { ...preferences, [key]: updatedValue };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/preferences/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updatedPreferences),
      });

      if (res.ok) {
        setPreferences(updatedPreferences);
        toast.success("Preferences updated");
      } else {
        toast.error("Failed to update preferences");
      }
    } catch (err) {
      console.error("Update error", err);
      toast.error("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Loading preferences...</p>
      </div>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how WhisprAI should keep you updated.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label>Email Alerts</Label>
          <Switch
            checked={preferences.email_notifications}
            onCheckedChange={() => handleToggle("email_notifications")}
            disabled={saving}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Push Notifications</Label>
          <Switch
            checked={preferences.push_notifications}
            onCheckedChange={() => handleToggle("push_notifications")}
            disabled={saving}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>SMS Notifications</Label>
          <Switch
            checked={preferences.sms_notifications}
            onCheckedChange={() => handleToggle("sms_notifications")}
            disabled={saving}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>WhatsApp Alerts</Label>
          <Switch
            checked={preferences.whatsapp_notifications}
            onCheckedChange={() => handleToggle("whatsapp_notifications")}
            disabled={saving}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Daily Summary (morning brief)</Label>
          <Switch
            checked={preferences.daily_summary}
            onCheckedChange={() => handleToggle("daily_summary")}
            disabled={saving}
          />
        </div>
      </CardContent>
    </>
  );
}